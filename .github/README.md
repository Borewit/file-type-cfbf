# Repository automation

- **Node.js CI** checks pull requests targeting `master`, pushes to `master`, and manual runs on Node.js 20, 22, 24, and 26. New runs cancel older runs for the same pull request or ref. Corepack is installed explicitly because Node.js 25 and later no longer bundle it; the version is pinned to support the full test matrix.
- **Repository Labels** creates missing labels on pushes to `master` or manual runs. Existing labels and their descriptions/colors are preserved. Run this workflow once before enabling Dependabot.
- **Dependabot Pull Request** labels direct npm development dependency updates as `dev-dependencies` and removes `dependencies` if present. It handles PR metadata only and never checks out or executes PR code.
- **Release Drafter** uses the version in `package.json`, updates a draft for that version, and skips versions with an already-published GitHub release. It runs on `master` and groups merged pull requests using `.github/release-drafter.yml`. `DevOps` and `dev-dependencies` changes are excluded. Publishing to npm remains a manual operation.

## Initial GitHub setup

1. Make these files available in the repository's default branch (`master`).
2. Open **Actions** and enable GitHub Actions for the fork if GitHub asks you to do so.
3. Open **Repository Labels**, choose **Run workflow**, and select `master`. Confirm the run succeeds.
4. Open **Settings > Advanced Security**. In the **Dependabot** section, enable **Dependabot version updates**. Forks require this explicit opt-in even when `dependabot.yml` exists.
5. Open **Insights > Dependency graph > Dependabot** and check that both npm and GitHub Actions updates are configured. Use **Check for updates** if available.
6. Run **Node.js CI** manually and check all four matrix jobs. Run **Release Drafter** to prepare the draft for the current package version.

Dependabot checks weekly on Monday at 06:00 UTC. npm updates use the `dependencies` label; `@types/*` development updates are grouped together. GitHub Actions updates use `DevOps`. These workflows use the automatic `GITHUB_TOKEN`; no npm token or personal access token is needed.

## Publishing

Set the intended version in `package.json` before preparing its GitHub release. From the repository directory, run `npm publish` after signing in to npm. The `prepublishOnly` hook builds, lints, and tests the package before publication. Publish the corresponding GitHub release separately when ready.
