import { useEffect, useState } from 'react';
import classNames from 'classnames';
import TutorialExample from './TutorialExample';
import LatexString from '../VisualEditor/LatexString';

const OVERVIEW_TAB_ID = 'overview';
const LEMMAS_TAB_ID = 'lemmas';
const HOW_IT_WORKS_TAB_ID = 'how-it-works';
const CREATING_PROBLEMS_TAB_ID = 'creating-problems';
const ORDERS_OF_MAGNITUDE_TAB_ID = 'orders-of-magnitude';
const tabs = [
  {
    id: HOW_IT_WORKS_TAB_ID,
    label: 'Overview',
  },
  {
    id: CREATING_PROBLEMS_TAB_ID,
    label: 'Creating Problems',
  },
  {
    id: ORDERS_OF_MAGNITUDE_TAB_ID,
    label: 'Asymptotic analysis',
  },
  {
    id: LEMMAS_TAB_ID,
    label: 'Lemmas',
  }
]

function TutorialArticle({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <article className="prose lg:prose-md max-w-none lg:max-w-xl text-justify">
      {children}
    </article>
  )
}

function OverviewTab(): React.ReactElement {
  return (
    <>
      <TutorialArticle>
        <p>
          This project aims to develop (in Python) a lightweight proof assistant that is substantially less powerful than full proof assistants such as Lean, Isabelle or Rocq, but which (hopefully) is easy to use to prove short, tedious tasks, such as verifying that one inequality or estimate follows from others. One specific intention of this assistant is to provide support for asymptotic estimates.
        </p>
      </TutorialArticle>
    </>
  )
}

