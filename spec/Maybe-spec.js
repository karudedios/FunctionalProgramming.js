import { Maybe } from '../lib/index'

describe('Maybe', () => {
  describe("The good ones", () => {
    it("should convert any valid computation to a Maybe", () => {
      let value = 10;
      let maybeValue = Maybe.unit(value);

      expect(maybeValue).toBeTruthy();
    })
  });

  describe("The bad ones", () => {

  });

  describe("The ugly ones", () => {

  });
});