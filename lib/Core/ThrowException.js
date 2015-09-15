export default (() => {
  "use strict";
  
  function ThrowException(ex) {
    throw new Error(ex);
  }

  return { ThrowException };
})();