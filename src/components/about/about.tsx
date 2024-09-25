import React from "react";

import "./about.scss";

export const AboutTab = () => {
  return (
    <div className="about-tab">
      <p>The CODAP Sampler plugin can randomly choose items placed in a mixer, choose items based on sector sizes of a spinner, or choose cases from a collection of data.</p>
      <p><b>Select &lt;n&gt; items</b> determines the sample size,</p>
      <p><b>Collect &lt;n&gt; samples</b> controls how many samples to repeat in a given experiment.</p>
      <p>The speed of sampling can be controlled, as well as whether to sample with or without replacement (in Options tab). The data generated from the Sampler will appear in a hierarchical table. The top level represents the experiment (one complete run of a simulation) and allows you to compute statistics about an entire experiment. The next level contains information about each sample and allows one to compute statistics about each sample. The items level shows each individual value drawn from the Sampler. This </p>
    </div>
  );
};
