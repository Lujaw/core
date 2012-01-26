/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Sebastian Werner
==================================================================================================
*/

/**
 * For classes which use event firing properties.
 */
core.Interface("core.property.IEvent",
{
	members : 
	{
		/**
		 * Fires the given event type with the data of the properties
		 * current and old value to the object's event system.
		 */
		fireEvent : function(type, value, old) {}
	}
});
