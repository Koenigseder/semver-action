# Semver action

This GitHub Action can be used to easily create [SemVer](https://semver.org/) releases, based on labels set in a Pull
Request.

## How to use it

Add a new GitHub workflow in the `.github/workflows` folder like this:

```yaml
name: Create new release

on:
  pull_request:
    types:
      - closed
    branches:
      - develop

jobs:
  create-release:
    name: Create new release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Create release
        id: create-release
        uses: Koenigseder/semver-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          release-body: ${{ github.event.pull_request.body }} # Optional
          base-branch: develop # Optional
          semver-prefix: v # Optional
          semver-start-version: 2.0.0 # Optional
          major-release-label: major release # Optional
          minor-release-lable: minor release # Optional
          patch-release-label: patch release # Optional
```

This workflow will create a new release each time a Pull Request gets merged into the `develop` branch, starting with
`v2.0.0` in case the is no release so far.

## Inputs and outputs

### Inputs

| Property               | Description                                                         | required | Default value                       |
|------------------------|---------------------------------------------------------------------|----------|-------------------------------------|
| `github-token`         | GitHub token (e.g. `$GITHUB_TOKEN`)                                 | `yep`    |                                     |
| `release-body`         | The description of the new release                                  | `nope`   | Defaults to the last commit message |
| `base-branch`          | The base branch to create the release from                          | `nope`   | `master`                            |
| `semver-prefix`        | A prefix like 'v' in front of the version number                    | `nope`   |                                     |
| `semver-start-version` | If there is no release so far, start with this                      | `nope`   | `1.0.0`                             |
| `major-release-label`  | Name of the label that is used to determine if it's a major release | `nope`   | `major change`                      |
| `minor-release-label`  | Name of the label that is used to determine if it's a minor release | `nope`   | `minor change`                      |
| `patch-release-label`  | Name of the label that is used to determine if it's a patch release | `nope`   | `patch change`                      |

### Outputs

| Property              | Description                                                         |
|-----------------------|---------------------------------------------------------------------|
| `new-release-tag`     | The newly created semver tag                                        |
| `major-release-label` | Name of the label that is used to determine if it's a major release |
| `minor-release-label` | Name of the label that is used to determine if it's a minor release |
| `patch-release-label` | Name of the label that is used to determine if it's a patch release |
