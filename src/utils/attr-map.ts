import type { AttrMap } from "../types";
import { tr } from "./localeManager";

export const defaultAttrMap: AttrMap = {
  experiment: {codapID: null, name: tr("DG.Plugin.Sampler.dataset.attr-experiment")},
  description: {codapID: null, name: tr("DG.Plugin.Sampler.dataset.attr-description")},
  sample_size: {codapID: null, name: tr("DG.Plugin.Sampler.dataset.attr-sample_size")},
  until_formula: {codapID: null, name: tr("DG.Plugin.Sampler.dataset.attr-until_formula")},
  experimentHash: {codapID: null, name: "experimentHash"},
  sample: {codapID: null, name: tr("DG.Plugin.Sampler.dataset.attr-sample")},
};
