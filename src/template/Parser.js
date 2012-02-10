(function() 
{
	function buildTree(tokens, stack) 
	{
		var instructions = [];
		var opener = null;
		var token = null;
				
		while (tokens.length > 0) 
		{
			token = tokens.shift();
			
			if (token.tag == "#" || token.tag == "^") 
			{
				stack.push(token);
				token.nodes = buildTree(tokens, stack);
				instructions.push(token);
			}
			else if (token.tag == "/") 
			{
				if (core.Env.isSet("debug") && stack.length === 0) {
					throw new Error("Closing tag without opener: /" + token.n);
				}
				
				opener = stack.pop();
				
				if (core.Env.isSet("debug") && token.n != opener.n) {
					throw new Error("Nesting error: " + opener.n + " vs. " + token.n);
				}
				
				opener.end = token.i;
				
				return instructions;
			} 
			else 
			{
				instructions.push(token);
			}
		}

		if (core.Env.isSet("debug") && stack.length > 0) {
			throw new Error("Missing closing tag: " + stack.pop().n);
		}

		return instructions;
	}
	
	
	/**
	 * This is a parser for the [Mustache](http://mustache.github.com/) templating language which is based on [Hogan.js](http://twitter.github.com/hogan.js/). 
	 * For information on Mustache, see the [manpage](http://mustache.github.com/mustache.5.html) and the [spec](https://github.com/mustache/spec).
	 */
	core.Module("core.template.Parser", 
	{

		/**
		 * {Array} Processes a list of @tokens {String[]} to create a tree.
		 */
		parse: function(text) 
		{
			var tokens = core.template.Tokenizer.tokenize(text);
			console.debug(JSON.stringify(tokens))
			return buildTree(tokens, []);
		}

	});
})();

