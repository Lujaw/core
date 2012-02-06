/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Sebastian Werner
==================================================================================================
*/

/**
 * Checks whether the ES5 extensions should be loaded to fix missing engine functions.
 *
 * - Array.isArray
 * 
 * - Array.prototype.forEach
 * - Array.prototype.map
 * - Array.prototype.filter
 * - Array.prototype.every
 * - Array.prototype.some
 * - Array.prototype.reduce
 * - Array.prototype.reduceRight
 * - Array.prototype.indexOf
 * - Array.prototype.lastIndexOf
 *
 * - Date.prototype.toISOString
 * - Date.prototype.toJSON
 *
 * - String.prototype.trim
 *
 * - JSON.parse
 * - JSON.stringify
 *
 * These ES5 methods are already fixed by loading the whole "fix" package:
 *
 * - Date.now
 * - Object.keys
 * - Function.prototype.bind 
 */
core.Module("core.detect.ES5", 
{
	/**
	 * {=Boolean} Whether ES5 is supported
	 * 
	 * If this results in false, we should load the ES5 package to fix missing features.
	 * Don't include Function.bind() as this is not natively supported widely and would mean to include a lot of code just for it.
	 */
	VALUE : !!(Array.isArray && Array.prototype.map && Date.prototype.toISOString && String.prototype.trim && this.JSON)
});


