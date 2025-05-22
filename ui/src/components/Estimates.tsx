import React, { useState, useEffect, useMemo } from 'react';
import { loadAndRunPyodide } from '../pyodide-loader';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import { PyodideInterface } from 'pyodide';
import { useDebounce } from 'use-debounce';
import useOnce from './hooks';
import classNames from 'classnames';

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
              className='bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors duration-200'
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

interface ProofProps {
  code: string;
}

function Proof({
  code
}: ProofProps): React.ReactElement {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [stdout, setStdOut] = useState<string[]>([]);

  const addToStdOut = (
    message: string
  ): void => {
    setStdOut(prev => [...prev, message]);
  }

  const loadPyodide = async (): Promise<void> => {
    setPyodide(null);
    setResult(null);
    const pyodide = await loadAndRunPyodide({
      stdout: addToStdOut,
    });
    if (pyodide) {
      setPyodide(pyodide);
    }
  }

  useOnce(() => {
    void loadPyodide();
  }, []);

  const [debouncedCode] = useDebounce(code, 200);

  const runProof = async (): Promise<void> => {
    if (!pyodide) {
      return;
    }
    setLoading(true);
    setResult(null);
    setStdOut([]);
    try {
      const result = await pyodide.runPythonAsync(code);
      setResult(result);
    } catch (error) {
      let errorMessage: string;
      if (error instanceof Error) {
        if (error.message.includes('PythonError')) {
          errorMessage = `Python Error: ${error.message.replace('PythonError: ', '')}`;
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useOnce(() => {
    if (!pyodide) {
      return;
    }
    void runProof();
  }, [debouncedCode, !!pyodide]);

  const serializedResult = useMemo(() => {
    if (!result) {
      return null;
    }
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result, null, 2);
  }, [result]);

  const isError = useMemo(() => {
    return result && typeof result === 'string' && result.includes('Error: Traceback');
  }, [result]);

  return (
    <div className="h-full w-full flex flex-col">
      {
        !pyodide && (
          <div className='flex items-center justify-center py-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500'></div>
            <span className='ml-2 text-indigo-600'>Loading estimates...</span>
          </div>
        )
      }

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-2 text-indigo-600">Processing...</span>
        </div>
      )}
      {
        stdout.length > 0 && (
          <div className='p-4'>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Console Output:</h3>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border-l-4 border-blue-500 whitespace-pre-wrap break-words">
              {stdout.join('\n')}
            </pre>
          </div>
        )
      }
      {
        result && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Result:</h3>
            <pre className={classNames('bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border-l-4', {
              'border-green-500': !isError,
              'border-red-500': isError,
            })}>
              {serializedResult}
            </pre>
          </div>
        )
      }
      <div className='flex-1' />
      {
        pyodide && (
          <div className='flex justify-end'>
            <div
              className='m-5 px-3 py-2 bg-sky-900 text-white rounded-md cursor-pointer hover:bg-sky-800 transition-colors duration-200'
              onClick={loadPyodide}>
              Restart Editor
            </div>
          </div>
        )
      }
    </div>
  );
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
    <div className="h-screen grid grid-cols-5">
      <div className='col-span-3 h-full p-1 flex flex-col'>
        <div className='rounded-md border border-pink-300 flex-1 p-3'>
          <AceEditor
            mode="python"
            theme="tomorrow"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            onChange={setCode}
            value={code}
            height='100%'
            width='100%'
            fontSize={16}
            lineHeight={28}
          />
        </div>
      </div>
      <div className='col-span-2'>
        <ErrorBoundary>
          <Proof code={code} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
