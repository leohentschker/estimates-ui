import asyncio, types, sys, js
import time
from pyodide.ffi import run_sync
from fractions import Fraction

SAT = "sat"
UNSAT = "unsat"

async def _init():
    # 1 – boot the JS Z3 WASM build
    await js.eval("""
    (async () => {
        const { init } = await import('https://esm.sh/z3-solver@4.15.0?bundle');
        const { Context, Z3 } = await init();
        globalThis.Z3 = new Context('main');
        globalThis.Z3_functions = Z3;
    })();
    """)
    
    def _convert_arg(arg):
        if isinstance(arg, _Expr):
            return arg._e
        elif isinstance(arg, int):
            return js.Z3.Int.val(arg)
        elif isinstance(arg, float):
            return js.Z3.Real.val(arg)
        elif isinstance(arg, bool):
            return js.Z3.Bool.val(arg)
        elif isinstance(arg, Fraction):
            return js.Z3.Real.val(str(arg.numerator) + "/" + str(arg.denominator))
        else:
            raise TypeError(f"Cannot convert {type(arg)} to Z3 expression")

    class _Model:
        def __init__(self, model):
            self._model = model

        def __getitem__(self, key):
            key_value = _convert_arg(key)
            return _Expr(self._model[key_value])

    # 2 – lightweight wrappers
    class _Solver:
        def __init__(self):
            print ("init solver")
            self._s = js.Z3.Solver.new()

        def add(self, *cs):
            [self._s.add(c._e) for c in cs]

        def check(self):
            return run_sync(self._s.check())

        def model(self):
            print("Calling solver.model()")
            return _Model(self._s.model())

    class _Expr:
        def __init__(self, e):
            self._e = e
            self._type = type
        def __str__(self):
            return f"Expr: {str(self._e)}"
            
        def __sub__(self, o):
            return _Expr(self._e.sub(_convert_arg(o)))
                
        def __mul__(self, o):
            return _Expr(self._e.mul(_convert_arg(o)))
            
        def __add__(self, o):
            return _Expr(self._e.add(_convert_arg(o)))
            
        def __le__(self, o):
            return _Expr(self._e.le(_convert_arg(o)))
            
        def __lt__(self, o):
            return _Expr(self._e.lt(_convert_arg(o)))
            
        def __rmul__(self, o): 
            return _Expr(_convert_arg(o).mul(self._e))
            
        def __radd__(self, o):
            return _Expr(_convert_arg(o).add(self._e))
        
        def __ge__(self, o):
            return _Expr(self._e.ge(_convert_arg(o)))

        def __gt__(self, o):
            return _Expr(self._e.gt(_convert_arg(o)))

        def __pow__(self, o):
            if isinstance(o, int) and o > 0:
                result = self._e
                for _ in range(o-1):
                    result = result.mul(self._e)
                return _Expr(result)
            return _Expr(self._e.pow(_convert_arg(o)))
        
        def __eq__(self, o):
            return _Expr(self._e.eq(_convert_arg(o)))
            
        def __getitem__(self, key):
            return _Expr(self._e.select(_convert_arg(key)))

        def as_fraction(self):
            # Get the string representation of the expression
            expr_str = str(self._e)
            numerator = self._e.numerator().value()
            denominator = self._e.denominator().value()
            return Fraction(numerator, denominator)
            
    def Int(name):
        return _Expr(js.Z3.Int.const(js.String(name)))
    
    def Bool(name):
        return _Expr(js.Z3.Bool.const(js.String(name)))
        
    def IntVal(value):
        return _Expr(js.Z3.Int.val(value))

    def Real(name):
        return _Expr(js.Z3.Real.const(js.String(name)))

    def RealVal(value):
        return _Expr(js.Z3.Real.val(value))
    
    def StringVal(value):
        return _Expr(js.Z3.String.val(value))
    
    def BitVec(name, size):
        return _Expr(js.Z3.BitVec.const(js.String(name), size))
    
    def String(name):
        return _Expr(js.Z3.String.const(js.String(name)))
    
    def IntSort():
        return _Expr(js.Z3.Int.sort())
    
    def BoolSort():
        return _Expr(js.Z3.Bool.sort())
    
    def RealSort():
        return _Expr(js.Z3.Real.sort())
    
    def Array(name, domain_sort, range_sort):
        # Ensure we're using the underlying JavaScript objects
        domain = domain_sort._e if hasattr(domain_sort, '_e') else domain_sort
        range_sort = range_sort._e if hasattr(range_sort, '_e') else range_sort
        return _Expr(js.Z3.Array.const(js.String(name), domain, range_sort))

    def Sum(*args): 
        s = args[0]._e
        for a in args[1:]: s = s.add(a._e)
        return _Expr(s)
    
    def Distinct(*args):
        if len(args) <= 1:
            return _Expr(js.Z3.Bool.val(True))
        # Convert all arguments to their JavaScript representations
        js_args = [arg._e for arg in args]
        try:
            result = js.Z3.Distinct.apply(None, js_args)
            return _Expr(result)
        except Exception as e:
            print(f"Error in Distinct: {e}")
            print(f"Arguments: {js_args}")
            raise
    
    def Implies(a, b):
        return _Expr(a._e.implies(b._e))
    
    def Or(*args):
        args_array = [arg._e for arg in args]
        return _Expr(js.Z3.Or(*args_array))
    
    def And(*args):
        args_array = [arg._e for arg in args]
        return _Expr(js.Z3.And(*args_array))
    
    def If(cond, then_expr, else_expr):
        return _Expr(js.Z3.If(cond._e, then_expr._e, else_expr._e))
    
    def simplify(e):
        # If Z3.simplify returns a promise, we need to wait for it to resolve
        result = js.Z3.simplify(e._e)
        
        # Check if result is a promise-like object
        if hasattr(result, 'then') and callable(result.then):
            # Use run_sync to wait for the promise to resolve
            resolved_result = run_sync(result)
            return _Expr(resolved_result)
        else:
            # If it's not a promise, return it directly
            return _Expr(result)
        
    def Ints(ints_string):
        return [Int(arg) for arg in ints_string.split(' ')]

    def Strings(strings_string):
        return [String(arg) for arg in strings_string.split(' ')]
    
    def Bools(bools_string):
        return [Bool(arg) for arg in bools_string.split(' ')]
    def Not(a):
        return _Expr(a._e.not_())

    mod = types.ModuleType("z3")
    mod.Real, mod.Solver, mod.Sum, mod.sat = Real, _Solver, Sum, SAT
    mod.unsat = UNSAT
    mod.Int = Int
    mod.IntVal = IntVal
    mod.RealVal = RealVal
    mod.simplify = simplify
    mod.Ints = Ints
    mod.String = String
    mod.Bools = Bools
    mod.If = If
    mod.IntSort = IntSort
    mod.BoolSort = BoolSort
    mod.RealSort = RealSort
    mod.Array = Array
    mod.Distinct = Distinct
    mod.Implies = Implies
    mod.Or = Or
    mod.And = And
    mod.Not = Not
    mod.BitVec = BitVec
    mod.Strings = String

    sys.modules["z3"] = mod

asyncio.ensure_future(_init())
