/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2011 Sebastian Werner
--------------------------------------------------------------------------------------------------
  Based on code of Unify Project
  License: MIT + Apache (V2)
  Copyright: 2009-2011 Deutsche Telekom AG, Germany, http://telekom.com
==================================================================================================
*/

/**
 * This class comes with all relevant information regarding
 * the client's platform.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 */
Module("core.detect.Platform", 
{
	VALUE: (function() 
	{
		var input = navigator.platform || navigator.userAgent;
		var name;

		if (/Windows|Win32|Win64/.exec(input)) {
			name = "win";
		} else if (/Macintosh|MacPPC|MacIntel|Mac OS|iPad|iPhone|iPod/.exec(input)) {
			name = "mac";
		} else if (/X11|Linux|BSD|Sun OS|Maemo|Android|webOS/.exec(input)) {
			name = "unix";
		} else if (/RIM Tablet OS|SymbianOS/.exec(input)) {
			name = "other";
		}

		return name;
	})()
});

