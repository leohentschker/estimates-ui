import { useMemo } from "react";
import katex from "katex";

export default function LatexString({ latex }: { latex: string }) {
  const renderedContent = useMemo(() => {
    if (!latex) return '';
    try {
      const rendered = katex.renderToString(latex);
      return rendered;
    } catch (error) {
      console.error(error);
      return latex;
    }
  }, [latex]);
  return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />;
}
