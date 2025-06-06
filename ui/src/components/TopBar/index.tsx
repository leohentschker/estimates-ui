import classNames from "classnames";
import { selectShowTutorial, selectShowCode, setShowCode, setShowTutorial, selectExecutionMode, setExecutionMode } from "../../features/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { Button } from "../Button";
import { BookOpen, ChevronDown, Code, Play, Zap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown-menu";
import { convertProofGraphToCode } from "../../features/pyodide/pyodideSlice";

export type UIState = {
  showTutorial: boolean;
  showCode: boolean;
  mode: 'assumptions' | 'tactics';
}

export default function TopBar(): React.ReactElement {
  const showTutorials = useAppSelector(selectShowTutorial);
  const showCode = useAppSelector(selectShowCode);
  const dispatch = useAppDispatch();
  const executionMode = useAppSelector(selectExecutionMode);

  const handleExecutionButtonClick = () => {
    dispatch(convertProofGraphToCode());
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Button
            variant={showTutorials ? "secondary" : "ghost"}
            size="sm"
            className={classNames(
              "h-8 px-2",
              {
                "bg-blue-100 text-blue-700": showTutorials,
              }
            )}
            onClick={() => dispatch(setShowTutorial(!showTutorials))}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Tutorials
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${showCode ? "bg-blue-100 text-blue-700" : ""}`}
            onClick={() => dispatch(setShowCode(!showCode))}
          >
            <Code className="h-4 w-4 mr-1" />
            Code
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex">
          <Button
            variant={executionMode === "auto" ? "secondary" : "tertiary"}
            size="sm"
            onClick={handleExecutionButtonClick}
            className="h-8 rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0"
          >
            {executionMode === "auto" ? (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Auto-compile
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Compile
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={executionMode === "auto" ? "secondary" : "tertiary"}
                size="sm"
                className={
                  classNames(
                    "h-8 w-8 rounded-l-none border-l px-0 focus:ring-0 focus:ring-offset-0",
                    {
                      "border-l-blue-300": executionMode === "auto",
                      "border-l-gray-300": executionMode === "manual",
                    }
                  )
                }
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => dispatch(setExecutionMode("auto"))} className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Auto-compile</span>
                  <span className="text-xs text-gray-500">Run when changes are made</span>
                </div>
                {executionMode === "auto" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch(setExecutionMode("manual"))} className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                <div className="flex flex-col">
                  <span>Manually compile</span>
                  <span className="text-xs text-gray-500">Click to compile and run</span>
                </div>
                {executionMode === "manual" && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}