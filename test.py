import z3
from estimates.main import *

def test_simple_sat():
    x = z3.Int('x')
    s = z3.Solver()
    s.add(x == 42)
    assert s.check() == z3.sat
    model = s.model()
    result = model[x]
    assert result == 42


def test_simple_unsat():
    x = z3.Int('x')
    s = z3.Solver()
    s.add(x > 5, x < 3)
    assert s.check() == z3.unsat


def test_linear_system():
    x, y = z3.Ints('x y')
    s = z3.Solver()
    s.add(x + y == 10, x - y == 2)
    assert s.check() == z3.sat
    m = s.model()
    assert (m[x], m[y]) == (6, 4)


def test_bitvector_wraparound():
    a = z3.BitVec('a', 8)
    s = z3.Solver()
    s.add(a + 1 == 0)
    assert s.check() == z3.sat
    assert s.model()[a] == 255


def test_string_concat():
    s1, s2 = z3.Strings('s1 s2')
    s = z3.Solver()
    s.add(z3.Concat(s1, s2) == "hello")
    s.add(s1 == "he")
    assert s.check() == z3.sat
    assert s.model()[s2] == z3.StringVal("llo")

def test_fraction():
    x = z3.Real('x')
    s = z3.Solver()
    s.add(x == 1/2)
    assert s.check() == z3.sat
    assert s.model()[x].as_fraction() == Fraction(1, 2)

test_fraction()
