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

  describe(".getOrElse", () => {
    it("should get Maybe's value when a Just", () => {
      let value = 10;
      let error = "Oh noes!";
      let unit = Maybe.unit(value);
      let gotOrElse = unit.getOrElse(() => error);

      expect(gotOrElse).toBe(value);
    });

    it("should be Default value when it's a Nothing", () => {
      let value = undefined;
      let error = "Oh noes!";
      let unit = Maybe.unit(value);
      let gotOrElse = unit.getOrElse(() => error);

      expect(gotOrElse).toBe(error);
    });
  });

  describe(".selectMany", () => {
    it("should throw an exception when 'func' is a function that doesn't return a Maybe", () => {
      /**
       * Given a function
       * 'a -> 'b
       */
      let unit = Maybe.unit(12);
      
      try {
        unit.selectMany(x => x + 12);
      } catch(e) {
        expect(e instanceof TypeError).toBeTruthy();
        expect(e.toString().indexOf("match is not a function") > -1).toBeTruthy();
      }
    });

    it("should return the applied function wrapped as a Maybe when 'func' returns a Maybe", () => {
      /**
       * Given a function
       * 'a -> Maybe<'a>
       */
      
      let unit = Maybe.unit(12);
      let transform = (x => Maybe.unit(x + 5));
      
      unit.selectMany(transform).match({
        just: v => expect(v).toBe(17),
        nothing: () => expect(false).toBeTruthy()
      });
    });

    it("should return Nothing if the current Maybe is a Nothing", () => {
      let unit = Maybe.unit(undefined);
      let transform = (x => x);
      
      unit.selectMany(transform).match({
        just: v => expect(false).toBeTruthy(),
        nothing: () => expect(true).toBeTruthy()
      });
    });

    it("should return Nothing if the appled function returns invalid computation", () => {
      let unit = Maybe.unit(undefined);
      let transform = Maybe.nothing;

      unit.selectMany(transform).match({
        just: v => expect(false).toBeTruthy(),
        nothing: () => expect(true).toBeTruthy()
      });
    });
  });

  describe(".select", () => {
    it("should return a Just with transformed value when applied to a Just", () => {
      let unit = Maybe.unit(10);
      let transform = (x => x * 2);
      
      unit.select(transform).match({
        just: v => expect(v).toBe(20),
        nothing: () => expect(false).toBeTruthy()
      });
    });

    it("should return a Nothing when applied to a Nothing", () => {
      let unit = Maybe.unit(undefined);
      let transform = (x => x * 2);

      unit.select(transform).match({
        just: v => expect(false).toBeTruthy(`Expected 'Nothing' instead got 'Just ${v}'`),
        nothing: () => expect(true).toBeTruthy()
      });
    });

    it("should return a Nothing when applied a transformation to a Just that returns invalid computation", () => {
      let unit = Maybe.unit(12);
      let transform = (x => undefined);

      unit.select(transform).match({
        just: v => expect(false).toBeTruthy(`Expected 'Nothing' instead got 'Just ${v}'`),
        nothing: () => expect(true).toBeTruthy()
      });
    });
  });

  describe(".where", () => {
    it("should return Nothing when self if Nothing", () => {
      let unit = Maybe.unit(undefined);
      let predicate = (() => true);

      unit.where(predicate).match({
        just: v => expect(false).toBeTruthy(`Expected 'Nothing' instead got 'Just ${v}'`),
        nothing: () => expect(true).toBeTruthy()
      });
    });

    it("should return Nothing when predicate is not met", () => {
      let unit = Maybe.unit(10);
      let predicate = (x => x % 3 === 0);
      
      unit.where(predicate).match({
        just: v => expect(false).toBeTruthy(`Expected 'Nothing' instead got 'Just ${v}'`),
        nothing: () => expect(true).toBeTruthy()
      });
    });

    it("should return Just when predicate is met", () => {
      let unit = Maybe.unit(10);
      let predicate = (() => true);

      unit.where(predicate).match({
        just: v => expect(v).toBe(10),
        nothing: () => expect(false).toBeTruthy()
      });
    });
  });

  describe(".asEither", () => {

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