import { useAppDispatch, useAppSelector } from "../../store";
import { Goal, loadProblem, Variable, Relation, applyTactic, selectNodes, addVariables, selectVariables, setVariables, setAssumptions, setGoal } from "../../features/proof/proofSlice";
import { Button } from "../Button";
import { selectProofComplete } from "../../features/pyodide/pyodideSlice";
import { useMemo } from "react";

export default function TutorialExample({
  lines,
  problem,
  tactic,
  variables,
  assumptions,
  goal,
}: {
  lines: string[];
  problem?: {
    variables: Variable[];
    assumptions: Relation[];
    goal: Goal;
  }
  tactic?: {
    target: string;
    position: 'last';
  }
  variables?: Variable[];
  assumptions?: Relation[];
  goal?: Goal;
}) {
  const appDispatch = useAppDispatch();
  const proofSolved = useAppSelector(selectProofComplete);
  const nodes = useAppSelector(selectNodes);
  const existingVariables = useAppSelector(selectVariables);
  const targetNode = useMemo(() => {
    if (!tactic) {
      return null;
    }
    const nonGoalNodes = nodes.filter((node) => node.id !== 'goal-node');
    if (tactic.position === 'last') {
      return nonGoalNodes[nonGoalNodes.length - 1];
    }
  }, [tactic, nodes]);

  return (
    <div className="relative">
      {
        problem && (
          <Button
            className="absolute top-2 right-2 text-sm text-gray-800"
            onClick={() => {
              appDispatch(loadProblem(problem));
              if (tactic) {
                appDispatch(applyTactic({ nodeId: targetNode?.id || 'base-node', tactic: tactic.target }));
              }
            }}>
            Load problem
          </Button>
        )
      }
      {
        tactic && !problem && (
          <Button
            className="absolute top-2 right-2 text-sm text-gray-800"
            onClick={() => appDispatch(applyTactic({ nodeId: targetNode?.id || 'base-node', tactic: tactic.target }))}
            disabled={proofSolved}
          >
            Apply tactic
          </Button>
        )
      }
      {
        variables && (
          <Button
            className="absolute top-2 right-2 text-sm text-gray-800"
            onClick={() => {
              if (existingVariables.filter((variable) => variable.name).length > 0) {
                appDispatch(addVariables(variables));
              } else {
                appDispatch(setVariables(variables));
              }
            }}
            disabled={proofSolved}
          >
            Add variables
          </Button>
        )
      }
      {
        assumptions && (
          <Button
            className="absolute top-2 right-2 text-sm text-gray-800"
            onClick={() => {
              appDispatch(setAssumptions(assumptions));
            }}
            disabled={proofSolved}
          >
            Add assumptions
          </Button>
        )
      }
      {
        goal && (
          <Button
            className="absolute top-2 right-2 text-sm text-gray-800"
            onClick={() => {
              appDispatch(setGoal(goal));
            }}
            disabled={proofSolved}
          >
            Add goal
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