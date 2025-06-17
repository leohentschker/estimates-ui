import type React from "react";
import { useEffect } from "react";
import { loadCustomPyodide } from "../features/pyodide/pyodideSlice";
import {
  selectMode,
  selectShowCode,
  selectShowTutorial,
} from "../features/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../store";
import CodeEditor from "./CodeEditor";
import ModeSwitcher from "./ModeSwitcher";
import TopBar from "./TopBar";
import TutorialContainer from "./Tutorial";
import VisualEditor from "./VisualEditor";
import AssumptionMode from "./VisualEditor/AssumptionMode";

export default function Estimates(): React.ReactElement {
  // Load pyodide on app startup
  const appDispatch = useAppDispatch();
  useEffect(() => {
    appDispatch(loadCustomPyodide());
  }, [appDispatch]);

  const showTutorial = useAppSelector(selectShowTutorial);
  const showCode = useAppSelector(selectShowCode);
  const mode = useAppSelector(selectMode);

  return (
    <div className="h-screen flex flex-col w-full">
      {/* Desktop top bar */}
      <TopBar />

      <div className="flex-1 flex h-full">
        {/* Togglable tutorial on how to use Estimates */}
        {showTutorial && <TutorialContainer />}

        {/* Main proof editor */}
        <div className="flex flex-col w-full  overflow-y-auto">
          {/* Mode switcher between assumptions and tactics */}
          <ModeSwitcher />

          {/* Assumption mode for the proof graph */}
          {mode === "assumptions" && <AssumptionMode />}

          {/* Visual editor for the proof graph */}
          {mode === "tactics" && <VisualEditor />}
        </div>

        {/* Code editor and outputs */}
        {showCode && <CodeEditor />}
      </div>
    </div>
  );
}
