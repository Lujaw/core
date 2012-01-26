/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Sebastian Werner
==================================================================================================
*/

(function()
{
	var setters = {};
	var getters = {};

	var up = function(name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	};


	/**
	 * Generic setter/getter support for property API.
	 *
	 * Include this if your class uses properties and want to be able to generically
	 * set/get them based on the property names
	 */
	core.Class("core.property.MGeneric",
	{
		members :
		{
			/**
			 * Generic setter. Supports two possible use cases:
			 *
			 * <code>
			 * set("property", value);
			 * set({
			 *   property1: value1,
			 *   property2: value2
			 * });
			 * </code>
			 *
			 * @param property {String | Map} Name of property or map of key values
			 * @param value {var} Any value
			 * @return {var} Returns the value from the setter (if single property is used)
			 */
			set : function(property, value)
			{
				if (arguments.length == 2)
				{
					if (core.Env.isSet("debug")) {
						core.Assert.string(property);
					}

					var method = setters[property];
					if (!method) {
						method = setters[property] = "set" + up(property);
					}

					if (core.Env.isSet("debug")) {
						core.Assert.func(this[method], "Invalid property to set(): " + property);
					}

					return this[method](value);
				}
				else
				{
					if (core.Env.isSet("debug")) {
						core.Assert.map(property);
					}

					for (var name in property)
					{
						var method = setters[name];
						if (!method) {
							method = setters[name] = "set" + up(name);
						}

						if (core.Env.isSet("debug")) {
							core.Assert.func(this[method], "Invalid property to set(): " + name);
						}

						this[method](property[name]);
					}
				}
			},


			/**
			 * Generic getter. Supports two possible use cases:
			 *
			 * <code>
			 * get("property");
			 * get(["property1", "property2"]);
			 * </code>
			 *
			 * @param property {String | Array} String name of property or Array of names
			 * @param value {var} Any value
			 * @return {var} Returns the value from the setter (if single property is used)
			 */
			get : function(property)
			{
				if (typeof property == "string")
				{
					if (core.Env.isSet("debug")) {
						core.Assert.string(property);
					}

					var method = getters[property];
					if (!method) {
						method = getters[property] = "get" + up(property);
					}

					if (core.Env.isSet("debug")) {
						core.Assert.func(this[method], "Invalid property to get(): " + property);
					}

					return this[method]();
				}
				else
				{
					if (core.Env.isSet("debug")) {
						core.Assert.array(property);
					}

					var ret = {};

					for (var i=0, l=property.length; i<l; i++)
					{
						var name = property[i];
						var method = getters[name];
						if (!method) {
							method = getters[name] = "get" + up(name);
						}

						if (core.Env.isSet("debug")) {
							core.Assert.func(this[method], "Invalid property to get(): " + name);
						}

						ret[name] = this[method]();
					}

					return ret;
				}
			}
		}
	});
})();

