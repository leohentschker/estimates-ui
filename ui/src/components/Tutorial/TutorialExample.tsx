import { useAppDispatch } from "../../store";
import { Goal, loadProblem, Variable, Relation } from "../../features/proof/proofSlice";
import { Button } from "../Button";

export default function TutorialExample({
  lines,
  problem
}: {
  lines: string[];
  problem?: {
    variables: Variable[];
    assumptions: Relation[];
    goal: Goal;
  }
}) {
  const appDispatch = useAppDispatch();

  return (
    <div className="relative">
      {
        problem && (
          <Button
            className="absolute top-2 right-2 text-sm text-gray-800"
            onClick={() => appDispatch(loadProblem(problem))}>
            Load problem
          </Button>
        )
      }
      <pre>
        <code>
          {lines.map((line) => (line.replace(/\&lt;/g, '<').replace(/\&gt;/g, '>').replace(/\&amp;/g, '&'))).join('\n')}
        </code>
      </pre>
    </div>
  );
}