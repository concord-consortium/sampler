# CODAP Sampler Plugin

The Sampler is a plugin for [CODAP](https://codap.concord.org). It builds probability models out of
three kinds of device — a mixer, a spinner, or a collector drawing from an existing dataset — runs
experiments against them, and sends the samples to CODAP as data to analyze.

It is a React application written in TypeScript and bundled with webpack. It talks to CODAP through
[@concord-consortium/codap-plugin-api](https://github.com/concord-consortium/codap-plugin-api).

## Development

1. Clone this repo and `cd` into it
2. Run `npm install` to pull dependencies
3. Run `npm start` to run `webpack-dev-server` in development mode with hot module replacement

The dev server listens on port 8080. If something already holds that port — a locally running copy
of CODAP, for instance — webpack takes the next free one and prints the URL it settled on, so read
its output rather than assuming 8080.

## Testing the plugin in CODAP

CODAP is served over `https` and will not load a plugin over `http`, so the dev server needs a
certificate of its own. `npm run start:secure` serves over `https`, using a key and certificate at
`~/.localhost-ssl/localhost.key` and `~/.localhost-ssl/localhost.crt`.

With that running, point CODAP at it with the `di` query parameter:

https://codap3.concord.org/branch/main/?di=https://localhost:8080

Alternatively, run CODAP locally: download a `build_[...].zip` from
https://codap.concord.org/releases/zips/, extract it, and serve it. A local CODAP over `http` will
load a plugin over `http`, so `npm start` is enough. Both CODAP and this dev server default to port
8080, so one of the two has to move.

## Testing

- `npm test` — the Jest unit suite
- `npm run test:cypress` — the Cypress end-to-end suite. It does not start the dev server; run
  `npm start` alongside it, or use `npm run test:full`.
- `npm run lint` — eslint

## Updating translations

The translations are maintained in POEditor. To update the translation strings stored in
`src/utils/pulled-strings.json` run:

`npm run strings:pull -- APITOKEN` where `APITOKEN` is visible for your account at
https://poeditor.com/account/api.

The Sampler does not have a POEditor project of its own. Its strings currently live in the **CODAP**
project (`125447`), which is why the API token has to be one with access to that project, and why
`scripts/pull-strings.js` pulls the whole project and then keeps only the strings whose IDs begin
with `DG.Plugin.Sampler.`. The intent is to move these strings to their own project eventually, at
which point the project code and the prefix filter in that script both need revisiting.

## Releasing

1. Raise the version in `package.json`, `package-lock.json`, and `kVersion` in `src/constants.ts`,
   and merge that to `main`.

2. Tag the merge commit and push the tag:

   ```
   git tag v1.2.3
   git push origin v1.2.3
   ```

   Pushing a tag builds it and deploys it to `models-resources/sampler/version/v1.2.3/`, where it
   can be run on its own without being the released version.

3. Run the **Release** workflow from the Actions tab, giving the tag as the `version` input. It
   copies that version's `index-top.html` over the top-level `index.html`, which is what
   https://sampler.concord.org serves. Until this step runs, the new version is deployed but not
   released.

Deploys authenticate to AWS with OIDC, assuming the `sampler` IAM role; there are no AWS credentials
stored in this repository. See
[doc/deploy-setup.md](https://github.com/concord-consortium/starter-projects/blob/main/doc/deploy-setup.md)
in `starter-projects` for how that role is set up.
