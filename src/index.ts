import * as core from "@actions/core";
import * as github from "@actions/github";
import { ReleaseType } from "./types";

const githubToken: string = core.getInput("github-token", { required: true });
const baseBranch: string = core.getInput("base-branch");
const semverPrefix: string = core.getInput("semver-prefix");
const semverStartVersion: string = core.getInput("semver-start-version");
const majorReleaseTag: string = core.getInput("major-release-tag");
const minorReleaseTag: string = core.getInput("minor-release-tag");
const patchReleaseTag: string = core.getInput("patch-release-tag");

const octokit = github.getOctokit(githubToken);
const context = github.context;

async function getReleaseType(): Promise<ReleaseType | null> {
  const { data } = await octokit.rest.issues.listLabelsOnIssue({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  for (const label of data) {
    const labelName: string = label.name;

    if (labelName === majorReleaseTag) {
      return ReleaseType.Major;
    } else if (labelName === minorReleaseTag) {
      return ReleaseType.Minor;
    } else if (labelName === patchReleaseTag) {
      return ReleaseType.Patch;
    }
  }

  return null;
}

async function getLatestReleaseTag(): Promise<string | null> {
  let latestReleaseTag: string | null = null;
  await octokit.rest.repos
    .getLatestRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
    })
    .then((result) => {
      latestReleaseTag = result.data.tag_name;
    })
    .catch(() => {
      latestReleaseTag = null;
    });

  return latestReleaseTag;
}

function getNextReleaseTag(
  releaseType: ReleaseType,
  latestReleaseTag: string | null
): string | null {
  if (!latestReleaseTag) return semverStartVersion;

  const [major, minor, patch] = latestReleaseTag.split(".");

  if (releaseType === ReleaseType.Patch) {
    return `${semverPrefix}${major}.${minor}.${+patch + 1}`;
  }

  if (releaseType === ReleaseType.Minor) {
    return `${semverPrefix}${major}.${+minor + 1}.${patch}`;
  }

  if (releaseType === ReleaseType.Major) {
    return `${semverPrefix}${+major + 1}.${minor}.${patch}`;
  }

  return null;
}

async function main() {
  const releaseType: ReleaseType | null = await getReleaseType();
  if (!releaseType) {
    console.log("No label set!");
    return;
  }

  const latestReleaseTag: string | null = await getLatestReleaseTag();

  const nextReleaseTag: string | null = getNextReleaseTag(
    releaseType,
    latestReleaseTag
  );

  console.log(nextReleaseTag);
}

main();
