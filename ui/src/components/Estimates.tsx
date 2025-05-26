import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import Output from './Output';
import Editor from './Editor';

const DEFAULT_PROOF = `
from estimates.main import *
p = split_exercise()
p.use(SplitHyp("h1"))
p.use(SplitHyp("h2"))
p.use(SplitGoal())
p.use(Linarith())
p.use(Linarith())
p.proof()
`.trim();

export default function Estimates(): React.ReactElement {
  const [code, setCode] = useState(
    (() => {
      try {
        const url = new URL(window.location.href);
        const codeParam = url.searchParams.get('code');
        if (codeParam) {
          return atob(codeParam);
        }
      } catch (error) {
        console.error("Failed to decode code from URL:", error);
      }
      return DEFAULT_PROOF;
    })()
  );

  const [debouncedCode] = useDebounce(code, 50);
  useEffect(() => {
    const base64 = btoa(debouncedCode);
    // Update the URL with the encoded code as a parameter
    const url = new URL(window.location.href);
    url.searchParams.set('code', base64);
    window.history.replaceState({}, '', url.toString());
  }, [debouncedCode]);

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      <Editor code={code} setCode={setCode} />
      <Output code={code} />
    </div>
  );
}