function HowItWorksTab(): React.ReactElement {
  return (
    <TutorialArticle>
      <p>
        This project aims to develop (in Python) a lightweight proof assistant that is substantially less powerful than full proof assistants such as Lean, Isabelle or Rocq, but which (hopefully) is easy to use to prove short, tedious tasks, such as verifying that one inequality or estimate follows from others. One specific intention of this assistant is to provide support for asymptotic estimates.
      </p>
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
      <TutorialExample
        lines={[
          '>>> from estimates.main import *',
          '>>> p = linarith_exercise()',
          'Starting proof.  Current proof state:',
          'x: pos_real',
          'y: pos_real',
          'z: pos_real',
          'h1: x &lt; 2*y',
          'h2: y &lt; 3*z + 1',
          '|- x &lt; 7*z + 2',
        ]}
        problem={{
          variables: [
            {
              name: 'x',
              type: 'pos_real'
            },
            {
              name: 'y',
              type: 'pos_real'
            },
            {
              name: 'z',
              type: 'pos_real'
            }
          ],
          assumptions: [
            {
              input: 'x < 2*y',
              valid: true,
              name: 'h1'
            },
            {
              input: 'y < 3*z + 1',
              valid: true,
              name: 'h2'
            }
          ],
          goal: {
            input: 'x < 7*z + 2',
            valid: true
          }
        }}
      />
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
      <TutorialExample
        lines={[
          '>>> p.use(Linarith())',
          'Proof complete!'
        ]}
        tactic={{
          target: 'Linarith()',
          position: 'last',
        }}
      />
      <p>
        This may seem suspiciously easy, but one can ask Linarith to give a more detailed explanation:
      </p>
      <TutorialExample
        lines={[
          '>>> p.use(Linarith(verbose=True))',
          'Checking feasibility of the following inequalities:',
          '1*z > 0',
          '1*x + -7*z >= 2',
          '1*y + -3*z < 1',
          '1*y > 0',
          '1*x > 0',
          '1*x + -2*y < 0',
          'Infeasible by summing the following:',
          '1*z > 0 multiplied by 1/4',
          '1*x + -7*z >= 2 multiplied by 1/4',
          '1*y + -3*z < 1 multiplied by -1/2',
          '1*x + -2*y < 0 multiplied by -1/4',
          'Goal solved by linear arithmetic!',
          'Proof complete!',
        ]}
        tactic={{
          target: 'Linarith(verbose=True)',
          position: 'last',
        }}
      />
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
      <TutorialExample
        lines={[
          '>>> from estimates.main import *',
          '>>> p = linarith_impossible_example()',
          'Starting proof.  Current proof state:',
          'x: pos_real',
          'y: pos_real',
          'z: pos_real',
          'h1: x < 2*y',
          'h2: y < 3*z + 1',
          '|- x < 7*z',
          '>>> p.use(Linarith(verbose=True))',
          'Checking feasibility of the following inequalities:',
          '1*x + -7*z >= 0',
          '1*x > 0',
          '1*y + -3*z < 1',
          '1*x + -2*y < 0',
          '1*z > 0',
          '1*y > 0',
          'Feasible with the following values:',
          'y = 2',
          'x = 7/2',
          'z = 1/2',
          'Linear arithmetic was unable to prove goal.',
          '1 goal remaining.'
        ]}
        problem={{
          variables: [
            {
              name: 'x',
              type: 'pos_real'
            },
            {
              name: 'y',
              type: 'pos_real'
            },
            {
              name: 'z',
              type: 'pos_real'
            }
          ],
          assumptions: [
            {
              input: 'x < 2*y',
              valid: true,
              name: 'h1'
            },
            {
              input: 'y < 3*z + 1',
              valid: true,
              name: 'h2'
            }
          ],
          goal: {
            input: 'x < 7*z',
            valid: true
          }
        }}
        tactic={{
          target: 'Linarith(verbose=True)',
          position: 'last',
        }}
      />

      <p>
        Here, the task given was an impossible one: to deduce <code>x &lt; 7z</code> from the hypotheses that <code>x</code>, <code>y</code>, <code>z</code> are positive reals with <code>x &lt; 2y</code> and <code>y &lt; 3z + 1</code>. A specific counterexample <code>x = 7/2</code>, <code>y = 2</code>, <code>z = 1/2</code> was given to this problem. (In this case, this means that the original problem was impossible to solve; but in general one cannot draw such a conclusion, because it may have been possible to establish the goal by using some non-inequality hypotheses).
      </p>
      <p>
        Now let us consider a slightly more complicated proof, in which some branching of cases is required.
      </p>
      <TutorialExample
        lines={[
          '>>> from estimates.main import *',
          '>>> p = case_split_exercise()',
          'Starting proof.  Current proof state:',
          'P: bool',
          'Q: bool',
          'R: bool',
          'S: bool',
          'h1: P | Q',
          'h2: R | S',
          '|- (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S)',
        ]}
        problem={{
          variables: [
            {
              name: 'P',
              type: 'bool'
            },
            {
              name: 'Q',
              type: 'bool'
            },
            {
              name: 'R',
              type: 'bool'
            },
            {
              name: 'S',
              type: 'bool'
            }
          ],
          assumptions: [
            {
              input: 'P | Q',
              valid: true,
              name: 'h1'
            },
            {
              input: 'R | S',
              valid: true,
              name: 'h2'
            }
          ],
          goal: {
            input: '(P & R) | (P & S) | (Q & R) | (Q & S)',
            valid: true
          }
        }}
      />
      <p>
        Here, we have four atomic propositions (boolean variables) P, Q, R, S, with the hypothesis h1 that either P or Q is true, as well as the hypothesis h2 that either R or S is true. The objective is then to prove that one of the four statements P &amp; R (i.e., P and R are both true), P &amp; S, Q &amp; R, and Q &amp; S is true.
      </p>
      <p>
        Here we can split the hypothesis h1 : P | Q into two cases:
      </p>
      <TutorialExample
        lines={[
          '>>> p.use(Cases("h1"))',
          'Splitting h1: P | Q into cases P, Q.',
          '2 goals remaining.',
        ]}
        tactic={{
          target: 'Cases("h1")',
          position: 'last',
        }}
      />
      <p>
        Let's now look at the current proof state:
      </p>
      <TutorialExample
        lines={[
          '>>> print(p)',
          'Proof Assistant is in tactic mode.  Current proof state:',
          'P: bool',
          'Q: bool',
          'R: bool',
          'S: bool',
          'h1: P',
          'h2: R | S',
          '|- (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S)',
          'This is goal 1 of 2.',
        ]}
      />
      <p>
        Note how the hypothesis h1 has changed from P | Q to just P. But this is just one of the two goals. We can see this by looking at the current state of the proof:
      </p>
      <TutorialExample
        lines={[
          '>>> print(p.proof())',
          'example (P: bool) (Q: bool) (R: bool) (S: bool) (h1: P | Q) (h2: R | S): (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) := by',
          'cases h1',
          '. **sorry**',
          'sorry',
        ]}
      />
      <p>
        The proof has now branched into a tree with two leaf nodes (marked ``sorry''), representing the two unresolved goals. We are currently located at the first goal (as indicated by the asterisks). We can move to the next goal:
      </p>
      <TutorialExample
        lines={[
          '>>> p.next_goal()',
          'Moved to goal 2 of 2.',
          '>>> print(p.proof())',
          'example (P: bool) (Q: bool) (R: bool) (S: bool) (h1: P | Q) (h2: R | S): (P & R) | (P & S) | (Q & R) | (Q & S) := by',
          'cases h1',
          '. sorry',
          '**sorry**',
          '>>> print(p)',
          'Proof Assistant is in tactic mode.  Current proof state:',
          'P: bool',
          'Q: bool',
          'R: bool',
          'S: bool',
          'h1: Q',
          'h2: R | S',
          '|- (P & R) | (P & S) | (Q & R) | (Q & S)',
          'This is goal 2 of 2.',
        ]}
      />
      <p>
        So we see that in this second branch of the proof tree, h1 is now set to Q. For further ways to navigate the proof tree, see this page.
      </p>
      <p>
        Now that we know that Q is true, we would like to use this to simplify our goal, for instance simplifying Q &amp; R to Q. This can be done using the SimpAll() tactic:
      </p>
      <TutorialExample
        lines={[
          '>>> p.use(SimpAll())',
          'Simplified (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) to R | S using Q.',
          'Simplified R | S to True using R | S.',
          'Goal solved!',
          '1 goal remaining.',
        ]}
        tactic={{
          target: 'SimpAll()',
          position: 'last',
        }}
      />
      <p>
        Here, the hypothesis Q was used to simplify the goal (using sympy's powerful simplification tools), all the way down to R | S. But this is precisely hypothesis h2, so on using that hypothesis as well, the conclusion was simplified to True, which of course closes off this goal. This then lands us automatically in the first goal, which can be solved by the same method:
      </p>
      <TutorialExample
        lines={[
          '>>> p.use(SimpAll())',
          'Simplified (P &amp; R) | (P &amp; S) | (Q &amp; R) | (Q &amp; S) to R | S using P.',
          'Simplified R | S to True using R | S.',
          'Goal solved!',
          'Proof complete!',
        ]}
        tactic={{
          target: 'SimpAll()',
          position: 'last',
        }}
      />
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
      <TutorialExample
        lines={[
          '>>> from estimates.main import *',
          '>>> p = split_exercise()',
          'Starting proof.  Current proof state:',
          'x: real',
          'y: real',
          'h1: (x > -1) & (x < 1)',
          'h2: (y > -2) & (y < 2)',
          '|- (x + y > -3) & (x + y < 3)',
          '>>> p.use(SplitHyp("h1"))',
          'Decomposing h1: (x > -1) & (x < 1) into components x > -1, x < 1.',
          '1 goal remaining.',
          '>>> p.use(SplitHyp("h2"))',
          'Decomposing h2: (y > -2) & (y < 2) into components y > -2, y < 2.',
          '1 goal remaining.',
          '>>> p.use(SplitGoal())',
          'Split into conjunctions: x + y > -3, x + y < 3',
          '2 goals remaining.',
          '>>> p.use(Linarith())',
          'Goal solved by linear arithmetic!',
          '1 goal remaining.',
          '>>> p.use(Linarith())',
          'Goal solved by linear arithmetic!',
          'Proof complete!',
          '>>> print(p.proof())',
          'example (x: real) (y: real) (h1: (x > -1) & (x < 1)) (h2: (y > -2) & (y < 2)): (x + y > -3) & (x + y < 3) := by',
          'split_hyp h1',
          'split_hyp h2',
          'split_goal',
          '. linarith',
          'linarith'
        ]}
        problem={{
          variables: [
            {
              name: 'x',
              type: 'real'
            },
            {
              name: 'y',
              type: 'real'
            }
          ],
          assumptions: [
            {
              input: '(x > -1) & (x < 1)',
              valid: true,
              name: 'h1'
            },
            {
              input: '(y > -2) & (y < 2)',
              valid: true,
              name: 'h2'
            }
          ],
          goal: {
            input: '(x + y > -3) & (x + y < 3)',
            valid: true
          }
        }}
      />
    </TutorialArticle>
  )
}

function LemmasTab(): React.ReactElement {
  return (
    <TutorialArticle>
      In addition to general proof tactics, The goal is to build a library of lemmas that can be used for more specialized applications. Here is one example, using an arithmetic mean geometric mean lemma:

      <p>
        <em>AM-GM Inequality:</em> For positive real numbers x₁, ..., xₙ,
        <br />
        (x₁ + ... + xₙ)/n ≥ (x₁·...·xₙ)^(1/n)
      </p>

      to prove a slight variant of that lemma:
      <TutorialExample
        lines={[
          '>>> from estimates.main import *',
          '>>>',
          'p = amgm_exercise()',
          'Starting proof.  Current proof state:',
          'x: nonneg_real',
          'y: nonneg_real',
          '|- 2*x*y <= x**2 + y**2',
          '>>> x,y = p.get_vars("x","y")',
          '>>> p.use_lemma(Amgm(x**2,y**2))',
          'Applying lemma am_gm(x**2, y**2) to conclude this: x**1.0*y**1.0 <= x**2/2 + y**2/2.',
          '1 goal remaining.',
          '>>> p.use(Linarith())',
          'Goal solved!',
          'Proof complete!'
        ]}
        problem={{
          variables: [
            {
              name: 'x',
              type: 'nonneg_real'
            },
            {
              name: 'y',
              type: 'nonneg_real'
            }
          ],
          assumptions: [],
          goal: {
            input: '2*x*y <= x**2 + y**2',
            valid: true
          }
        }}
      />
    </TutorialArticle>
  )
}

function CreatingProblemsTab(): React.ReactElement {
  return (
    <TutorialArticle>
      The previous demonstrations of the Proof Assistant used some "canned" examples which placed one directly in Tactic Mode with some pre-made hypotheses and goal. To make one's own problem to solve, one begins with the ProofAssistant constructor:
      <TutorialExample
        lines={[
          '>>> from estimates.main import *',
          '>>> p = ProofAssistant()',
          'Proof Assistant is in assumption mode.  Current proof state:',
          '|- True'
        ]}
        problem={{
          variables: [],
          assumptions: [],
          goal: {
            input: 'True',
            valid: true
          }
        }}
      />
      <p>
        This places the proof assistant in Assumption Mode. Now one can add variables and assumptions. For instance, to introduce a positive real variable x, one can use the var() method to write
      </p>
      <TutorialExample
        lines={[
          '>>> x = p.var("real", "x")',
          'x: real'
        ]}
        variables={[
          {
            name: 'x',
            type: 'real'
          }
        ]}
      />
      <p>
        This creates a sympy Python variable x, which is real and can be manipulated symbolically using the full range of sympy methods:
      </p>
      <pre><code>&gt;&gt;&gt; x
        <br />
        x
        <br />
        &gt;&gt;&gt; x.is_real
        <br />
        True
        <br />
        &gt;&gt;&gt; x+x
        <br />
        2*x
        <br />
        &gt;&gt;&gt; from sympy import expand
        <br />
        &gt;&gt;&gt; expand((x+2)**2)
        <br />
        x**2 + 4*x + 4
        <br />
        &gt;&gt;&gt; x&lt;5
        <br />
        x &lt; 5
        <br />
        &gt;&gt;&gt; isinstance(x&lt;5, Boolean)
        True</code></pre>
      <p>
        One can also use vars() to introduce multiple variables at once:
      </p>
      <TutorialExample
        lines={[
          '>>> y,z = p.vars("pos_int", "y", "z")   # "pos_int" means "positive integer"',
          '>>> y.is_positive',
          'True',
          '>>> (y+z).is_positive',
          'True',
          '>>> (x+y).is_positive',
          '>>> (x+y).is_real',
          'True'
        ]}
        variables={[
          {
            name: 'y',
            type: 'pos_int'
          },
          {
            name: 'z',
            type: 'pos_int'
          }
        ]}
      />
      <p>
        (Here, (x+y).is_positive returned None, reflecting the fact that the hypotheses do not allow one to easily assert that x+y is positive.)
      </p>

      <p>
        One can then add additional hypotheses using the assume() command:
      </p>
      <TutorialExample
        lines={[
          '>>> p.assume(x+y+z &lt;= 3, "h")',
          '>>> p.assume((x>y) & (y>=z), "h2")',
          '>>> print(p)',
        ]}
        assumptions={[
          {
            input: 'x+y+z >= 3',
            valid: true,
            name: 'h1'
          },
          {
            input: '(x>=y) & (y>=z)',
            valid: true,
            name: 'h2'
          }
        ]}
      />

      <p>
        Now, one can start a goal with the begin_proof() command:
      </p>
      <TutorialExample
        lines={[
          '>>> p.begin_proof(Eq(z,1))',
          'Starting proof.  Current proof state:',
          'x: real',
          'y: pos_int',
          'z: pos_int',
          'h: x + y + z < 3',
          'h2: (x >= y) & (y >= z)',
          '|- Eq(z, 1)'
        ]}
        goal={{
          input: 'Eq(z, 1)',
          valid: true
        }}
      />
      <p>
        (Here we are using sympy's symbolic equality relation Eq, because Python has reserved the = and == operators for other purposes.) Now one is in Tactic Mode and can use tactics as before.
      </p>
      <p>
        For a full list of navigation commands that one can perform in either Assumption Mode or Tactic Mode, see the <a href="https://github.com/teorth/estimates/blob/main/docs/navigation.md" target="_blank" rel="noopener noreferrer">navigation documentation</a>.
      </p>
    </TutorialArticle>
  )
}

function OrdersOfMagnitudeTab(): React.ReactElement {
  return (
    <TutorialArticle>
      <p>
        One of the original motivations for this proof assistant was to create an environment in which one can manipulate asymptotic estimates such as the following:
      </p>
      <ul>
        <li>
          <LatexString latex="X \lesssim Y" /> (also written <LatexString latex="X = O(Y)" />), which asserts that <LatexString latex="|X| \leq CY" /> for some absolute constant <LatexString latex="C" />.
        </li>
        <li>
          <LatexString latex="X \ll Y" /> (also written <LatexString latex="X = o(Y)" />), which asserts that for every constant <LatexString latex="\varepsilon >0" />, one has <LatexString latex="|X| \leq \varepsilon Y" /> if a suitable asymptotic parameter is large enough.
        </li>
        <li>
          <LatexString latex="X \asymp Y" /> (also written <LatexString latex="X = \Theta(Y)" />), which asserts that <LatexString latex="X \lesssim Y \lesssim X" />.
        </li>
      </ul>
      <p>
        This is implemented within `sympy` as follows.  One first defines a new type of sympy expression, which I call `OrderOfMagnitude`, and corresponds to the space <LatexString latex="\mathcal{O}" /> discussed in <a href="https://terrytao.wordpress.com/2025/05/04/orders-of-infinity/" target="_blank" rel="noopener noreferrer">this blog post</a>.
        These expressions are not numbers, but still support several algebraic operations, such as addition, multiplication, raising to numerical real exponents, and order comparison.  However, we caution that there is no notion of zero or subtraction in <LatexString latex="\mathcal{O}" />
        (though for technical `sympy` reasons we implement a purely formal subtraction operation with no mathematical content).
      </p>
      <p>
        There is then an operation `Theta` that maps positive real `sympy` expressions to `OrderOfMagnitude` expressions, which then allows one to interpret the above asymptotic statements:
      </p>
      <ul>
        <li>
          <LatexString latex="X \lesssim Y" /> is formalized as <LatexString latex="\lesssim(X,Y)" />, which is syntactic sugar for <LatexString latex="Theta(Abs(X)) <= Theta(Y)" />.
        </li>
        <li>
          <LatexString latex="X \ll Y" /> is formalized as <LatexString latex="ll(X,Y)" />, which is syntactic sugar for <LatexString latex="Theta(Abs(X)) < Theta(Y)" />.
        </li>
        <li>
          <LatexString latex="X \asymp Y" /> is formalized as <LatexString latex="asymp(X,Y)" />, which is syntactic sugar for <LatexString latex="Eq(Theta(X), Theta(Y))" />.
        </li>
      </ul>
      <p>
        Various laws of asymptotic arithmetic have been encoded within the syntax of `sympy`, for instance <LatexString latex="Theta(C)" /> simplifies to <LatexString latex="Theta(1)" /> for any numerical constant `C`, <LatexString latex="Theta(X+Y)" /> simplifies to <LatexString latex="Max(Theta(X),Theta(Y))" />, and so forth.
      </p>
      <p>
        Expressions can be marked as "fixed" (resp. "bounded"), in which case they will be marked has having order of magnitude equal to (resp. at most) <LatexString latex="Theta(1)" /> for the purposes of logarithmic linear programming.
      </p>
      <p>
        <b>Technical note</b>: to avoid some unwanted applications of `sympy`'s native simplifier (in particular, those applications that involve subtraction, which we leave purely formal for orders of magnitude), and to force certain type inferences to work, `OrderOfMagnitude` overrides the usual `Add`, `Mul`, `Pow`, `Max`, and `Min` operations with custom alternatives `OrderAdd`, `OrderMul`, `OrderPow`, `OrderMax`, `OrderMin`.
      </p>
      <p>
        <b>Technical note</b>: We technically permit `Theta` to take non-positive values, but a warning will be sent if this happens and an `Undefined()` element will be generated.  (`sympy`'s native simplifier will sometimes trigger this warning.)  Similarly for other undefined operations, such as `OrderMax` or `OrderMin` applied to an empty tuple.
      </p>
      <p>
        <b>A "gotcha"</b>: One should avoid using python's native `max` or `min` command with orders of magnitude, or even `sympy`'s alternative `Max` and `Min` commands.  Use `OrderMax` and `OrderMin` instead.
      </p>
      <p>
        An abstract order of magnitude can be created using the `OrderSymbol(name)` constructor, similar to the `Symbol()` constructor in `sympy` (but with attributes such as `is_positive` set to false, with the exception of the default flag `is_commutative`).
      </p>
      <p>
        Here is a simple example of the proof assistant establishing an asymptotic estimate. Informally, one is given a positive integer <LatexString latex="N" /> and positive reals <LatexString latex="x,y" /> such that <LatexString latex="x \leq 2N^2" /> and <LatexString latex="y < 3kN" /> with <LatexString latex="k" /> bounded, and the task is to conclude that <LatexString latex="xy \lesssim N^4" />.
      </p>
      <TutorialExample
        lines={[
          '>>> from estimates.main import *',
          '>>> p = loglinarith_exercise()',
          'Starting proof.  Current proof state:',
          'N: pos_int',
          'x: pos_real',
          'y: pos_real',
          'hk: Bounded(k)',
          'h1: x <= 2*N**2',
          'h2: y < 3*N*k',
          '|- Theta(x)*Theta(y) <= Theta(N)**4',
          '>>> p.use(LogLinarith(verbose=True))',
          'Identified the following disjunctions of asymptotic inequalities that we need to obtain a contradiction from:',
          "['Theta(N)**1 >= Theta(1)]",
          "['Theta(x)**1 * Theta(N)**-2 <= Theta(1)]",
          "['Theta(k)**1 >= Theta(1)]",
          "['Theta(x)**1 * Theta(y)**1 * Theta(N)**-4 > Theta(1)]",
          "['Theta(y)**1 * Theta(N)**-1 * Theta(k)**-1 <= Theta(1)]",
          "['Theta(k)**1 <= Theta(1)']",
          'Checking feasibility of the following inequalities:',
          'Theta(N)**1 >= Theta(1)',
          'Theta(x)**1 * Theta(N)**-2 <= Theta(1)',
          'Theta(k)**1 >= Theta(1)',
          'Theta(x)**1 * Theta(y)**1 * Theta(N)**-4 > Theta(1)',
          'Theta(y)**1 * Theta(N)**-1 * Theta(k)**-1 <= Theta(1)',
          'Theta(k)**1 <= Theta(1)',
          'Infeasible by multiplying the following:',
          'Theta(N)**1 >= Theta(1) raised to power 1',
          'Theta(x)**1 * Theta(N)**-2 <= Theta(1) raised to power -1',
          'Theta(x)**1 * Theta(y)**1 * Theta(N)**-4 > Theta(1) raised to power 1',
          'Theta(y)**1 * Theta(N)**-1 * Theta(k)**-1 <= Theta(1) raised to power -1',
          'Theta(k)**1 <= Theta(1) raised to power -1',
          'Proof complete!'
        ]}
        problem={{
          variables: [
            {
              name: 'N',
              type: 'pos_int'
            },
            {
              name: 'x',
              type: 'pos_real'
            },
            {
              name: 'y',
              type: 'pos_real'
            },
            {
              name: 'k',
              type: 'pos_int'
            }
          ],
          assumptions: [
            {
              input: 'Bounded(k)',
              valid: true,
              name: 'hk'
            },
            {
              input: 'x <= 2*N**2',
              valid: true,
              name: 'h1'
            },
            {
              input: 'y < 3*N*k',
              valid: true,
              name: 'h2'
            }
          ],
          goal: {
            input: 'lesssim(x*y, N**4)',
            valid: true
          }
        }}
      />
      <p>
        Here is a list of the commands that one can use to manipulate orders of magnitude:
      </p>
      <ul>
        <li>
          <LatexString latex="Theta(expr) -> OrderOfMagnitude" />: Returns the order of magnitude associated to a non-negative quantity `expr`.
        </li>
        <li>
          <LatexString latex="Theta(expr) -\> OrderOfMagnitude" />: Returns the order of magnitude associated to a non-negative quantity `expr`.
        </li>
        <li>
          <LatexString latex="Fixed(expr:Expr)" />: Marks an expression as fixed (independent of parameters).
        </li>
        <li>
          <LatexString latex="Bounded(expr:Expr)" />: Marks an expression as bounded (ranging in a compact set for all choices of parameters).
        </li>
        <li>
          <LatexString latex="is_fixed(expr:Expr, hypotheses:set[Basic]) -> Bool" />: Tests if an expression is fixed, given the known hypotheses.
        </li>
        <li>
          <LatexString latex="is_bounded(expr:Expr, hypotheses:set[Basic]) -> Bool" />: Tests if an expression is bounded, given the known hypotheses.
        </li>
      </ul>
    </TutorialArticle>
  )
}

export const URL_PARAM_TUTORIAL_TAB = 'tutorial_tab';
const getInitialTab = () => {
  const url = new URL(window.location.href);
  const tutorialParam = url.searchParams.get(URL_PARAM_TUTORIAL_TAB);
  if (tutorialParam === 'overview') {
    return HOW_IT_WORKS_TAB_ID;
  } else if (tutorialParam === 'how-it-works') {
    return HOW_IT_WORKS_TAB_ID;
  } else if (tutorialParam === 'creating-problems') {
    return CREATING_PROBLEMS_TAB_ID;
  } else if (tutorialParam === 'lemmas') {
    return LEMMAS_TAB_ID;
  }
  return HOW_IT_WORKS_TAB_ID;
}

export default function Tutorial(): React.ReactElement {
  const [activeTab, setActiveTab] = useState(getInitialTab());
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set(URL_PARAM_TUTORIAL_TAB, activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  return (
    <div className='hidden 2xl:block w-3xl border-r border-gray-200 h-full overflow-y-auto flex flex-col'>
      <div className='sticky top-0 bg-white z-10 border-b border-gray-200'>
        <div className='flex items-center gap-2 p-4'>
          {
            tabs.map((tab) => (
              <button
                key={tab.id}
                className={classNames(
                  activeTab === tab.id ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:text-gray-800',
                  'rounded-md px-2 py-2 text-sm font-medium cursor-pointer',
                  'hover:bg-gray-100'
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))
          }
        </div>
      </div>
      <div className='p-4 overflow-y-auto flex-1'>
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
          activeTab === CREATING_PROBLEMS_TAB_ID && (
            <CreatingProblemsTab />
          )
        }
        {
          activeTab === ORDERS_OF_MAGNITUDE_TAB_ID && (
            <OrdersOfMagnitudeTab />
          )
        }
        {
          activeTab === LEMMAS_TAB_ID && (
            <LemmasTab />
          )
        }
      </div>
    </div>
  )
}
