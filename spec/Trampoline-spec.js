import { Trampoline } from '../src/FunctionalProgramming';

describe('Trampoline', () => {
  describe(".call", () => {
    it("should wrap a function as in a Call", () => {
      expect(Trampoline.call(() => 2 + 4).toString()).toBe("Pending");
    });
  });

  describe(".done", () => {
    it("should wrap a function in a Done", () => {
      expect(Trampoline.done(() => 2 + 4).toString()).toBe("Done");
    });
  });

  describe(".build", () => {
    describe("trampolined factorial", () => {
      it("should work as expected", () => {
        let factorial = (n) => n < 2 ? n : n * factorial(n - 1);

        let trampolinedFactorial = Trampoline.build({
          predicate: (n) => n < 2,
          call: (n, acc, step) => step(n - 1, n * acc),
          done: (n, acc) => acc,
          init: (step, n) => step(n, 1)
        });

        expect(factorial(10)).toBe(trampolinedFactorial(10));
      });
    });

    describe("trampolined even/odd", () => {
      it("should work as expected", () => {
        let even = (n) => n == 0 ? true : odd(n - 1);
        let odd = (n) => n == 0 ? false : even(n - 1);

        let trampolinedEven = Trampoline.build({
          predicate: (n) => n == 0,
          call: (n, step) => trampolinedOdd(n - 1),
          done: () => true
        });

        let trampolinedOdd = Trampoline.build({
          predicate: (n) => n == 0,
          call: (n) => trampolinedEven(n - 1),
          done: () => false
        });

        expect(even(10)).toBe(trampolinedEven(10));
        expect(even(11)).toBe(trampolinedEven(11));

        expect(odd(10)).toBe(trampolinedOdd(10));
        expect(odd(11)).toBe(trampolinedOdd(11));
      });
    });

    describe("fibonacci", () => {
      it("should work", () => {
        let fibonacci = (n) => n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
        
        let trampolinedFibonacci = Trampoline.build({
          predicate: (n) =>  n <= 2,
          done: () => 1,
          call: (n, step) => step(n - 1, (a) => step(n - 2, (b) => a + b))
        });

        expect(fibonacci(10)).toBe(trampolinedFibonacci(10));
      });
    });
  });
});