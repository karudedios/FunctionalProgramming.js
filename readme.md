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

//////////////////////////////
// Typical Vanilla Approach //
//////////////////////////////

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
////////////////////
// Maybe Approach //
////////////////////

Maybe.unit(searchById(21)).match({
  just: item => Maybe.unit(item.barrelRoll()),
  nothing: () => Maybe.nothing()
}).match({
  just: updatedItem => updateFactory(21, { updatedItem }),
  nothing: Identity
});

```

###Either
###Try
###Io
###Trampoline