import { selectShowTutorial, selectShowCode, setShowCode, setShowTutorial } from "../../features/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { BookOpen, Code } from "lucide-react";
import TopBarButton from "./TopBarButton";
import ExecutionButton from "./ExecutionButton";

export type UIState = {
  showTutorial: boolean;
  showCode: boolean;
  mode: 'assumptions' | 'tactics';
}

export default function TopBar(): React.ReactElement {
  const showTutorials = useAppSelector(selectShowTutorial);
  const showCode = useAppSelector(selectShowCode);
  const dispatch = useAppDispatch();

  return (
    <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between">

      {/* Show or hide tutorial and code panels */}
      <div className="flex items-center space-x-2">
        <TopBarButton
          icon={<BookOpen className="h-4 w-4" />}
          label="Tutorials"
          active={showTutorials}
          onClick={() => dispatch(setShowTutorial(!showTutorials))}
        />
        <TopBarButton
          icon={<Code className="h-4 w-4" />}
          label="Code"
          active={showCode}
          onClick={() => dispatch(setShowCode(!showCode))}
        />
      </div>

      {/* Compile and run code, either automatically or manually */}
      <ExecutionButton />
    </div>
  );
}