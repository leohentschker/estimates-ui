import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import Proof from './Proof';
import Editor from './Editor';

class ErrorBoundary extends React.Component<{ children?: React.ReactNode }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className='p-4'>
          <pre className='bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border-l-4 border-red-500 whitespace-pre-wrap break-words'>
            {String(this.state.error)}
          </pre>
          <div className='mt-4'>
            <button
              className='bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors duration-200 w-full'
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


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
      <div className='lg:flex-3 h-full p-1 flex flex-col min-h-[30vh]'>
        <Editor code={code} setCode={setCode} />
      </div>
      <div className='lg:flex-2 lg:max-w-1/2 shadow-lg'>
        <ErrorBoundary>
          <Proof code={code} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
