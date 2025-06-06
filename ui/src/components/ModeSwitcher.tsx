import { PenTool, FileLineChartIcon } from "lucide-react";
import { Button } from "./Button";
import { useAppSelector } from "../store";
import { useAppDispatch } from "../store";
import { selectMode, setMode } from "../features/ui/uiSlice";
import { TypographyH2 } from "./Typography";

export default function ModeSwitcher(): React.ReactElement {
  const viewMode = useAppSelector(selectMode);
  const dispatch = useAppDispatch();

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <TypographyH2 className="text-xl">
          {viewMode === "assumptions" ? "Assumptions Mode" : "Tactics Mode"}
        </TypographyH2>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === "assumptions" ? "primary" : "ghost"}
            size="sm"
            onClick={() => dispatch(setMode("assumptions"))}
            className="h-8 w-32 justify-center"
          >
            <PenTool className="h-4 w-4 mr-1" />
            Assumptions
          </Button>
          <Button
            variant={viewMode === "tactics" ? "primary" : "ghost"}
            size="sm"
            onClick={() => dispatch(setMode("tactics"))}
            className="h-8 w-32 justify-center"
          >
            <FileLineChartIcon className="h-4 w-4 mr-1" />
            Tactics
          </Button>
        </div>
      </div>
    </div>
  );
}