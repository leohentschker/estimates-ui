import React, { useState, useEffect, useMemo } from 'react';
import { loadAndRunPyodide } from '../pyodide-loader';
import { useDebounce } from 'use-debounce';
import useOnce from './hooks';
import classNames from 'classnames';
import { Dialog, DialogPortal, DialogTitle } from './Dialog';
import { DialogContent, DialogDescription, DialogOverlay } from '@radix-ui/react-dialog';
import { PyodideInterface } from 'pyodide';

interface ProofProps {
  code: string;
}

export default function Proof({
  code
}: ProofProps): React.ReactElement {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [stdout, setStdOut] = useState<string[]>([]);
  const [isJaspiErrorDialogOpen, setIsJaspiErrorDialogOpen] = useState(false);

  const addToStdOut = (
    message: string
  ): void => {
    setStdOut(prev => [...prev, message]);
  }

  const loadPyodide = async (): Promise<void> => {
    setPyodide(null);
    setResult(null);
    setStdOut([]);
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

  const isJaspiError = useMemo(() => {
    return result && typeof result === 'string' && result.includes('WebAssembly stack switching not supported in this JavaScript runtime');
  }, [result]);

  useEffect(() => {
    if (isJaspiError) {
      setIsJaspiErrorDialogOpen(true);
    }
  }, [isJaspiError]);

  return (
    <>
      <Dialog
        open={isJaspiErrorDialogOpen}
        onOpenChange={setIsJaspiErrorDialogOpen}
      >
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/40 z-50" />
          <DialogContent className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
            <DialogTitle>
              Browser Compatibility Error
            </DialogTitle>
            <DialogDescription className='mt-4'>
              The web version of estimates only works in Chrome because it relies on a new feature of WebAssembly that is not yet supported in other browsers.
              See <a className='text-blue-500 cursor-pointer underline' href="https://developer.chrome.com/blog/webassembly-jspi-origin-trial" target="_blank" rel="noopener noreferrer">this Chrome blog post</a> about WebAssembly JavaScript Promise Integration (JSPI) to learn more.
            </DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>

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
              <pre className={classNames('bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border-l-4  whitespace-pre-wrap break-words', {
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
            <div className='flex justify-end w-full'>
              <div
                className='m-5 px-3 py-2 bg-sky-900 text-white rounded-md cursor-pointer hover:bg-sky-800 transition-colors duration-200 w-full text-center w-full lg:w-fit'
                onClick={loadPyodide}>
                Restart Editor
              </div>
            </div>
          )
        }
      </div>
    </>
  );
}