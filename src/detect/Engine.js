/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2011 Sebastian Werner
==================================================================================================
*/

/**
 * Engine detection for browser/environment
 */
core.Module("core.detect.Engine",
{
	/** {=String} One of `presto`, `gecko`, `webkit`, `trident` */
	VALUE : (function(global)
	{
		var engine;
		var doc = global.document;
		var docStyle = doc.documentElement.style;

		if (global.opera && Object.prototype.toString.call(opera) == "[object Opera]") {
			engine = "presto";
		} else if ("MozAppearance" in docStyle) {
			engine = "gecko";
		} else if ("WebkitAppearance" in docStyle) {
			engine = "webkit";
		} else if (typeof navigator.cpuClass === "string") {
			engine = "trident";
		}

		return engine;
	})(this)
});
