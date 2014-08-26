extensible
==========

extensible.js is based on John Resig's Simple JavaScript Inheritance from [his blog](http://ejohn.org/blog/simple-javascript-inheritance/), with some added object oriented programming features.

Extensible gives you:

+ Simulated classical inheritance
+ Private static variables
+ Private instance varibales
 
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
  }
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

// Clear the private variable storage for the objects.
person = person.release(); // => null
ninja = ninja.release(); // => null
anotherNinja = anotherNinja.release(); // => null
```
