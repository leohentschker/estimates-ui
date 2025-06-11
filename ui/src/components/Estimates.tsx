import React from 'react';
import CodeEditor from './CodeEditor';
import VisualEditor from './VisualEditor';
import TutorialContainer from './Tutorial';
import useOnce from './hooks';
import { useAppDispatch, useAppSelector } from '../store';
import { loadCustomPyodide } from '../features/pyodide/pyodideSlice';
import TopBar from './TopBar';
import AssumptionMode from './VisualEditor/AssumptionMode';
import { selectShowTutorial, selectShowCode, selectMode } from '../features/ui/uiSlice';
import ModeSwitcher from './ModeSwitcher';

export default function Estimates(): React.ReactElement {
  // Load pyodide on app startup
  const appDispatch = useAppDispatch();
  useOnce(() => {
    appDispatch(loadCustomPyodide());
  }, []);

  const showTutorial = useAppSelector(selectShowTutorial);
  const showCode = useAppSelector(selectShowCode);
  const mode = useAppSelector(selectMode);

  return (
    <div className="h-screen flex flex-col w-full">
      {/* Desktop top bar */}
      <TopBar />

      <div className='flex-1 flex h-full'>
        {/* Togglable tutorial on how to use Estimates */}
        {showTutorial && <TutorialContainer />}

        {/* Main proof editor */}
        <div className='flex flex-col w-full  overflow-y-auto'>
          {/* Mode switcher for assumptions and tactics */}
          <ModeSwitcher />

          {/* Assumption mode for the proof graph */}
          {mode === 'assumptions' && <AssumptionMode />}

          {/* Visual editor for the proof graph */}
          {mode === 'tactics' && <VisualEditor />}
        </div>

        {/* Code editor and outputs */}
        {showCode && <CodeEditor />}
      </div>
    </div>
  );
}
