import * as core from "@actions/core";
import * as github from "@actions/github";

const githubToken: string = core.getInput("github-token", { required: true });
const baseBranch: string = core.getInput("base-branch");
const majorReleaseTag: string = core.getInput("major-release-tag");
const minorReleaseTag: string = core.getInput("minor-release-tag");
const patchReleaseTag: string = core.getInput("patch-release-tag");

const octokit = github.getOctokit(githubToken);
const context = github.context;

async function main() {
  const pullRequestLabels = await octokit.rest.issues.listLabelsOnIssue({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  console.log(pullRequestLabels); // Test
}

main();
