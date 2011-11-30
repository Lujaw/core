/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2011 Sebastian Werner
==================================================================================================
*/

(function() {
	
	var transform = core.bom.Style.property('transform');
	if (transform) {

		var gpuStacking = !!core.bom.Style.property('perspective');
		if (!gpuStacking) {

			// Note: translateZ is supported on some clients even if 3D transforms and perspective is not.
			var elem = document.createElement("div");
			var style = elem.style;
			var value = "translateZ(20px)";
			
			style[transform] = value
			gpuStacking = style[transform] == value;

		}
	}
	
	// Verify incoming parameters
	if (core.Env.isSet("debug")) 
	{
		var validate = function(args) 
		{
			// Three required parameters
			core.Test.assertElement(args[0]);
			core.Test.assertNumber(args[1]);
			core.Test.assertNumber(args[2]);
			
			// Two optional ones
			if (args[3] != null) 
			{
				// zIndex does not support floats.
				core.Test.assertInteger(args[3]);
			}

			if (args[4] != null) {
				core.Test.assertNumber(args[4]);
			}
		};
	}
	
	if (gpuStacking) 
	{
		var set = function(elem, x, y, z, zoom) 
		{
			if (core.Env.isSet("debug")) {
				validate(arguments);
			}

			// We default to z position zero instead of leaving it untouched to force acceleration in Safari
			if (z == null) {
				z = 0;
			}

			var value = "translate(" + x + "px," + y + "px) translateZ(" + z + "px)";
			
			if (zoom != null) {
				value += " scale(" + zoom + ")";
			}
			
			elem.style[transform] = value;
		};
		
		var reset = function(elem) 
		{
			if (core.Env.isSet("debug")) {
				core.Test.assertElement(elem);
			}
			
			elem.style[transform] = "";
		};
	} 
	else if (transform) 
	{
		var set = function(elem, x, y, z, zoom) 
		{
			if (core.Env.isSet("debug")) {
				validate(arguments);
			}
			
			var value = "translate(" + x + "px," + y + "px)";

			if (zoom != null) {
				value += " scale(" + zoom + ")";
			}

			var style = elem.style;
			style[transform] = value;
			
			if (z != null) {
				style.zIndex = z;
			}
		};

		var reset = function(elem) 
		{
			if (core.Env.isSet("debug")) {
				core.Test.assertElement(elem);
			}
			
			var style = elem.style;
			style[transform] = "";
			style.zIndex = "";
		};
	}
	else 
	{
		var set = function(elem, x, y, z, zoom) 
		{
			if (core.Env.isSet("debug")) {
				validate(arguments);
			}
			
			var style = elem.style;
			style.left = (x / zoom) + "px";
			style.top = (y / zoom) + "px";

			if (z != null) {
				style.zIndex = z;
			}
			
			if (zoom != null) {
				style.zoom = zoom;
			}
		};

		var reset = function(elem) 
		{
			if (core.Env.isSet("debug")) {
				core.Test.assertElement(elem);
			}
			
			var style = elem.style;
			style.left = style.top = style.zIndex = style.zoom = "";
		};
	}
	
	
	/**
	 * High performance DOM node positioning with stacking and zooming support
	 */
	core.Module("core.bom.Position", 
	{
		/**
		 * Positions the given DOM element on coordinates x, y and z.
		 *
		 * @param elem {Element} DOM element to position
		 * @param x {Number} Left position
		 * @param y {Number} Top position
		 * @param z {Integer ? null} Depth position
		 * @param zoom {Number ? null} Zooming to apply
		 */ 
		set: set,
		
		/**
		 * Resets the position of the given DOM element
		 * 
		 * @param elem {Element} DOM element to reset
		 */
		reset: reset
	});
})();
