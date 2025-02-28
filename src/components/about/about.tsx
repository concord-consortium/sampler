import React from "react";

import "./about.scss";
import { esteemLogo } from "./esteem-logo";

export const AboutTab = () => {
  return (
    <div className="about-tab">
      <h2>Building Sampler Models</h2>
      <p>
        Use the Sampler to build a model that randomly samples “items” from one of three different devices:
        1) a <strong>Mixer</strong> representing items as placed in a container,
        2) a <strong>Spinner</strong> that chooses items from sectors of a circle, and
        3) a <strong>Collector</strong> that chooses cases (rows) from a dataset.
      </p>
      <p>
        Use the <strong>+</strong>, <strong>-</strong>, and <strong>...</strong> buttons
        to change the items contained in a <strong>Mixer</strong> or <strong>Spinner</strong>.
        Click on item labels to edit. In the spinner, click on a sector to edit the label or percentage for the sector. You can also change the percentage by dragging the edges of sectors in the Spinner.
      </p>
      <p>
        Change the number of items to <strong>Select</strong> in each sample by editing the number
        of items. You can also change the number of <strong>Samples</strong> to collect in each experiment.
        Sampling is done <strong>with replacement</strong> by default but can be changed to <strong>without replacement</strong>.
      </p>
      <p>
        You can change Select to <strong>Repeat</strong> and use the <strong>Until</strong> box
        to define a condition for when to stop sampling.
      </p>
      <p>
        The default attribute name of a device is <strong>output</strong>, but you can edit
        this to be an attribute name appropriate to your model.
      </p>
      <p>
        Press <strong>START</strong> to select items for each sample. Control the <strong>Speed</strong> of
        sampling using the slider next to the <strong>STOP</strong> button.
      </p>
      <p>
        Press <strong>Clear Data</strong> to delete all items sampled thus far.
      </p>
      <p>
        For building models of more complexity and steps (like creating cats that have a sex and weight),
        use the <strong>Add Device</strong> button to add Mixers or Spinners and create models for each step in an experiment.
        You can even create conditions using the text boxes in between devices to define when the simulation advances to each device.
      </p>
      <p>
        To create a mystery model, hide the device using its <strong>Eye icon</strong>.
      </p>
      <p>
        Use the <strong>Measures</strong> tab to create common measures (e.g., count, sum, mean) for each sample.
      </p>

      <h2>Sampler Results</h2>
      <p>
        The items selected by the Sampler first appear in a vertical list to the right of the device(s)
        before being transferred to a three-level, hierarchical Sampler Data table in CODAP.
        The top level represents the <strong>experiment</strong>. It keeps track of the sample size and other
        model parameters. Define additional attributes at this level to compute statistics about an entire experiment.
        The middle level contains information about each <strong>sample</strong>. Measures can be constructed with
        the aid of the Measures tab or directly in CODAP by creating an attribute with a formula.
        The <strong>items</strong> level shows the attributes and values produced by the Sampler during a simulation run.
      </p>

      <h2>Funding</h2>
      <div className="funding">
        <p>
          The Sampler in CODAP was inspired by the Sampler in <a href="http://www.tinkerplots.com/" target="_blank" rel="noreferrer">TinkerPlots</a>.
          It was developed by the <a href="https://concord.org/" target="_blank" rel="noreferrer">Concord Consortium</a> as part of
          the <a href="https://fi.ncsu.edu/projects/esteem/" target="_blank" rel="noreferrer">ESTEEM project</a> with support by the
          National Science Foundation under Grant Nos. DUE <span className="nsf-grant-id">1625713</span> and <span className="nsf-grant-id">2141727</span>
          awarded to North Carolina State University. Any opinions, findings, and conclusions or recommendations in this material are those of the
          principal investigators and do not necessarily reflect the views of the National Science Foundation.
        </p>
        <div>
          <img src={esteemLogo}></img>
        </div>
      </div>

    </div>
  );
};
