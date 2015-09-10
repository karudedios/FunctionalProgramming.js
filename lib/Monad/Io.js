import { Try } from './Try'

export default (() => {
  "use strict";

  let Io = (() => {
    class Io {
      constructor(f) {
        if (!(f instanceof Function)) throw "Io only accepts function as constructor parameter";
        Object.defineProperty(this, 'resolve', { value: f, enumerable: true });
      }

      /**
       * Method to select an Io from an Io
       * 
       * @param   {[Function]}  func  Function that should return an Io
       * @return  {[Io]}              An Io with the function to evaluate delayed
       */
      selectMany(func) {
        return Io.unit(() => func(this.resolve()).resolve());
      }

      /**
       * Method to select a value from an Io
       * 
       * @param   {[Function]}  func  Function that should return an value
       * @return  {[Io]}              An Io with the function to evaluate delayed
       */
      select(func) {
        return Io.unit(() => func(this.resolve()));
      }

      /**
       * Method to wrap a function in order to delay it's execution
       * 
       * @param   {Function}  fn  Pure function to delay
       * @return  {[Io]}          An Io with the function to evaluate delayed
       */
      static unit(fn) {
        return new Io(fn);
      }

      /**
       * Method to up-lift a function in order to receive regular parameters
       * and delay the function resolution in an Io
       * 
       * @param   {Function}  fn  Function to lift
       * @return  {[Io]}          Delayed function execution inside an Io
       */
      static lift(fn) {
        return (...args) => new Io(() => fn.apply(this, args));
      }
    }

    return Io;
  })();

  return { Io };
})();