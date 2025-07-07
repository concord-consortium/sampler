import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getAboutMarkdown } from "../../utils/localeManager";

import "./about.scss";
//import { esteemLogo } from "./esteem-logo";

export const AboutTab = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    getAboutMarkdown()
      .then(setMarkdown);
  }, []);

  return (
    <div className="about-tab">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};
