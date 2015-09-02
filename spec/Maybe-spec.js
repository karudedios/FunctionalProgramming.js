import { Maybe } from '../src/FunctionalProgramming';

describe('Maybe', () => {
  describe(".nothing", () => {
    it("should hold a Nothing value", () => {
      expect(Maybe.nothing().toString()).toBe('Nothing', "Well, looks like Maybe.nothing() isn't Nothing");
    });
  });

  describe(".unit", () => {
    it("should convert any valid value to a Just", () => {
      let value = 10;
      let maybeValue = Maybe.unit(value);

      expect(maybeValue).toBeTruthy(`Maybe.unit(${value}) was falsy`);
      expect(maybeValue.toString()).toBe(`Just ${value}`);
    });

    it("should convert any invalid value to a Nothing", () => {
      let value = undefined;
      let maybeValue = Maybe.unit(value);

      expect(maybeValue).toBeTruthy(`Maybe.unit(${value}) was falsy`);
      expect(maybeValue.toString()).toBe(`Nothing`);
    });
  });

  describe(".match", () => {
    it("should take 'just' path when is a Just", () => {
      let value = 10;
      let unit = Maybe.unit(value);

      unit.match({
        just: (v) => expect(v).toBe(value),
        nothing: () => expect(true).toBeFalsy("Match went to the 'nothing' path")
      });
    });

    it("should take 'nothing' path when is a Nothing", () => {
      let unit = Maybe.unit(NaN);

      unit.match({
        just: (v) => expect(true).toBeFalsy("Match went to the 'just' path"),
        nothing: () => expect(true).toBe(true)
      });
    });
  });

  describe(".lift", () => {
    let sum = (a, b) => a + b;
    let liftedSum = Maybe.lift(sum);

    it("should have lifted function be truthy", () => {
      expect(liftedSum).toBeTruthy(`Maybe.lift(${sum}) was falsy`);
    });

    it("should have the result from calling the lifted function be truthy", () => {
      let maybeResult = liftedSum(2, 4);
      expect(maybeResult).toBeTruthy("liftedSum(2, 4) was falsy");
    });

    it("should return a Just when called with valid arguments", () => {
      let maybeResult = liftedSum(2, 4);
      expect(maybeResult.toString()).toBe(`Just ${sum(2, 4)}`);
    });

    it("should return a Nothing whe called with invalid arguments", () => {
      let maybeResult = liftedSum(2, undefined);
      expect(maybeResult.toString()).toBe('Nothing');
    })

    it("should turn wrap a function so that it returns a potential value wrapped in a Maybe", () => {
      let result = sum(2, 4);
      let maybeResult = liftedSum(2, 4);
      expect(result).toEqual(maybeResult.value, `${result} seems to be different to ${maybeResult}'s value`);
    });
  });

  describe(".bind", () => {
    let sum = (a, b) => a + b;
    let bindedSum = Maybe.bind(sum);

    it("should have binded function be truthy", () => {
      expect(bindedSum).toBeTruthy(`Maybe.bind(${sum}) was falsy`);
    });

    it("should return a Nothing when called with non-maybe values", () => {
      let invalidLiftedCall = bindedSum(2, undefined);
      expect(invalidLiftedCall.toString()).toBe('Nothing');

      let validLiftedCall = bindedSum(2, 4);
      expect(validLiftedCall.toString()).toBe('Nothing');
    });

    it("should return Just when valid call is issued", () => {
      let validCall = bindedSum(Maybe.unit(5), Maybe.unit(10));
      expect(validCall.toString()).toBe(`Just ${sum(5, 10)}`);
    });

    it("should return Nothing when Nothing argument is issued", () => {
      let invalidCall1 = bindedSum(Maybe.nothing(), Maybe.unit(10));
      expect(invalidCall1.toString()).toBe('Nothing');

      let invalidCall2 = bindedSum(Maybe.unit(5), Maybe.nothing());
      expect(invalidCall2.toString()).toBe('Nothing');
    });
  });
});