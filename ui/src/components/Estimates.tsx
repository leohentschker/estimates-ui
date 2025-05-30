import React from 'react';
import CodeEditor from './CodeEditor';
import VisualEditor from './VisualEditor';
import TutorialContainer from './Tutorial';
import useOnce from './hooks';
import { useAppDispatch } from '../store';
import { loadCustomPyodide } from '../features/pyodide/pyodideSlice';

export default function Estimates(): React.ReactElement {
  // Load pyodide on app startup
  const appDispatch = useAppDispatch();
  useOnce(() => {
    appDispatch(loadCustomPyodide());
  }, []);

  return (
    <div className="h-screen flex w-full">

      {/* Shown on desktop only, contains tutorial on how to use Estimates */}
      <TutorialContainer />
      <div className='h-screen flex w-full'>
        {/* Visual editor for the proof graph */}
        <VisualEditor />
        {/* Code editor and outputs */}
        <CodeEditor />
      </div>
    </div>
  );
}
