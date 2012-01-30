/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Sebastian Werner
==================================================================================================
*/

/**
 * @require {core.fix.DocumentHead}
 */
(function(global)
{
	var doc = global.document;

	// the following is a feature sniff for the ability to set async=false on dynamically created script elements, as proposed to the W3C
	// RE: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
	var supportsScriptAsync = doc.createElement("script").async === true;

	// Dynamic URI can be shared because we do not support reloading files
	var dynamicExtension = "?r=" + Date.now();

	// Used for shorten calls
	var assignCallback = function(elem, value) {
		elem.onload = elem.onerror = elem.onreadystatechange = value;
	};


	/**
	 * Generic script loader for features. Could be used for loading feature/class packages after initial load.
	 *
	 * (though limited feature set and file registration not useful for data transaction)
	 */
	core.Module("core.io.Script",
	{
		/** {Boolean} Whether the loader supports parallel requests */
		SUPPORTS_PARALLEL : supportsScriptAsync || core.Env.isSet("engine", "gecko") || core.Env.isSet("engine", "opera"),


		/**
		 * Loads a JavaScript file from the given URI.
		 *
		 * Automatically using preloading in modern browsers.
		 *
		 * @param uri {String} URI of script sources to load
		 * @param callback {Function ? null} Function to execute when script is loaded
		 * @param context {Object ? null} Context in which the callback should be executed
		 * @param nocache {Boolean ? false} Appends a dynamic parameter to each script to force a fresh copy
		 */
		load : function(uri, callback, context, nocache)
		{
			if (core.Env.isSet("debug"))
			{
				core.Assert.isType(uri, "String");

				if (callback != null) {
					core.Assert.isType(callback, "Function", "Invalid callback method!");
				}

				if (context != null) {
					core.Assert.isType(context, "Object", "Invalid callback context!");
				}

				if (nocache != null) {
					core.Assert.isType(nocache, "Boolean");
				}
			}

			if (core.Env.isSet("debug") && nocache == null) {
				nocache = true;
			}

			var head = doc.head;
			var elem = doc.createElement("script");

			// load script via 'src' attribute, set onload/onreadystatechange listeners
			assignCallback(elem, function(e)
			{
				var errornous = (e||global.event).type === "error";
				if (errornous)
				{
					console.warn("Could not load script: " + uri);
				}
				else
				{
					var readyState = elem.readyState;
					if (readyState && readyState !== "complete" && readyState !== "loaded") {
						return;
					}
				}

				// Prevent memory leaks
				assignCallback(elem, null);

				// Execute callback
				if (callback) {
					callback.call(context||global, uri, errornous);
				}
			});

			elem.src = nocache ? uri + dynamicExtension : uri;

			if (supportsScriptAsync) {
				elem.async = false;
			}

			head.insertBefore(elem, head.firstChild);
		}
	});
})(this);

