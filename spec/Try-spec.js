import { Try } from '../src/FunctionalProgramming';

describe('Try', () => {
  describe(".unit", () => {
    it("should wrap the resolution of a non-exceptional function to a Success", () => {
      let value = 10;
      let unit = Try.unit(() => value);
      expect(unit.toString()).toBe(`Success ${value}`);
    });

    it("should wrap the resolution of an exceptional function to a Failure", () => {
      let error = "It went kaboom!";
      let unit = Try.unit(() => { throw error; });
      expect(unit.toString()).toBe(`Failure ${error}`);
    });
  });

  describe(".match", () => {
    it("should take 'success' path when is a Success", () => {
      let success = 10;
      let unit = Try.unit(() => success);

      unit.match({
        success: (s) => expect(s).toBe(success),
        failure: (f) => expect(f).toBe({}, "Match went to the 'failure' Path")
      });
    });

    it("should take 'failure' path when is a Failure", () => {
      let failure = "boom";
      let unit = Try.unit(() => { throw failure; });

      unit.match({
        success: (s) => expect(s).toBe({}, "Match went to the 'success' Path"),
        failure: (f) => expect(f).toBe(failure)
      });
    });
  });

  describe(".lift", () => {
    let error = "Cannot divide by zero.";

    let divide = (a, b) => {
      if (b == 0) { throw error; }
      return a / b;
    };

    let liftedDivision = Try.lift(divide);

    it("should have lifted function be truthy", () => {
      expect(liftedDivision).toBeTruthy(`Try.lift(${divide}) was falsy`);
    });

    it("should have the result from calling the lifted function be truthy", () => {
      let tryResult = liftedDivision(8, 4);
      expect(tryResult).toBeTruthy("liftedDivision(8, 4) was falsy");
    });

    it("should return a Success when called with valid arguments", () => {
      let tryResult = liftedDivision(8, 4);
      expect(tryResult.toString()).toBe(`Success ${divide(8, 4)}`);
    });

    it("should return a Failure whe called with invalid arguments", () => {
      let tryResult = liftedDivision(8, 0);
      expect(tryResult.toString()).toBe(`Failure ${error}`);
    })

    it("should turn wrap a function so that it returns a value wrapped in a Try", () => {
      let result = divide(8, 4);
      let tryResult = liftedDivision(8, 4);
      expect(result).toEqual(tryResult.value, `${result} seems to be different to ${tryResult}'s value`);
    });
  });

  describe(".bind", () => {
    let error = "Cannot divide by zero.";

    let divide = (a, b) => {
      if (b == 0) { throw error; }
      return a / b;
    };

    let bindedDivision = Try.bind(divide);

    it("should have binded function be truthy", () => {
      expect(bindedDivision).toBeTruthy(`Try.bind(${divide}) was falsy`);
    });

    it("should return a Failure when called with non-try values", () => {
      let error = "'bind' requires Try typed paramenters";

      let invalidLiftedCall = bindedDivision(8, 0);
      expect(invalidLiftedCall.toString()).toBe(`Failure ${error}`);

      let validLiftedCall = bindedDivision(8, 4);
      expect(validLiftedCall.toString()).toBe(`Failure ${error}`);
    });

    it("should return Success when valid call is issued", () => {
      let validCall = bindedDivision(Try.unit(() => 8), Try.unit(() => 4));
      expect(validCall.toString()).toBe(`Success ${divide(8, 4)}`);
    });

    it("should return Failure when invalid call is issued", () => {
      let invalidCall = bindedDivision(Try.unit(() => 8), Try.unit(() => 0));
      expect(invalidCall.toString()).toBe(`Failure ${error}`);
    });

    it("should return Failure when Failure argument is issued", () => {
      let l1 = "First parameter is Invalid";
      let invalidCall1 = bindedDivision(Try.unit(() => { throw l1; }), Try.unit(() => 4));
      expect(invalidCall1.toString()).toBe(`Failure ${l1}`);

      let l2 = "Second parameter is Invalid";
      let invalidCall2 = bindedDivision(Try.unit(() => 8), Try.unit(() => { throw l2; }));
      expect(invalidCall2.toString()).toBe(`Failure ${l2}`);
    });
  });
});