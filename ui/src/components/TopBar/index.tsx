import { selectShowTutorial, selectShowCode, setShowCode, setShowTutorial, selectIsMobile } from "../../features/ui/uiSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { BookOpen, Code, Network } from "lucide-react";
import TopBarButton from "./TopBarButton";
import ExecutionButton from "./ExecutionButton";

export default function TopBar(): React.ReactElement {
  const showTutorials = useAppSelector(selectShowTutorial);
  const showCode = useAppSelector(selectShowCode);
  const dispatch = useAppDispatch();

  const isMobile = useAppSelector(selectIsMobile);

  return (
    <div className="flex border-b border-gray-200 px-4 py-2 items-center justify-between">

      {/* Show or hide tutorial and code panels */}
      <div className="flex items-center gap-1 md:gap-2">
        <TopBarButton
          icon={<BookOpen className="h-4 w-4" />}
          label="Tutorials"
          active={showTutorials}
          onClick={() => {
            dispatch(setShowTutorial(!showTutorials));
            if (isMobile && showCode) dispatch(setShowCode(false));
          }}
        />
        <TopBarButton
          icon={<Code className="h-4 w-4" />}
          label="Code"
          active={showCode}
          onClick={() => {
            dispatch(setShowCode(!showCode));
            if (isMobile && showTutorials) dispatch(setShowTutorial(false));
          }}
        />
        {
          isMobile && (
            <TopBarButton
              icon={<Network className="h-4 w-4" />}
              label="Builder"
              active={!showCode && !showTutorials}
              onClick={() => {
                dispatch(setShowTutorial(false));
                dispatch(setShowCode(false));
              }}
            />
          )
        }
      </div>

      {/* Compile and run code, either automatically or manually */}
      <ExecutionButton />
    </div>
  );
}