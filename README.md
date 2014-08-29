extensible
==========

extensible.js is based on John Resig's Simple JavaScript Inheritance from [his blog](http://ejohn.org/blog/simple-javascript-inheritance/), with some added object oriented programming features.

Extensible gives you:

+ Simulated classical inheritance
+ Private static variables
+ Private instance varibales
+ A very simple property API
 
The property API provides all of the flexibility of Object.defineProperty, but it is simplified to allow you to only pass in a single function as a setter and a getter.  The property setter and getter methods have access to the same private variables and superclass methods as all other instance methods.  In fact, private variables are most useful for property setters and getters, where you need your something to happen whenever a property is set so you cannot allow it to be set directly.  This allows you to enforce that your code is not used incorrectly by other people, because people are stupid and aweful.  I should mention that because people are stupid, when you use property setters and getters you have the potential to easily confuse them.  Do not use setters and getters that have unpredictacble side-effecs. If you do you will be joining the ranks of the people that can't understand how to do anything.

Example usage:
```
var Person = Class.extend({
  init: function(isDancing) {
    this.dancing = isDancing;
    this._private.isSneaky = false;
    this._privateStatic.instances = (this._privateStatic.instances || 0) + 1;
  },
  dance: function() {
    return this.dancing;
  },
  sneak: function() {
    return this._private.isSneaky;
  },
  people: function() {
    return this._privateStatic.instances;
  },
  things: new Property(function(numberOfThings) {
    if (numberOfThings === undefined)
      return this._private.numberOfThings;
    this._private.numberOfThings = parseInt(numberOfThings);
    this._private.numberOfCalls = (this._private.numberOfCalls || 0) + 1;
  }),
  numberOfCallsToThings: function() {
    return this._private.numberOfCalls;
  }
});
 
var Ninja = Person.extend({
  init: function() {
    this._super( false );
    this._private.isSneaky = true;
    this._privateStatic.instances = (this._privateStatic.instances || 0) + 1;
  },
  dance: function() {
    // Call the inherited version of dance()
    return this._super();
  },
  sneak: function() {
    return this._private.isSneaky;
  },
  ninjas: function() {
    return this._privateStatic.instances;
  },
  swingSword: function() {
    return true;
  },
  things: new Property(function(numberOfThings) {
    if (numberOfThings === undefined)
      return this._private.numberOfThings;
    this._private.numberOfThings = parseInt(numberOfThings);
    this._super(numberOfThings);
  })
});
 
var person = new Person(true);
person.dance(); // => true
person.sneak(); // => false
 
var ninja = new Ninja();
ninja.dance(); // => false
ninja.swingSword(); // => true
ninja.sneak(); // => true

var anotherNinja = new Ninja();
person.people(); // => 1
ninja.ninjas(); // => 2

person._privateStatic; // => undefined
ninja._private; // => undefined

// Should all be true 
person instanceof Person && person instanceof Class &&
ninja instanceof Ninja && ninja instanceof Person && ninja instanceof Class

// Property API
ninja.things = "2";
ninja.things === "2"; // => false
ninja.things === 2; // => true
ninja.numberOfCallsToThings(); // => 1

// Clear the private variable storage for the objects.
person = person.release(); // => null
ninja = ninja.release(); // => null
anotherNinja = anotherNinja.release(); // => null
```
