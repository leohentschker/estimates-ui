import { useMemo } from "react";
import katex from "katex";

export default function LatexString({ latex }: { latex: string }) {
  const renderedContent = useMemo(() => {
    if (!latex) return '';
    try {
      const rendered = katex.renderToString(latex);
      return rendered;
    } catch (error) {
      return latex;
    }
  }, [latex]);
  return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
}
