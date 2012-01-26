/* 
==================================================================================================
	Core - JavaScript Foundation
	Copyright 2010-2012 Sebastian Werner
==================================================================================================
*/

// Fix for missing document.head
(function(doc) {
	if (doc && !doc.head) {
		doc.head = doc.getElementsByTagName('head')[0];
	}
})(document);
