import React, { useEffect, useState } from "react";
import markdownit from 'markdown-it';
import { getAboutMarkdown } from "../../utils/localeManager";

import "./about.scss";
//import { esteemLogo } from "./esteem-logo";

const md = markdownit();

export const AboutTab = () => {
  const [renderedMarkdown, setRenderedMarkdown] = useState('');

  useEffect(() => {
    getAboutMarkdown()
      .then((markdown) => {
        const html = md.render(markdown);
        setRenderedMarkdown(html);
      });
  }, []);

  return (
    <div className="about-tab">
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{__html: renderedMarkdown}} />
    </div>
  );
};
