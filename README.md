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
  init: function(isDancing){
    this.dancing = isDancing;
    this._private.isSneaky = false;
    this._privateStatic.instances = (this._privateStatic.instances || 0) + 1;
  },
  dance: function(){
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
  init: function(){
    this._super( false );
    this._private.isSneaky = true;
    this._privateStatic.instances = (this._privateStatic.instances || 0) + 1;
  },
  dance: function(){
    // Call the inherited version of dance()
    return this._super();
  },
  sneak: function() {
    return this._private.isSneaky;
  },
  ninjas: function() {
    return this._privateStatic.instances;
  },
  swingSword: function(){
    return true;
  }
});
 
var p = Person.make(true);
p.dance(); // => true
p.sneak(); // => false
 
var n = Ninja.make();
n.dance(); // => false
n.swingSword(); // => true
n.sneak(); // => true

var anotherNinja = Ninja.make();
p.people(); // => 1
n.ninjas(); // => 2

p._privateStatic; // => undefined
n._private; // => undefined
 
// Should all be true 
p instanceof Person && p instanceof Class &&
n instanceof Ninja && n instanceof Person && n instanceof Class

p = p.release(); // => null
n = n.release(); // => null
anotherNinja = anotherNinja.release(); // => null
```
