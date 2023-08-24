import * as core from "@actions/core";
import * as github from "@actions/github";
import { ReleaseType } from "./types";

const githubToken: string = core.getInput("github-token", { required: true });
const baseBranch: string = core.getInput("base-branch");
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

function getNextReleaseTag(latestReleaseTag: string | null): string {
  if (!latestReleaseTag) return semverStartVersion;

  return "";
}

async function main() {
  const releaseType: ReleaseType | null = await getReleaseType();
  if (!releaseType) return;

  const latestReleaseTag: string | null = await getLatestReleaseTag();

  const nextReleaseTag: string = getNextReleaseTag(latestReleaseTag);

  console.log(nextReleaseTag);
}

main();
