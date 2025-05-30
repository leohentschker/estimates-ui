import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Dialog, DialogPortal, DialogTitle } from '../Dialog';
import { DialogContent, DialogDescription, DialogOverlay } from '@radix-ui/react-dialog';
import OutputErrorBoundary from './OutputErrorBoundary';
import { loadCustomPyodide, runProof, selectCode, selectIsJaspiError, selectLoading, selectProofError, selectPyodideLoaded, selectSerializedResult, selectStdout } from '../../features/pyodide/pyodideSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { useDebounce } from 'use-debounce';
import TextEditor from './TextEditor';

function Output(): React.ReactElement {
  const appDispatch = useAppDispatch();

  const [isJaspiErrorDialogOpen, setIsJaspiErrorDialogOpen] = useState(false);
  const pyodideLoaded = useAppSelector(selectPyodideLoaded);
  const isJaspiError = useAppSelector(selectIsJaspiError);
  const serializedResult = useAppSelector(selectSerializedResult);
  const stdout = useAppSelector(selectStdout);
  const loading = useAppSelector(selectLoading);
  const code = useAppSelector(selectCode);
  const proofError = useAppSelector(selectProofError);

  const [debouncedCode] = useDebounce(code, 200);

  useEffect(() => {
    if (isJaspiError) {
      setIsJaspiErrorDialogOpen(true);
    }
  }, [isJaspiError]);

  useEffect(() => {
    if (!pyodideLoaded) {
      return;
    }
    if (debouncedCode) {
      appDispatch(runProof(debouncedCode));
    }
  }, [pyodideLoaded, debouncedCode]);

  return (
    <div className='h-full flex flex-col'>
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

      <div className='flex-1'>
        <TextEditor />
      </div>

      {/* Loading indicator when pyodide is not loaded */}
      <div className="flex-1 flex flex-col border-t border-gray-200 overflow-y-auto">
        {
          !pyodideLoaded && (
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
          (serializedResult || proofError) && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Result:</h3>
              <pre className={classNames('bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border-l-4  whitespace-pre-wrap break-words', {
                'border-green-500': !proofError,
                'border-red-500': proofError,
              })}>
                {serializedResult || proofError}
              </pre>
            </div>
          )
        }

        {/* Button to restart the editor */}
        <div className='flex-1' />
        {
          pyodideLoaded && (
            <div className='flex justify-end w-full'>
              <div
                className='m-5 px-3 py-2 bg-sky-900 text-white rounded-md cursor-pointer hover:bg-sky-800 transition-colors duration-200 w-full text-center w-full lg:w-fit'
                onClick={() => appDispatch(loadCustomPyodide())}>
                Restart Editor
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

/**
 * Wrap our component in an error boundary so that we can catch errors that break out of the editor
 * from Pyodide unexpectedly and enable refreshing the editor.
 */
export default function OutputContainer() {
  return (
    <div className='w-full 2xl:w-1/2 lg:max-w-lg shadow-lg'>
      {/* Pyodide has a tendency to break out of component error handling, so we wrap the component in an error boundary */}
      <OutputErrorBoundary>
        <Output />
      </OutputErrorBoundary>
    </div>
  )
}
