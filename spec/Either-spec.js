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
  });

  describe(".bind", () => {
  });
});