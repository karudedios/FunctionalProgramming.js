import { Io } from '../src/FunctionalProgramming';

describe('Io', () => {
  describe(".unit", () => {
    it("should wrap an effectful function into an Io", () => {
      let fun = () => {
        let sum = (a, b) => a + b;
        return sum(1, 5);
      }

      let unit = Io.unit(fun);
      expect(unit.resolve()).toBe(6);
    });
  });

  describe(".lift", () => {
    let sum = (a, b) => a + b;
    let ioSum = Io.lift(sum);

    it("should have lifted function be truthy", () => {
      expect(ioSum).toBeTruthy();
    });

    it("should have the result from calling the lifted function be truthy", () => {
      let ioResult = ioSum(8, 4);
      expect(ioResult).toBeTruthy("ioSum(8, 4) was falsy");
    });

    it("should return evaluation when invoked", () => {
      let ioResult = ioSum(8, 4);
      expect(ioResult.resolve()).toBe(12);
    });
  });
});