/* 
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Sebastian Werner
==================================================================================================
*/

(function(global) 
{
	// Dynamic URI can be shared because we do not support reloading files
	var dynamicExtension = "?r=" + Date.now();

	/** 
	 * Image loader with support for load callback.
	 */
	core.Module("core.io.Image",
	{
		/** {Boolean} Whether the loader supports parallel requests. Always true for images. */
		SUPPORTS_PARALLEL : true,

		/**
		 * Loads an image and fires a callback when the image was loaded
		 *
		 * @param uri {String} URI pointing to the image
		 * @param callback {Function ? null} Callback that fires when image is loaded
		 * @param context {Object ? null} Context in which the callback is being executed. Defaults to global context.
		 * @param nocache {Boolean ? false} Appends a dynamic parameter to each URL to force a fresh copy
		 */
		load : function(uri, callback, context, nocache) 
		{
			if (core.Env.isSet("debug")) 
			{
				core.Assert.assertTypeOf(uri, "String");

				if (callback != null) {
					core.Assert.assertTypeOf(callback, "Function", "Invalid callback method!");
				}

				if (context != null) {
					core.Assert.assertTypeOf(context, "Object", "Invalid callback context!");
				}

				if (nocache != null) {
					core.Assert.assertTypeOf(nocache, "Boolean");
				}
			}
			
			var img = new Image;

			img.onload = img.onerror = function(e) 
			{
				img.onload = img.onerror = null;

				var errornous = (e||global.event).type === "error";
				if (core.Env.isSet("debug") && errornous) {
					console.warn("Could not load image: " + uri);
				}

				if (callback) 
				{
					callback.call(context || global, uri, errornous, {
						node: img,
						width : img.naturalWidth || img.width || 0,
						height : img.naturalHeight || img.height || 0
					});
				}
			}

			img.src = uri + (nocache ? dynamicExtension : "");
		}
	});
})(this);
