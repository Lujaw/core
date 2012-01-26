/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Sebastian Werner
==================================================================================================
*/

(function(global)
{
	// Jasy is replacing this call via the kernel permutation
	var assets = core.Env.getValue("assets");

	var entryCache = {};
	var spriteCache = {};

	var getEntry = function(id)
	{
		if (core.Env.isSet("debug")) {
			core.Assert.string(id, "Invalid asset identifier: " + id);
		}

		var entry = entryCache[id];
		if (entry != null) {
			return entry;
		}

		var lastSlash = id.lastIndexOf("/");
		var dirName = id.slice(0, lastSlash);
		var fileName = id.slice(lastSlash+1);

		var images = assets.images;
		if (images && images[dirName]) {
			var entry = images[dirName][fileName];
		}

		if (!entry)
		{
			var files = assets.files;
			if (files && files[dirName]) {
				var entry = files[dirName][fileName];
			}
		}

		if (entry) {
			return entryCache[id] = entry;
		}
	};


	/**
	 * Contains information about images (size, format, clipping, ...) and
	 * other assets like CSS files, local data, ...
	 */
	core.Module("core.io.Asset",
	{
		/**
		 * Whether the registry has information about the given asset.
		 *
		 * @param id {String} The asset to get the information for
		 * @return {Boolean} <code>true</code> when the asset is known.
		 */
		has : function(id) {
			return entryCache[id] || getEntry(id) != null;
		},


		/**
		 * Loads the given asset and optionally executes the given callback after all are completed
		 *
		 * @param ids {Array} List of assets to load
		 * @param callback {Function ? null} Callback method to execute
		 * @param context {Object ? null} Context in which the callback function should be executed
		 * @param nocache {Boolean ? false} Whether a cache prevention logic should be applied (to force a fresh copy)
		 * @param type {String ? auto} Whether the automatic type detection should be disabled and the given type should be used.
		 */
		load: function(ids, callback, context, nocache, type) {

			var id, uri;

			var uris = [];
			var uriToId = {};

			for (var i=0, l=ids.length; i<l; i++) {
				id = ids[i];
				uri = this.toUri(id);

				uris.push(uri);
				uriToId[uri] = id;
			}

			var localCallback = function(uriData)
			{
				var idData = {};
				for (var uri in uriData) {
					idData[uriToId[uri]] = uriData[uri];
				}

				context ? callback.call(context, idData) : callback(idData);
			}

			return core.io.Queue.load(uris, localCallback, null, nocache, type);

		},


		/**
		 * Returns the dimensions of the given image ID
		 */
		getImageSize : function(id)
		{
			var entry = entryCache[id] || getEntry(id);
			if (core.Env.isSet("debug") && (!entry || entry.length < 3)) {
				throw new Error("Unknown image: " + id);
			}

			return {
				width: entry[1],
				height: entry[2]
			};
		},


		/**
		 * Returns sprite details for being used for the given image ID.
		 *
		 * Nothing is returned when the given ID is not available as part of an image sprite.
		 *
		 * @param id {String} Asset identifier
		 * @return {Map}
		 */
		getImageSprite : function(id)
		{
			var result = spriteCache[id];
			if (!result)
			{
				var entry = entryCache[id] || getEntry(id);
				if (core.Env.isSet("debug") && (!entry || entry.length < 5)) {
					throw new Error("Unknown image sprite: " + id);
				}

				var lastSlash = id.lastIndexOf("/");
				var dirName = id.substring(0, lastSlash);
				var spriteData = assets.sprites[dirName][entry[3]];
				var needsPosX = spriteData[4] == 1;
				var needsPosY = spriteData[5] == 1;

				spriteCache[id] = result = {
					uri : assets.roots[spriteData[1]] + "/" + dirName + "/" + spriteData[0],
					left : needsPosX ? entry[4] : 0,
					top : needsPosY ? needsPosX ? entry[5] : entry[4] : 0,
					width : spriteData[2],
					height : spriteData[3]
				};
			}

			return result;
		},


		/**
		 * Converts the given asset ID to a full qualified URI
		 *
		 * @param id {String} Asset ID
		 * @return {String} Resulting URI
		 * @throws when the asset ID is unknown
		 */
		toUri : function(id)
		{
			if (id == null) {
				return id;
			}

			var entry = entryCache[id] || getEntry(id);
			if (core.Env.isSet("debug") && !entry) {
				throw new Error("Could not figure out URL for asset: " + id);
			}

			// Differ between files (first case) and images (second case)
			var root = assets.roots[typeof entry == "number" ? entry : entry[0]];

			// Merge to full qualified URI
			return root + id.slice(id.indexOf("/"));
		}
	});
})(this);