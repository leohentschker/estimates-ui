import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Dialog, DialogPortal, DialogTitle } from '../Dialog';
import { DialogContent, DialogDescription, DialogOverlay } from '@radix-ui/react-dialog';
import OutputErrorBoundary from './OutputErrorBoundary';
import { usePyodideOutput } from './pyodideHooks';

interface OutputProps {
  code: string;
}

function Output({
  code
}: OutputProps): React.ReactElement {
  const {
    result,
    loading,
    pyodide,
    stdout,
    loadPyodide,
    isJaspiError,
    isError,
    serializedResult
  } = usePyodideOutput({ code });
  const [isJaspiErrorDialogOpen, setIsJaspiErrorDialogOpen] = useState(false);

  useEffect(() => {
    if (isJaspiError) {
      setIsJaspiErrorDialogOpen(true);
    }
  }, [isJaspiError]);

  return (
    <>
      {/* Dialog for Jaspi error -- see 
      https://v8.dev/blog/jspi-ot, https://developer.chrome.com/blog/webassembly-jspi-origin-trial
       */}
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

      {/* Loading indicator when pyodide is not loaded */}
      <div className="h-full w-full flex flex-col">
        {
          !pyodide && (
            <div className='flex items-center justify-center py-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500'></div>
              <span className='ml-2 text-indigo-600'>Loading estimates...</span>
            </div>
          )
        }

        {/* Loading indicator when proof is being processed */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-2 text-indigo-600">Processing...</span>
          </div>
        )}

        {/* Console output, things from "print" in Python */}
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

        {/* Return result of the editor, if any */}
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

        {/* Button to restart the editor */}
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

/**
 * Wrap our component in an error boundary so that we can catch errors that break out of the editor
 * from Pyodide unexpectedly and enable refreshing the editor.
 */
export default function OutputContainer({
  code
}: {
  code: string;
}) {
  return (
    <div className='lg:flex-2 lg:max-w-1/2 shadow-lg'>
      <OutputErrorBoundary>
        <Output code={code} />
      </OutputErrorBoundary>
    </div>
  )
}
