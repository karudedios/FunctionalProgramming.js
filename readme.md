[![Build Status](https://travis-ci.org/karudedios/FunctionalProgramming.js.svg?branch=master)](https://travis-ci.org/karudedios/FunctionalProgramming.js)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/karudedios/FunctionalProgramming.js/master/LICENSE)

#Functional Programming JS

The concept of this project was based off of [RacoWireless/Functional Programming for C#](https://github.com/RacoWireless/FunctionalProgramming)

##Description
The objective of this project is to have access to some Functional Programming's concepts in order to ease some of the regular problems one can be presented with when developing something on Javascript.


##Table of Content
1. [Maybe](#maybe)
1. [Either](#either)
1. [Try](#try)
1. [Io](#io)
1. [Trampoline](#trampoline)

##Content

###Maybe
In javascript the `falsey` values really don't make too much sense, you don't have a valid 'absence of value', so, for any type you can get `undefined` as absence, which is conceptually wrong, given that `undefined` means lack of existence, but it does exist, it just doesn't have a value. And this is where the 'wrapper' Maybe comes into play.

Imagine the following scenario, you have a factory which searches in a collection by a provided Id, however, if said Id is not found you would get `undefined` instead, said factory uses an `Object` created by the user so, it has custom properties on its prototype the you wish to call after fetching, you have workarounds to verify the nullability of the result, but, why not simply doing what you have to do when you have to do it, (say, when it's not undefined);


For the sake of brevity let's imagine the factory only holds 20 items.

```javascript
let searchById = (id) => Factory.retrieve({ id, single: true });

let updateFactory = (id, { updatedItem }) => {
  let item = searchById(id).applyUpdate(updatedItem);
  Factory.update({ id, item });
  return Public.unit;
}

/**
 * Typical Vanilla Approach
 */

let item = searchById(21);

let updatedItem = item.barrelRoll(); // This goes wrong.
updateFactory(21, { updatedItem }); // This goes even worst.


```

Of course, it can be fixed with  a simple if

```javascript
let item = searchById(21);

if (item) {
  let updatedItem = item.barrelRoll();
  updateFactory(21, { updatedItem });
} else {
  // ...
}

```

But this sort of uglifies the code, you can perceive the intention, but it seems like the 'else' path leads astray, is doing nothing, it's returning nothing, when you object has an invalid state, what do you do?

```javascript
/**
 * Maybe Approach
 */

Maybe.unit(searchById(21)).match({
  just: item => Maybe.unit(item.barrelRoll()),
  nothing: Maybe.nothing
}).match({
  just: updatedItem => updateFactory(21, { updatedItem }),
  nothing: Maybe.nothing
});

```

The Maybe path tries to lead you into doing everything on it's own space, you first search, if there's nothing, then, tell me there's nothing, if there's something do a BarelRoll, if your BarelRoll wasn't successfull give me nothing, otherwise let's update you.

###Either
However, there are situations where a Maybe is not the most apropriate [Algebraic Data Type](https://en.wikipedia.org/wiki/Algebraic_data_type) to handle certain situations, you will have _(in occassions)_ more than simply a `value` or `nothing`, you will have `value` or a `'value`, to illustrate this we'll create a `sum` function.

```Javascript
/**
 * Tipical Vanilla Approach
 */

let sum = (a, b) => a + b;

sum(1, 3); // 4. Great!
sum(null, 5); // 5. What?
sum(10, undefined); // NaN. Well, this is actually true.

```

Well, this situations can be easily addressed with a couple of If's

```Javascript
let isFalsy = (v) =>
  (v instanceof Number && isNaN(v)) || typeof v === 'undefined' || v === null;

let sum = (a, b) => {
  if ([a, b].some(isFalsy)) {
    throw new Error("Invalid numbers provided");
  }

  return a + b;  
}

sum(1, 3); // 4. Great!.
sum(null, 5); // ERROR: Invalid numbers provided.
sum(10, undefined); // ERROR: Invalid numbers provided.
```

Well, yeah, that works, however what if I want to know which number was the invalid one?

```Javascript
let sum = (a, b) => {
  if (isFalsy(a)) {
    throw new Error("The first addend was invalid");
  } else if (isFalsy(b)) {
    throw new Error("The second addend was invalid");
  }

  return a + b;  
}

sum(1, 3); // 4. Great!.
sum(null, 5); // ERROR: The first addend was invalid.
sum(10, undefined); // ERROR: The second addend was invalid.
```

Well this works perfectly! Now, let's see how that would work with an Either

```Javascript
/**
 * Either Approach
 */

let sum = (a, b) => {
  let eitherA = Either.unit(() => "The first addend was invalid", a);
  let eitherB = Either.unit(() => "The second addend was invalid", b);

  return eitherA.match({
    left: Either.left,
    right: addend1 =>
      eitherB.match({
        left: Either.left,
        right: addend2 => Either.right(addend1 + addend2)
      })
  });
}

sum(1, 3); // Right 4
sum(null, 5); // Left 'The first addend was invalid.'
sum(10, undefined); // Left 'The second addend was invalid.'
```

The Either path as well as the Maybe path, tries to lead you to doing what you have to do where you have to be doing it, is it Failure? Take the left path, and in the left path do work specific for a failure. Is it a Success? Take the right path, and in the right path do work specific for a success.

###Try
###Io
###Trampoline
