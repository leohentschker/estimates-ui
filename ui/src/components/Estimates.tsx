import React from 'react';
import Output from './Output';
import Editor from './Editor';
import TutorialContainer from './Tutorial';
import useOnce from './hooks';
import { useAppDispatch } from '../store';
import { loadCustomPyodide } from '../features/pyodide/pyodideSlice';

export default function Estimates(): React.ReactElement {
  const appDispatch = useAppDispatch();
  useOnce(() => {
    appDispatch(loadCustomPyodide());
  }, []);
  return (
    <div className="h-screen flex flex-col lg:flex-row">
      <TutorialContainer />
      <Editor />
      <Output />
    </div>
  );
}
