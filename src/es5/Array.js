/* 
==================================================================================================
	Core - JavaScript Foundation
	Copyright 2010-2012 Sebastian Werner
--------------------------------------------------------------------------------------------------
	Based on the work of ES5 Shim
	MIT License, Copyright (c) 2009, 280 North Inc. http://280north.com/ 
==================================================================================================
*/

/**
 * Adds ES5 Array methods if these are not implemented by the engine.
 */
Object.addStatics("Array",
{
	/**
	 * Implements ES5 `isArray` method.
	 * See also: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	 */
	isArray : function(value) {
		return value != null && Object.prototype.toString.call(value) == "[object Array]";
	}
}, true);

Object.addMembers("Array",
{
	/**
	 * Calls function @fun {Function} once for each element present in the array, in ascending order.
	 *
	 * ES5 15.4.4.18: http://es5.github.com/#x15.4.4.18
	 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
	 */
	forEach : function forEach(fun /*, thisp*/) {
		var self = toObject(this);
		var thisp = arguments[1];
		var i = -1;
		var length = self.length >>> 0;

		// If no callback function or if callback is not a callable function
		if (_toString(fun) != "[object Function]") {
			throw new TypeError(); // TODO message
		}

		while (++i < length) 
		{
			if (i in self) 
			{
				// Invoke the callback function with call, passing arguments:
				// context, property value, property key, thisArg object context
				fun.call(thisp, self[i], i, self);
			}
		}
	},

	/**
	 * {Array} Calls function @fun {Function} once for each element in the array, in ascending order, 
	 * and constructs a new `Array` from the results.
	 *
	 * - ES5 15.4.4.19: http://es5.github.com/#x15.4.4.19
	 * - https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
	 */
	map : function map(fun /*, thisp*/) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;
		var result = Array(length);
		var thisp = arguments[1];

		// If no callback function or if callback is not a callable function
		if (_toString(fun) != "[object Function]") {
			throw new TypeError(); // TODO message
		}

		for (var i = 0; i < length; i++) 
		{
			if (i in self) {
				result[i] = fun.call(thisp, self[i], i, self);
			}
		}
		
		return result;
	},

	/**
	 * {Array} Calls function @fun {Function} once for each element in the array, in ascending order, 
	 * and constructs a new `Array` of all the values for which @fun returns `true`.
	 *
	 * - ES5 15.4.4.20: http://es5.github.com/#x15.4.4.20
	 * - https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
	 */
	filter : function filter(fun /*, thisp */) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;
		var result = [];
		var value;
		var thisp = arguments[1];

		// If no callback function or if callback is not a callable function
		if (_toString(fun) != "[object Function]") {
			throw new TypeError(); // TODO message
		}

		for (var i = 0; i < length; i++) 
		{
			if (i in self) 
			{
				value = self[i];
				if (fun.call(thisp, value, i, self)) {
					result.push(value);
				}
			}
		}
		
		return result;
	},

	/**
	 * {Boolean} Calls function @fun {Function} once for each element present in the array, in ascending order, 
	 * until it finds one where @fun returns `false`. If such an element is found, every immediately 
	 * returns `false`. Otherwise, if @fun returned `true` for all elements, every will return `true`.
	 *
	 * - ES5 15.4.4.16: http://es5.github.com/#x15.4.4.16
	 * - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
	 */
	every : function every(fun /*, thisp */) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;
		var thisp = arguments[1];

		// If no callback function or if callback is not a callable function
		if (_toString(fun) != "[object Function]") {
			throw new TypeError(); // TODO message
		}

		for (var i = 0; i < length; i++) 
		{
			if (i in self && !fun.call(thisp, self[i], i, self)) {
				return false;
			}
		}
		
		return true;
	},

	/**
	 *
	 *
	 * - ES5 15.4.4.17: http://es5.github.com/#x15.4.4.17
	 * - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
	 */
	some : function some(fun /*, thisp */) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;
		var thisp = arguments[1];

		// If no callback function or if callback is not a callable function
		if (_toString(fun) != "[object Function]") {
			throw new TypeError(); // TODO message
		}

		for (var i = 0; i < length; i++) 
		{
			if (i in self && fun.call(thisp, self[i], i, self)) {
				return true;
			}
		}
		
		return false;
	},

	/**
	 *
	 *
	 * - ES5 15.4.4.21: http://es5.github.com/#x15.4.4.21
	 * - https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
	 */
	reduce : function(fun /*, initial*/) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;

		// If no callback function or if callback is not a callable function
		if (_toString(fun) != "[object Function]") {
			throw new TypeError(); // TODO message
		}

		// no value to return if no initial value and an empty array
		if (!length && arguments.length == 1) {
			throw new TypeError(); // TODO message
		}

		var i = 0;
		var result;
		if (arguments.length >= 2) {
			result = arguments[1];
		} 
		else 
		{
			do 
			{
				if (i in self) 
				{
					result = self[i++];
					break;
				}

				// if array contains no values, no initial value to return
				if (++i >= length) {
					throw new TypeError(); // TODO message
				}
				
			} while (true);
		}

		for (; i < length; i++) 
		{
			if (i in self) {
				result = fun.call(void 0, result, self[i], i, self);
			}
		}

		return result;
	},

	/**
	 *
	 *
	 * - ES5 15.4.4.22: http://es5.github.com/#x15.4.4.22
	 * - https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
	 */
	reduceRight : function(fun /*, initial*/) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;

		// If no callback function or if callback is not a callable function
		if (_toString(fun) != "[object Function]") {
			throw new TypeError(); // TODO message
		}

		// no value to return if no initial value, empty array
		if (!length && arguments.length == 1) {
			throw new TypeError(); // TODO message
		}

		var result, i = length - 1;
		if (arguments.length >= 2) 
		{
			result = arguments[1];
		}
		else
		{
			do 
			{
				if (i in self) 
				{
					result = self[i--];
					break;
				}

				// if array contains no values, no initial value to return
				if (--i < 0) {
					throw new TypeError(); // TODO message
				}
				
			} while (true);
		}

		do 
		{
			if (i in this) {
				result = fun.call(void 0, result, self[i], i, self);
			}
		} while (i--);

		return result;
	},

	/**
	 *
	 *
	 * - ES5 15.4.4.14: http://es5.github.com/#x15.4.4.14
	 * - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	 */
	indexOf : function(sought /*, fromIndex */ ) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;

		if (!length) {
			return -1;
		}

		var i = 0;
		if (arguments.length > 1) {
			i = toInteger(arguments[1]);
		}

		// handle negative indices
		i = i >= 0 ? i : Math.max(0, length + i);
		for (; i < length; i++) 
		{
			if (i in self && self[i] === sought) {
				return i;
			}
		}
		
		return -1;
	},

	/**
	 * 
	 *
	 * - ES5 15.4.4.15: http://es5.github.com/#x15.4.4.15
	 * - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
	 */
	lastIndexOf : function(sought /*, fromIndex */) 
	{
		var self = toObject(this);
		var length = self.length >>> 0;

		if (!length) {
			return -1;
		}
		
		var i = length - 1;
		if (arguments.length > 1) {
			i = Math.min(i, toInteger(arguments[1]));
		}
		
		// handle negative indices
		i = i >= 0 ? i : length - Math.abs(i);
		for (; i >= 0; i--) 
		{
			if (i in self && sought === self[i]) {
				return i;
			}
		}
		
		return -1;
	}
	
}, true);

