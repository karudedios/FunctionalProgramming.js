import { Either } from '../src/FunctionalProgramming'

describe('Either', () => {
  describe(".right", () => {
    it("should wrap any value into a Right value", () => {
      let right10 = Either.right(10);
      expect(right10.toString()).toBe('Right 10');

      let rightNull = Either.right(null);
      expect(rightNull.toString()).toBe('Right null');
    });
  });

  describe(".left", () => {
    it("should wrap any value into a Left value", () => {
      let left10 = Either.left(10);
      expect(left10.toString()).toBe('Left 10');

      let leftNull = Either.left(null);
      expect(leftNull.toString()).toBe('Left null');
    });
  });

  describe(".unit", () => {
    it("should wrap any valid value into a Right value", () => {
      let unit = Either.unit(() => "Invalid computation", 10);
      expect(unit.toString()).toBe("Right 10");
    });

    it("should wrap any invalid value into a Left of the fallback", () => {
      let unit = Either.unit(() => "Invalid computation", undefined);
      expect(unit.toString()).toBe("Left Invalid computation");
    });
  });

  describe(".match", () => {
    it("should take 'right' path when is a Right", () => {
      let right = 10;
      let left = "Invalid";
      let unit = Either.unit(() => left, right);

      unit.match({
        right: (r) => expect(r).toBe(right),
         left: (l) => expect(l).not.toBe(left, "Match went to the 'left' Path")
      });
    });

    it("should take 'left' path when is a Left", () => {
      let right = NaN;
      let left = "Valid";
      let unit = Either.unit(() => left, right);

      unit.match({
        right: (r) => expect(r).not.toBe(right, "Match went to the 'right' path"),
         left: (l) => expect(l).toBe(left)
      });
    });
  });

  describe(".lift", () => {
    let sum = (a, b) => a + b;
    let left = () => "Invalid sum arguments";
    let liftedSum = Either.lift(left, sum);

    it("should have lifted function be truthy", () => {
      expect(liftedSum).toBeTruthy(`Either.lift(${left}, ${sum}) was falsy`);
    });

    it("should have the result from calling the lifted function be truthy", () => {
      let eitherResult = liftedSum(2, 4);
      expect(eitherResult).toBeTruthy("liftedSum(2, 4) was falsy");
    });

    it("should return a Right when called with valid arguments", () => {
      let eitherResult = liftedSum(2, 4);
      expect(eitherResult.toString()).toBe(`Right ${sum(2, 4)}`);
    });

    it("should return a Left whe called with invalid arguments", () => {
      let eitherResultA = liftedSum(2, undefined);
      expect(eitherResultA.toString()).toBe(`Left ${left()}`);

      let eitherResultB = liftedSum(undefined, 4);
      expect(eitherResultB.toString()).toBe(`Left ${left()}`);
    })

    it("should turn wrap a function so that it returns a value wrapped in a Either", () => {
      let result = sum(2, 4);
      let eitherResult = liftedSum(2, 4);
      expect(result).toEqual(eitherResult.value, `${result} seems to be different to ${eitherResult}'s value`);
    });
  });

  describe(".bind", () => {
    let sum = (a, b) => a + b;
    let left = () => "Invalid Either arguments";
    let bindedSum = Either.bind(left, sum);

    it("should have binded function be truthy", () => {
      expect(bindedSum).toBeTruthy(`Either.bind(${sum}) was falsy`);
    });

    it("should return a Left when called with non-either values", () => {
      let invalidLiftedCallA = bindedSum(2, undefined);
      expect(invalidLiftedCallA.toString()).toBe(`Left ${left()}`);

      let invalidLiftedCallB = bindedSum(undefined, 4);
      expect(invalidLiftedCallB.toString()).toBe(`Left ${left()}`);

      let validLiftedCall = bindedSum(2, 4);
      expect(validLiftedCall.toString()).toBe(`Left ${left()}`);
    });

    it("should return Right when valid call is issued", () => {
      let validCall = bindedSum(Either.unit(left, 5), Either.unit(left, 10));
      expect(validCall.toString()).toBe(`Right ${sum(5, 10)}`);
    });

    it("should return Left when Left argument is issued", () => {
      let l1 = "First parameter is Invalid";
      let invalidCall1 = bindedSum(Either.left(l1), Either.right(10));
      expect(invalidCall1.toString()).toBe(`Left ${l1}`);

      let l2 = "Second parameter is Invalid";
      let invalidCall2 = bindedSum(Either.right(5), Either.left(l2));
      expect(invalidCall2.toString()).toBe(`Left ${l2}`);
    });
  });
});