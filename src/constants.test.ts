import { kVersion } from "./constants";
import packageJson from "../package.json";

// kVersion is what the plugin reports into CODAP; package.json is what the release is tagged and
// deployed as. A release has to raise both by hand, in separate files, and nothing else holds them
// together — so this is the thing that notices when only one of them moved.
describe("kVersion", () => {
  it("matches the version in package.json", () => {
    expect(kVersion).toBe(`v${packageJson.version}`);
  });
});
