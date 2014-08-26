(function(context) {
	
	// This polyfill is based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
	var objectCreate = Object.create || (function () {
		function F() {};
		return function (o) {
			if (arguments.length > 1) { 
				throw Error('Second argument not supported');
			}
			if (typeof o != 'object') { 
				throw TypeError('Argument must be an object');
			}
			F.prototype = o;
			return new F();
		};
	})();
	
	var hasFunctionSerialization = /xyz/.test(function(){xyz;});
	var referencesSuper = hasFunctionSerialization ? /\b_super\b/ : /.*/;
	var referencesPrivate = hasFunctionSerialization ? /\b_private\b/ : /.*/;
	var referencesPrivateStatic = hasFunctionSerialization ? /\b_privateStatic\b/ : /.*/;
	
	var Has = {
		None 	: 0,
		Super   : (1 << 0), 
		Static	: (1 << 1),
		Private	: (1 << 2)
	};
	
	// The base Class implementation (does nothing)
	function Class(){}
	
	// Create a new Class that inherits from this class
	Class.extend = function(properties) {
		var _private = {}, _privateStatic, _super = this.prototype, _superRelease = _super.release, propertyDefinitions = {}, hasPropertyDefinitions = false;
		
		// Allow normal this._super() call in subclass release() definition, while still allowing release method for private variables within this scope.
		// In other words there are potentially two levels of the release method just in a single class definition.
		_super.release = function() {
			if (typeof _superRelease === "function")
				_superRelease.call(this);
			if (this.__private_instance_key__)
				delete _private[this.__private_instance_key__];
			return null;
		};
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		var prototype = objectCreate(_super);
		
		function _getPrivateInstanceKey() {
			var key = null;
			do {
				var newId = generateUuid();
				if (_private[newId] === undefined)
					key = newId;
			}
			while (key === null);
			
			_private[key] = {};
			
			// There is no acceptable polyfill for defineProperty, however in this case this workaround is okay.
			if (_.isFunction(Object.defineProperty))
				Object.defineProperty(this, "__private_instance_key__", { writable: false, configurable:false, value: key });
			else
				this.__private_instance_key__ = key;
		}
		
		// Copy the properties over onto the new prototype
		for (var name in properties) {
			var property = properties[name];
			
			// Check for property definition instance
			if (property instanceof Property) {
				hasPropertyDefinitions = true;
				propertyDefinitions[name] = property;
			}
			else {
				// Check if we're overwriting an existing function
				prototype[name] = (_.isFunction(property)) ? (function(name, fn) {
					// Check if we need to bind _super, _privateStatic or _private.
					var has = (typeof _super[name] == "function" && referencesSuper.test(property) ? Has.Super : 0)
								| (referencesPrivateStatic.test(property) ? Has.Static : 0)
								| (referencesPrivate.test(property) ? Has.Private : 0);
					if (has & Has.Static && !_privateStatic)
						_privateStatic = {};
					// For efficiency, we only temporarilly bind objects that are needed by the function.
					// These objects are bound to the instance temporarily while the function defined in properties executes.
					switch (has) {
						case 0: // Has.None 0000
							return properties[name];
							break;
						case 1: // Has.Super 001						
							return function() {
								var tmp = this._super;
								this._super = _super[name];
								var returnValue = fn.apply(this, arguments);        
								this._super = tmp;
								return returnValue;
							};
						case 2: // Has.Static 0010
							return function() {
								var privateStaticTmp = this._privateStatic;
								this._privateStatic = _privateStatic;
								var returnValue = fn.apply(this, arguments);
								this._privateStatic = privateStaticTmp;
								return returnValue;
							};
						case 4: // Has.Private = 0100
							return function() {
								var privateTmp = this._private;
								if (!this.__private_instance_key__)
									_getPrivateInstanceKey.call(this);
								this._private = _private[this.__private_instance_key__];
								var returnValue = fn.apply(this, arguments);
								this._private = privateTmp;
								return returnValue;
							};
						case 3: // Has.Super | Has.Static = 0011
							return function() {
								var tmp = this._super, privateStaticTmp = this._privateStatic;
								this._super = _super[name];
								this._privateStatic = _privateStatic;
								var returnValue = fn.apply(this, arguments);        
								this._super = tmp;
								this._privateStatic = privateStaticTmp;
								return returnValue;
							};
						case 5: // Has.Super | Has.Private = 0101
							return function() {
								var tmp = this._super;
								var privateTmp = this._private;
								if (!this.__private_instance_key__)
									_getPrivateInstanceKey.call(this);
								this._private = _private[this.__private_instance_key__];
								this._super = _super[name];
								var returnValue = fn.apply(this, arguments);        
								this._super = tmp;
								this._private = privateTmp;
								return returnValue;
							};
						case 6: // Has.Static | Has.Private = 0110
							return function() {
								var privateStaticTmp = this._privateStatic;
								var privateTmp = this._private;
								if (!this.__private_instance_key__)
									_getPrivateInstanceKey.call(this);
								this._private = _private[this.__private_instance_key__];
								this._privateStatic = _privateStatic;
								var returnValue = fn.apply(this, arguments);
								this._privateStatic = privateStaticTmp;
								this._private = privateTmp;
								return returnValue;
							};
						case 7: // Has.Super | Has.Static | Has.Private = 0111
							return function() {
								var tmp = this._super, privateStaticTmp = this._privateStatic;
								var privateTmp = this._private;
								if (!this.__private_instance_key__)
									_getPrivateInstanceKey.call(this);
								this._private = _private[this.__private_instance_key__];
								this._super = _super[name];
								this._privateStatic = _privateStatic;
								var returnValue = fn.apply(this, arguments);        
								this._super = tmp;
								this._privateStatic = privateStaticTmp;
								this._private = privateTmp;
								return returnValue;
							};
					}
				})(name, properties[name]) : properties[name];
			}
		}
		
		// The new constructor
		// All construction is actually done in the init method
		var SubClass;
		if (hasPropertyDefinitions) {
			if (!_.isFunction(Object.defineProperty))
				throw new Error("This browser is too old for Object.defineProperty.");
			
			SubClass = function() {
				_.each(propertyDefinitions, function(definition, name) {
					
						return Object.defineProperty(this, name, definition);
					if (definition.type === "accessor")
						
					else
						this[name] = definition.value;
				});
				if (_.isFunction(prototype.init)) {
					prototype.init.apply(this);
				}
			};
		}
		else
			SubClass = _.isFunction(prototype.init) ? prototype.init : function(){};
		
		// Populate our constructed prototype object
		SubClass.prototype = prototype;
		
		// Enforce the constructor to be what we expect
		prototype.constructor = SubClass;
		
		// And make this class extendable
		SubClass.extend = Class.extend;
		
		SubClass.generateUuid = generateUuid;
		return SubClass;
	};
	
	// Helper methods for UUID creation.
	// Based on code from http://af-design.com/blog/2008/09/05/updated-javascript-uuid-generator-v03/
	function generateUuid() { // UUID with random node
		var dg = new Date(1582, 10, 15, 0, 0, 0, 0),
			dc = new Date(),
			t = (dc.getTime() - dg.getTime()) * 10000,
			h = '-',
			hex = t.toString(16).toUpperCase();
			
		hex = '1' + paddedHex(t, '000000000000000');
		var tl = hex.substr(8,8),
			tm = hex.substr(4,4),
			thv = hex.substr(0,4),
			cs = rand(0xFFFF) | 0x008000 & 0x00BFFF,
			cshex = cs.toString(16).toUpperCase(),
			n = paddedHex(rand(0xFFFF), '0000') + paddedHex(rand(0xFFFF), '0000') + paddedHex(rand(0xFFFF), '0000');
		return tl + h + tm + h + thv + h + cshex + h + n;
	}
	function rand(max){ return Math.floor(Math.random() * (max + 1)); }
	function paddedHex(number, padding){
		var hex = number.toString(16).toUpperCase();
		return padding.substr(0, padding.length - hex.length) + hex;
	}
	
	context.Class = Class;
})(this);
