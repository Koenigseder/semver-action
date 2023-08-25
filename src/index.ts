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
  if (!latestReleaseTag) return `${semverPrefix}${semverStartVersion}`;

  const [major, minor, patch] = latestReleaseTag
    .replace(semverPrefix, "")
    .split(".");

  if (releaseType === ReleaseType.Patch) {
    return `${semverPrefix}${major}.${minor}.${+patch + 1}`;
  }

  if (releaseType === ReleaseType.Minor) {
    return `${semverPrefix}${major}.${+minor + 1}.0`;
  }

  if (releaseType === ReleaseType.Major) {
    return `${semverPrefix}${+major + 1}.0.0`;
  }

  return null;
}

async function createNewTagAndRelease(newTag: string) {
  await octokit.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: newTag,
    target_commitish: baseBranch,
    name: newTag,
  });
}

async function main() {
  core.setOutput("major-release-tag", majorReleaseTag);
  core.setOutput("minor-release-tag", minorReleaseTag);
  core.setOutput("patch-release-tag", patchReleaseTag);

  const releaseType: ReleaseType | null = await getReleaseType();
  if (!releaseType) {
    console.log("No valid label set!");
    return;
  }

  const latestReleaseTag: string | null = await getLatestReleaseTag();

  const nextReleaseTag: string | null = getNextReleaseTag(
    releaseType,
    latestReleaseTag
  );

  if (!nextReleaseTag) {
    console.log("Cannot compute new release tag!");
    return;
  }

  await createNewTagAndRelease(nextReleaseTag);

  core.setOutput("new-release-tag", nextReleaseTag);
}

main();
