# CODAP Sampler Plugin

The Sampler is a plugin for [CODAP](https://codap.concord.org). It builds probability models out of
three kinds of device — a mixer, a spinner, or a collector drawing from an existing dataset — runs
experiments against them, and sends the samples to CODAP as data to analyze.

It is a React application written in TypeScript and bundled with webpack. It talks to CODAP through
[@concord-consortium/codap-plugin-api](https://github.com/concord-consortium/codap-plugin-api).

## The condition that ends a repetition

In repeat mode the Sampler keeps drawing items into a single sample until a condition says to stop,
rather than until a fixed sample size is reached. The **Condition to End Repetition** dialog
(`src/components/model/repeat-until-modal.tsx`) offers two conditions: **Expression or Pattern**, and
**Unique Values**. What the first accepts is not obvious from the dialog, so it is written out here.

### Expression or pattern

One text field takes either form, and a heuristic decides which one was typed
(`isPattern` in `src/utils/pattern.ts`). It is read as a **pattern** if it is a single bare token of
letters, digits, `_` and `.`, or if it contains a comma and no parentheses; otherwise it is read as
an **expression**. So `a`, `a,b,a` and `cat, dog` are patterns, while `output = "a"` and
`count(x) > 2` are expressions.

A **pattern** is a comma-separated sequence of values, each trimmed. The repetition ends as soon as
those values appear as a *consecutive run* among the items drawn so far, for any one of the output
attributes — `a,b,a` means an `a`, then a `b`, then an `a`, back to back.

An **expression** is passed verbatim to CODAP's formula engine (`evaluateResult` in
`src/helpers/codap-helpers.tsx` sends an `evalExpression` request), so the syntax it accepts is
CODAP's formula language, documented under
[Enter a Formula for an Attribute](https://codap.concord.org/help/work-functions/enter-formula-attribute)
and the [function list](https://codap.concord.org/help/functions): the comparisons `=`, `!=`, `<`,
`<=`, `>`, `>=`, the boolean operators `&`, `|`, `and`, `or`, `AND`, `OR`, arithmetic, parentheses,
and CODAP's functions. The dialog's own example, `sex = "male" AND height > 5`, is one of these.

Two things follow from evaluating it in CODAP rather than here:

- **Nothing quotes for you.** String values need their own quotes. `sex = "male"` compares against
  the string; `sex = male` reaches CODAP as a reference to an attribute named `male` and will not
  match. This differs from the branching formulas on a device, which *are* parsed and quoted locally.
- **Only the current item is in scope.** The expression is evaluated once per draw, against a single
  record whose keys are the output attribute names and whose values are the item just drawn. Earlier
  items in the sample cannot be referenced, so a condition that has to look across the accumulated
  items — a count, a run, an average — belongs in a pattern or in the unique-values condition instead.

The expression is not parsed or validated before it is sent, so a malformed one surfaces as an error
when the experiment runs rather than when it is entered.

`src/utils/formula-parser.ts` is a full expression grammar living in this repo and is easy to mistake
for the above. It is not involved: it parses the **branching formulas** that route an item from one
device to the next, which is where `parseFormula`, `formatFormula` and `validateFormula` are used.

### Unique values

The other condition (`src/utils/unique-values.ts`) ends the repetition once the items drawn contain
exactly the requested number of distinct values for any one output attribute. The model header
displays this as `uniqueValues() = 3`, which reads like a function call but is only a label — it
cannot be typed into the expression field.

### The ceiling

Either way, a sample stops after 1000 items (`maxRepeatUntilItems` in `src/hooks/useAnimation.tsx`).
A condition that never comes true therefore aborts the experiment with an error naming the formula,
rather than running forever.

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
- `npm run test:cypress` — the Cypress end-to-end suite
- `npm run test:full` — both suites in sequence
- `npm run lint` — eslint

Neither `test:cypress` nor `test:full` starts the dev server, and Cypress fails on `cy.visit("")`
without one. Run `npm start` in another terminal first. CI does not hit this because the Cypress job
lets `cypress-io/github-action` start the server through its own `start:` input.

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
   and merge that to `main`. `npm version <version> --no-git-tag-version` does the first two;
   `kVersion` is by hand. A unit test fails if the two get out of step, so forgetting one of them
   fails CI rather than shipping a mismatch.

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
