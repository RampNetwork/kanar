# CliCop
![CliCop logo](clicop.png)


CliCop is an Github Actions action that enforces pinning ticket id reference in a PR.\
It will fail if there is no task id in PR title.\
It utilizes [DangerJS](https://danger.systems/js/) to perform the check.

## Inputs
github_token - Github authentification token.
jira_token - Jira authentification token.

## Testing
The action conitains some unit tests. To run them:
```bash
npm install --only=dev
npm test
```

## Example usage
```yaml
name: CliCop

on:
  pull_request:
    - opened
    - reopened
    - synchronize
    - edited

permissions:
  contents: read
  pull-requests: write
  issues: write
  statuses: write

jobs:
  clicop:
    runs-on: ubuntu-latest
    steps:
      - uses: RampNetwork/github-actions/clicop@clicop-v1.0.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }} # this is passed automatically https://docs.github.com/en/actions/security-guides/automatic-token-authentication
          jira_token: ${{ secrets.JIRA_TOKEN }}
```
