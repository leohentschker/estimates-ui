import classNames from "classnames";
import { useState } from "react";

const OVERVIEW_TAB_ID = 'overview';
const LEMMAS_TAB_ID = 'examples';
const HOW_IT_WORKS_TAB_ID = 'how-it-works';

const tabs = [
  {
    id: OVERVIEW_TAB_ID,
    label: 'Overview',
  },
  {
    id: HOW_IT_WORKS_TAB_ID,
    label: 'How it works',
  },
  {
    id: 'creating-problems',
    label: 'Creating Problems',
  },
  {
    id: LEMMAS_TAB_ID,
    label: 'Lemmas',
  }
]

function OverviewTab(): React.ReactElement {
  return (
    <>
      <article className="prose lg:prose-md max-w-none">
        <p>
          This project aims to develop (in Python) a lightweight proof assistant that is substantially less powerful than full proof assistants such as Lean, Isabelle or Rocq, but which (hopefully) is easy to use to prove short, tedious tasks, such as verifying that one inequality or estimate follows from others. One specific intention of this assistant is to provide support for asymptotic estimates.
        </p>
      </article>
    </>
  )
}

function HowItWorksTab(): React.ReactElement {
  return (
    <article className="prose lg:prose-md max-w-[50vw]">
      <p>
        The assistant can be in one of two modes: Assumption mode and Tactic mode. We will get to assumption mode later, but let us first discuss tactic mode, which is the mode one ends up in when one tries any of the exercises. The format of this mode is deliberately designed to resemble the tactic mode in modern proof assistant languages such as Lean, Isabelle or Rocq.
      </p>
      <p>
        Let's start for instance with <code>linarith_exercise()</code>. Informally, this exercise asks to establish the following claim:
      </p>
      <p>
        <em>Informal version: If x, y, z are positive reals with x &lt; 2y and y &lt; 3z + 1, prove that x &lt; 7z + 2.</em>
      </p>
      <p>
        If one follows the above quick start instructions, one should now see the following:
      </p>
      <pre><code>&gt;&gt;&gt; from estimates.main import *
        &gt;&gt;&gt; p = linarith_exercise()
        <br />
        Starting proof.  Current proof state:
        <br />
        x: pos_real
        <br />
        y: pos_real
        <br />
        z: pos_real
        <br />
        h1: x &lt; 2*y
        <br />
        h2: y &lt; 3*z + 1
        <br />
        |- x &lt; 7*z + 2</code></pre>
      <p>
        We are now in <strong>Tactic mode</strong>, in which we try to establish a desired goal (the assertion after the <code>|-</code> symbol, which in this case is <code>x &lt; 7*z + 2</code>) from the given hypotheses x, y, z, h1, h2. Hypotheses come in two types:
      </p>
      <ul>
        <li><strong>Variable declarations</strong>, such as <code>x: pos_real</code>, which asserts that we have a variable x that is a positive real number.</li>
        <li><strong>Predicates</strong>, such as <code>h1: x &lt; 2*y</code>, which have a name (in this case, h1), and a boolean-valued assertion involving the variables, in this case <code>x &lt; 2*y</code>.</li>
      </ul>
      <p>
        The goal is also a predicate. The list of hypotheses together with a goal is collectively referred to as a <strong>proof state</strong>.
      </p>
      <p>
        In order to obtain the goal from the hypotheses, one usually uses a sequence of <strong>tactics</strong>, which can transform a given proof state to zero or more further proof states. This can decrease, increase, or hold steady the number of outstanding goals. The "game" is then to keep using tactics until the number of outstanding goals drops to zero, at which point the proof is complete.
      </p>
      <p>
        In this particular case, there is a "linear arithmetic" tactic <code>Linarith()</code> (inspired by the Lean tactic linarith) that is specifically designed for the task of obtaining a goal as a linear combination of the hypotheses, and it "one-shots" this particular exercise:
      </p>
      <pre><code>&gt;&gt;&gt; p.use(Linarith())
        <br />
        Proof complete!</code></pre>
      <p>
        This may seem suspiciously easy, but one can ask Linarith to give a more detailed explanation:
      </p>
      <pre><code>&gt;&gt;&gt; p.use(Linarith(verbose=True))
        <br />
        Checking feasibility of the following inequalities:
        <br />
        1*z &gt; 0
        <br />
        1*x + -7*z &gt;= 2
        <br />
        1*y + -3*z &lt; 1
        <br />
        1*y &gt; 0
        <br />
        1*x &gt; 0
        <br />
        1*x + -2*y &lt; 0
        <br />
        Infeasible by summing the following:
        <br />
        1*z &gt; 0 multiplied by 1/4
        <br />
        1*x + -7*z &gt;= 2 multiplied by 1/4
        <br />
        1*y + -3*z &lt; 1 multiplied by -1/2
        <br />
        1*x + -2*y &lt; 0 multiplied by -1/4
        <br />
        Goal solved by linear arithmetic!
        <br />
        Proof complete!</code></pre>
      <p>
        This gives more details as to what Linarith actually did:
      </p>
      <ul>
        <li>
          First, it argued by contradiction, by taking the negation <code>x ≥ 7z + 2</code> of the goal <code>x &lt; 7z + 2</code> and added it to the hypotheses.
        </li>
        <li>
          Then, it converted all the inequalities that were explicit or implicit in the hypotheses into a "linear programming" form in which the variables are on the left-hand side, and constants on the right-hand side. For instance, the assertion that x was a positive real became <code>1x &gt; 0</code>, and the assertion <code>y &lt; 3z</code> became <code>1y + -3*z &lt; 1</code>.
        </li>
        <li>
          Finally, it used exact linear programming to seek out a linear combination of these inequalities that would lead to an absurd inequality, in this case <code>0 &lt; 1</code>.
        </li>
      </ul>
      <p>
        One can also inspect the final proof after solving the problem by using the <code>proof()</code> method, although in this case the proof is extremely simple:
      </p>
      <pre><code>&gt;&gt;&gt; print(p.proof())
        <br />
        example (x: pos_real) (y: pos_real) (z: pos_real) (h1: x &lt; 2*y) (h2: y &lt; 3*z + 1): x &lt; 7*z + 2 := by
        <br />
        linarith</code></pre>
      <p>
        Here, the original hypotheses and goal are listed in a pseudo-Lean style, followed by the actual proof, which in this case is just one line.
      </p>
      <p>
        One could ask what happens if Linarith fails to resolve the goal. With the verbose flag, it will give a specific counterexample consistent with all the inequalities it could find:
      </p>
      <pre><code>&gt;&gt;&gt; from estimates.main import *
        &gt;&gt;&gt; p = linarith_impossible_example()
        <br />
        Starting proof.  Current proof state:
        <br />
        x: pos_real
        <br />
        y: pos_real
        <br />
        z: pos_real
        <br />
        h1: x &lt; 2*y
        <br />
        h2: y &lt; 3*z + 1
        <br />
        |- x &lt; 7*z
        <br />
        &gt;&gt;&gt; p.use(Linarith(verbose=true))
        <br />
        Checking feasibility of the following inequalities:
        <br />
        1*x + -7*z &gt;= 0
        <br />
        1*x &gt; 0
        <br />
        1*y + -3*z &lt; 1
        <br />
        1*x + -2*y &lt; 0
        <br />
        1*z &gt; 0
        <br />
        1*y &gt; 0
        <br />
        Feasible with the following values:
        <br />
        y = 2
        <br />
        x = 7/2
        <br />
        z = 1/2
        <br />
        Linear arithmetic was unable to prove goal.
        <br />
        1 goal remaining.
        &gt;&gt;&gt;</code></pre>

      <p>
        Here, the task given was an impossible one: to deduce <code>x &lt; 7z</code> from the hypotheses that <code>x</code>, <code>y</code>, <code>z</code> are positive reals with <code>x &lt; 2y</code> and <code>y &lt; 3z + 1</code>. A specific counterexample <code>x = 7/2</code>, <code>y = 2</code>, <code>z = 1/2</code> was given to this problem. (In this case, this means that the original problem was impossible to solve; but in general one cannot draw such a conclusion, because it may have been possible to establish the goal by using some non-inequality hypotheses).
      </p>
      <p>
        Now let us consider a slightly more complicated proof, in which some branching of cases is required.
      </p>
      <pre><code>&gt;&gt;&gt; from estimates.main import *
        &gt;&gt;&gt; p = case_split_exercise()
        <br />
        Starting proof.  Current proof state:
        <br />
        P: bool
        <br />
        Q: bool
        <br />
        R: bool
        <br />
        S: bool
        <br />
        h1: P | Q
        <br />
        h2: R | S
        |- (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S)</code></pre>
      <p>
        Here, we have four atomic propositions (boolean variables) P, Q, R, S, with the hypothesis h1 that either P or Q is true, as well as the hypothesis h2 that either R or S is true. The objective is then to prove that one of the four statements P &amp; R (i.e., P and R are both true), P &amp; S, Q &amp; R, and Q &amp; S is true.
      </p>
      <p>
        Here we can split the hypothesis h1 : P | Q into two cases:
      </p>
      <pre><code>&gt;&gt;&gt; p.use(Cases("h1"))
        Splitting h1: P | Q into cases P, Q.
        <br />
        2 goals remaining.
        <br />
        Let's now look at the current proof state:
        <br />
        &gt;&gt;&gt; print(p)
        Proof Assistant is in tactic mode.  Current proof state:
        <br />
        P: bool
        <br />
        Q: bool
        <br />
        R: bool
        <br />
        S: bool
        <br />
        h1: P
        <br />
        h2: R | S
        <br />
        |- (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S)
        <br />
        This is goal 1 of 2.</code></pre>
      <p>
        Note how the hypothesis h1 has changed from P | Q to just P. But this is just one of the two goals. We can see this by looking at the current state of the proof:
      </p>
      <pre><code>&gt;&gt;&gt; print(p.proof())
        <br />
        example (P: bool) (Q: bool) (R: bool) (S: bool) (h1: P | Q) (h2: R | S): (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) := by
        cases h1
        <br />
        . **sorry**
        <br />
        sorry</code></pre>

      <p>
        The proof has now branched into a tree with two leaf nodes (marked ``sorry''), representing the two unresolved goals. We are currently located at the first goal (as indicated by the asterisks). We can move to the next goal:
      </p>
      <pre><code>&gt;&gt;&gt; p.next_goal()
        <br />
        Moved to goal 2 of 2.
        <br />
        &gt;&gt;&gt; print(p.proof())
        example (P: bool) (Q: bool) (R: bool) (S: bool) (h1: P | Q) (h2: R | S): (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) := by
        <br />
        cases h1
        <br />
        . sorry
        <br />
        **sorry**
        <br />
        &gt;&gt;&gt; print(p)
        Proof Assistant is in tactic mode.  Current proof state:
        <br />
        P: bool
        <br />
        Q: bool
        <br />
        R: bool
        <br />
        S: bool
        <br />
        h1: Q
        <br />
        h2: R | S
        <br />
        |- (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S)
        <br />
        This is goal 2 of 2.</code></pre>
      <p>
        So we see that in this second branch of the proof tree, h1 is now set to Q. For further ways to navigate the proof tree, see this page.
      </p>
      <p>
        Now that we know that Q is true, we would like to use this to simplify our goal, for instance simplifying Q &amp; R to Q. This can be done using the SimpAll() tactic:
      </p>
      <pre><code>&gt;&gt;&gt; p.use(SimpAll())
        <br />
        Simplified (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) to R | S using Q.
        <br />
        Simplified R | S to True using R | S.
        <br />
        Goal solved!
        <br />
        1 goal remaining.</code></pre>
      <p>
        Here, the hypothesis Q was used to simplify the goal (using sympy's powerful simplification tools), all the way down to R | S. But this is precisely hypothesis h2, so on using that hypothesis as well, the conclusion was simplified to True, which of course closes off this goal. This then lands us automatically in the first goal, which can be solved by the same method:
      </p>
      <pre><code>&gt;&gt;&gt; p.use(SimpAll())
        <br />
        Simplified (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) to R | S using P.
        <br />
        Simplified R | S to True using R | S.
        <br />
        Goal solved!
        <br />
        Proof complete!</code></pre>
      <p>
        And here is the final proof:
      </p>
      <pre><code>&gt;&gt;&gt; print(p.proof())
        example (P: bool) (Q: bool) (R: bool) (S: bool) (h1: P | Q) (h2: R | S): (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) := by
        <br />
        cases h1
        <br />
        . simp_all
        <br />
        simp_all</code></pre>
      <p>
        One can combine propositional tactics with linear arithmetic tactics. Here is one example (using some propositional tactics we have not yet discussed, but whose purpose should be clear, and which one can look up in this page):
      </p>
      <pre><code>&gt;&gt;&gt; from estimates.main import *
        &gt;&gt;&gt; p = split_exercise()
        Starting proof.  Current proof state:
        <br />
        x: real
        <br />
        y: real
        <br />
        h1: (x &gt; -1) &amp; (x &lt; 1)
        <br />
        h2: (y &gt; -2) &amp; (y &lt; 2)
        <br />
        |- (x + y &gt; -3) &amp; (x + y &lt; 3)
        <br />
        &gt;&gt;&gt; p.use(SplitHyp("h1"))
        <br />
        Decomposing h1: (x &gt; -1) &amp; (x &lt; 1) into components x &gt; -1, x &lt; 1.
        <br />
        1 goal remaining.
        <br />
        &gt;&gt;&gt; p.use(SplitHyp("h2"))
        <br />
        Decomposing h2: (y &gt; -2) &amp; (y &lt; 2) into components y &gt; -2, y &lt; 2.
        <br />
        1 goal remaining.
        <br />
        &gt;&gt;&gt; p.use(SplitGoal())
        Split into conjunctions: x + y &gt; -3, x + y &lt; 3
        <br />
        2 goals remaining.
        <br />
        &gt;&gt;&gt; p.use(Linarith())
        Goal solved by linear arithmetic!
        <br />
        1 goal remaining.
        <br />
        &gt;&gt;&gt; p.use(Linarith())
        Goal solved by linear arithmetic!
        <br />
        Proof complete!
        <br />
        &gt;&gt;&gt; print(p.proof())
        <br />
        example (x: real) (y: real) (h1: (x &gt; -1) &amp; (x &lt; 1)) (h2: (y &gt; -2) &amp; (y &lt; 2)): (x + y &gt; -3) &amp; (x + y &lt; 3) := by
        split_hyp h1
        <br />
        split_hyp h2
        <br />
        split_goal
        <br />
        . linarith
        <br />
        linarith</code></pre>
    </article>
  )
}

function ExamplesTab(): React.ReactElement {
  return (
    <article className="prose lg:prose-md max-w-none">
      In addition to general proof tactics, The goal is to build a library of lemmas that can be used for more specialized applications. Here is one example, using an arithmetic mean geometric mean lemma:

      <p>
        <em>AM-GM Inequality:</em> For positive real numbers x₁, ..., xₙ,
        <br />
        (x₁ + ... + xₙ)/n ≥ (x₁·...·xₙ)^(1/n)
      </p>

      to prove a slight variant of that lemma:
      <pre><code>&gt;&gt;&gt; from estimates.main import *
        <br />
        &gt;&gt;&gt;
        p = amgm_exercise()
        <br />
        Starting proof.  Current proof state:
        <br />
        x: nonneg_real
        <br />
        y: nonneg_real
        <br />
        |- 2*x*y &lt;= x**2 + y**2
        <br />
        &gt;&gt;&gt; x,y = p.get_vars("x","y")
        <br />
        &gt;&gt;&gt; p.use_lemma(Amgm(x**2,y**2))
        <br />
        Applying lemma am_gm(x**2, y**2) to conclude this: x**1.0*y**1.0 &lt;= x**2/2 + y**2/2.
        <br />
        1 goal remaining.
        <br />
        &gt;&gt;&gt; p.use(SimpAll())
        <br />
        Goal solved!
        <br />
        Proof complete!</code></pre>
    </article>
  )
}

function CreatingProblemsTab(): React.ReactElement {
  return (
    <article className="prose lg:prose-md max-w-none">
      The previous demonstrations of the Proof Assistant used some "canned" examples which placed one directly in Tactic Mode with some pre-made hypotheses and goal. To make one's own problem to solve, one begins with the ProofAssistant constructor:
      <pre><code>&gt;&gt;&gt; from estimates.main import *
        &gt;&gt;&gt; p = ProofAssistant()
        <br />
        Proof Assistant is in assumption mode.  Current proof state:
        <br />
        |- True</code></pre>
      <p>
        This places the proof assistant in Assumption Mode. Now one can add variables and assumptions. For instance, to introduce a positive real variable x, one can use the var() method to write
      </p>
      <pre><code>&gt;&gt;&gt; x = p.var("real", "x")
        <br />
        x: real</code></pre>
      <p>
        This creates a sympy Python variable x, which is real and can be manipulated symbolically using the full range of sympy methods:
      </p>
      <pre><code>&gt;&gt;&gt; x
        x
        <br />
        &gt;&gt;&gt; x.is_real
        True
        <br />
        &gt;&gt;&gt; x+x
        2*x
        <br />
        &gt;&gt;&gt; from sympy import expand
        &gt;&gt;&gt; expand((x+2)**2)
        x**2 + 4*x + 4
        <br />
        &gt;&gt;&gt; x&lt;5
        x &lt; 5
        <br />
        &gt;&gt;&gt; isinstance(x&lt;5, Boolean)
        True</code></pre>
      <p>
        One can also use vars() to introduce multiple variables at once:
      </p>
      <pre><code>&gt;&gt;&gt; y,z = p.vars("pos_int", "y", "z")   # "pos_int" means "positive integer"
        <br />
        &gt;&gt;&gt; y.is_positive
        <br />
        True
        <br />
        &gt;&gt;&gt; (y+z).is_positive
        <br />
        True
        <br />
        &gt;&gt;&gt; (x+y).is_positive
        <br />
        &gt;&gt;&gt; (x+y).is_real
        <br />
        True</code></pre>
      <p>
        (Here, (x+y).is_positive returned None, reflecting the fact that the hypotheses do not allow one to easily assert that x+y is positive.)
      </p>

      <p>
        One can then add additional hypotheses using the assume() command:
      </p>
      <pre><code>&gt;&gt;&gt; p.assume(x+y+z &lt;= 3, "h")
        <br />
        &gt;&gt;&gt; p.assume((x&gt;=y) &amp; (y&gt;=z), "h2")
        <br />
        &gt;&gt;&gt; print(p)
        <br />
        Proof Assistant is in assumption mode.  Current hypotheses:
        <br />
        x: real
        <br />
        y: pos_int
        <br />
        z: pos_int
        <br />
        h: x + y + z &lt;= 3
        <br />
        h2: (x &gt;= y) &amp; (y &gt;= z)</code></pre>

      <p>
        Now, one can start a goal with the begin_proof() command:
      </p>
      <pre><code>&gt;&gt;&gt; p.begin_proof(Eq(z,1))
        <br />
        Starting proof.  Current proof state:
        <br />
        x: real
        <br />
        y: pos_int
        <br />
        z: pos_int
        <br />
        h: x + y + z &lt; 3
        <br />
        h2: (x &gt;= y) &amp; (y &gt;= z)
        <br />
        |- Eq(z, 1)</code></pre>
      <p>
        (Here we are using sympy's symbolic equality relation Eq, because Python has reserved the = and == operators for other purposes.) Now one is in Tactic Mode and can use tactics as before.
      </p>
      <p>
        For a full list of navigation commands that one can perform in either Assumption Mode or Tactic Mode, see the <a href="https://github.com/teorth/estimates/blob/main/docs/navigation.md" target="_blank" rel="noopener noreferrer">navigation documentation</a>.
      </p>
    </article>

  )
}

export default function Tutorial(): React.ReactElement {
  const [activeTab, setActiveTab] = useState(OVERVIEW_TAB_ID);
  return (
    <div className='border-t border-gray-200 pt-4 flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        {
          tabs.map((tab) => (
            <button
              key={tab.id}
              className={classNames(
                activeTab === tab.id ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:text-gray-800',
                'rounded-md px-3 py-2 text-sm font-medium cursor-pointer',
                'hover:bg-gray-100'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))
        }
      </div>
      <div className="h-[60vh] overflow-y-scroll overflow-x-scroll  max-w-[50vw]">
        {
          activeTab === OVERVIEW_TAB_ID && (
            <OverviewTab />
          )
        }
        {
          activeTab === HOW_IT_WORKS_TAB_ID && (
            <HowItWorksTab />
          )
        }
        {
          activeTab === 'creating-problems' && (
            <CreatingProblemsTab />
          )
        }
        {
          activeTab === LEMMAS_TAB_ID && (
            <ExamplesTab />
          )
        }
      </div>
    </div>
  )
}