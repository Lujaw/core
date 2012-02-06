/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Sebastian Werner
--------------------------------------------------------------------------------------------------
  Based on the work of:
  Hogan.JS by Twitter, Inc.
  https://github.com/twitter/hogan.js
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
==================================================================================================
*/

(function () 
{
	// Setup regex	assignments
	// remove whitespace according to Mustache spec
	var rIsWhitespace = /\S/,
			rQuot = /\"/g,
			rNewline =	/\n/g,
			rCr = /\r/g,
			rSlash = /\\/g,
			tagTypes = {
				'#': 1, '^': 2, '/': 3,	 '!': 4, '>': 5,
				'<': 6, '=': 7, '_v': 8, '{': 9, '&': 10
			};
			
	var cache = {};
		
	
	/**
	 * This is a compiler for the [Mustache](http://mustache.github.com/) templating language which is based on [Hogan.js](http://twitter.github.com/hogan.js/). 
	 * For information on Mustache, see the [manpage](http://mustache.github.com/mustache.5.html) and the [spec](https://github.com/mustache/spec).
	 *
	 */
	core.Module("core.template.Compiler",
	{
		/**
		 * {String[]} Tokenizer for template @text {String} using the defined @delimiters {String}. Returns an array of tokens.
		 */
		scan : function scan(text, delimiters) {
			var len = text.length,
					IN_TEXT = 0,
					IN_TAG_TYPE = 1,
					IN_TAG = 2,
					state = IN_TEXT,
					tagType = null,
					tag = null,
					buf = '',
					tokens = [],
					seenTag = false,
					i = 0,
					lineStart = 0,
					otag = '{{',
					ctag = '}}';

			function addBuf() {
				if (buf.length > 0) {
					tokens.push(new String(buf));
					buf = '';
				}
			}

			function lineIsWhitespace() {
				var isAllWhitespace = true;
				for (var j = lineStart; j < tokens.length; j++) {
					isAllWhitespace =
						(tokens[j].tag && tagTypes[tokens[j].tag] < tagTypes['_v']) ||
						(!tokens[j].tag && tokens[j].match(rIsWhitespace) === null);
					if (!isAllWhitespace) {
						return false;
					}
				}

				return isAllWhitespace;
			}

			function filterLine(haveSeenTag, noNewLine) {
				addBuf();

				if (haveSeenTag && lineIsWhitespace()) {
					for (var j = lineStart, next; j < tokens.length; j++) {
						if (!tokens[j].tag) {
							if ((next = tokens[j+1]) && next.tag == '>') {
								// set indent to token value
								next.indent = tokens[j].toString()
							}
							tokens.splice(j, 1);
						}
					}
				} else if (!noNewLine) {
					tokens.push({tag:'\n'});
				}

				seenTag = false;
				lineStart = tokens.length;
			}

			function changeDelimiters(text, index) {
				var close = '=' + ctag,
						closeIndex = text.indexOf(close, index),
						delimiters = trim(
							text.substring(text.indexOf('=', index) + 1, closeIndex)
						).split(' ');

				otag = delimiters[0];
				ctag = delimiters[1];

				return closeIndex + close.length - 1;
			}

			if (delimiters) {
				delimiters = delimiters.split(' ');
				otag = delimiters[0];
				ctag = delimiters[1];
			}

			for (i = 0; i < len; i++) {
				if (state == IN_TEXT) {
					if (tagChange(otag, text, i)) {
						--i;
						addBuf();
						state = IN_TAG_TYPE;
					} else {
						if (text.charAt(i) == '\n') {
							filterLine(seenTag);
						} else {
							buf += text.charAt(i);
						}
					}
				} else if (state == IN_TAG_TYPE) {
					i += otag.length - 1;
					tag = tagTypes[text.charAt(i + 1)];
					tagType = tag ? text.charAt(i + 1) : '_v';
					if (tagType == '=') {
						i = changeDelimiters(text, i);
						state = IN_TEXT;
					} else {
						if (tag) {
							i++;
						}
						state = IN_TAG;
					}
					seenTag = i;
				} else {
					if (tagChange(ctag, text, i)) {
						tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
												 i: (tagType == '/') ? seenTag - ctag.length : i + otag.length});
						buf = '';
						i += ctag.length - 1;
						state = IN_TEXT;
						if (tagType == '{') {
							if (ctag == '}}') {
								i++;
							} else {
								cleanTripleStache(tokens[tokens.length - 1]);
							}
						}
					} else {
						buf += text.charAt(i);
					}
				}
			}

			filterLine(seenTag, true);

			return tokens;
		},
		
		
		/**
		 * {core.template.Template} Translates the @code {Array} tree from {#parse} into actual JavaScript 
		 * code (in form of a {core.template.Template} instance) to insert dynamic data fields. It uses
		 * the original @text {String} for template construction. Configuration happens using @options {Map}.
		 */
		generate : function (code, text, options) {
			if (options.asString) {
				return 'function(c,p,i){' + code + ';}';
			}
			
			return new core.template.Template(new Function('c', 'p', 'i', code), text, this, options);
		},
		
		
		/**
		 * {Array} Processes the @tokens {String[]} from {#scan} to create and return a tree.
		 * Configuration happens using @options {Map}.
		 */
		parse : function(tokens, text, options) {
			options = options || {};
			return buildTree(tokens, '', [], options.sectionTags || []);
		},
		
		
		/**
		 * {core.template.Template} Translates the tree from {#parse} into actual JavaScript 
		 * code (in form of a {core.template.Template} instance) to insert dynamic data fields.
		 * Configuration happens using @options {Map}. Uses a caching mechanism to prevent
		 * re-compiling identication templates.
		 */
		compile : function(text, options) {
			// options
			//
			// asString: false (default)
			//
			// sectionTags: [{o: '_foo', c: 'foo'}]
			// An array of object with o and c fields that indicate names for custom
			// section tags. The example above allows parsing of {{_foo}}{{/foo}}.
			//
			// delimiters: A string that overrides the default delimiters.
			// Example: "<% %>"
			//
			options = options || {};

			var key = text + '||' + !!options.asString;

			var t = cache[key];

			if (t) {
				return t;
			}

			t = this.generate(writeCode(this.parse(this.scan(text, options.delimiters), text, options)), text, options);
			return cache[key] = t;
		}
		
	});
	
	
	
	
	

	function cleanTripleStache(token) {
		if (token.n.substr(token.n.length - 1) === '}') {
			token.n = token.n.substring(0, token.n.length - 1);
		}
	}

	function trim(s) {
		if (s.trim) {
			return s.trim();
		}

		return s.replace(/^\s*|\s*$/g, '');
	}

	function tagChange(tag, text, index) {
		if (text.charAt(index) != tag.charAt(0)) {
			return false;
		}

		for (var i = 1, l = tag.length; i < l; i++) {
			if (text.charAt(index + i) != tag.charAt(i)) {
				return false;
			}
		}

		return true;
	}

	function buildTree(tokens, kind, stack, customTags) {
		var instructions = [],
				opener = null,
				token = null;

		while (tokens.length > 0) {
			token = tokens.shift();
			if (token.tag == '#' || token.tag == '^' || isOpener(token, customTags)) {
				stack.push(token);
				token.nodes = buildTree(tokens, token.tag, stack, customTags);
				instructions.push(token);
			} else if (token.tag == '/') {
				if (stack.length === 0) {
					throw new Error('Closing tag without opener: /' + token.n);
				}
				opener = stack.pop();
				if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
					throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
				}
				opener.end = token.i;
				return instructions;
			} else {
				instructions.push(token);
			}
		}

		if (stack.length > 0) {
			throw new Error('missing closing tag: ' + stack.pop().n);
		}

		return instructions;
	}

	function isOpener(token, tags) {
		for (var i = 0, l = tags.length; i < l; i++) {
			if (tags[i].o == token.n) {
				token.tag = '#';
				return true;
			}
		}
	}

	function isCloser(close, open, tags) {
		for (var i = 0, l = tags.length; i < l; i++) {
			if (tags[i].c == close && tags[i].o == open) {
				return true;
			}
		}
	}

	function writeCode(tree) {
		return 'var _=this;_.b(i=i||"");' + walk(tree) + 'return _.fl();';
	}

	function esc(s) {
		return s.replace(rSlash, '\\\\')
						.replace(rQuot, '\\\"')
						.replace(rNewline, '\\n')
						.replace(rCr, '\\r');
	}

	function chooseMethod(s) {
		return (~s.indexOf('.')) ? 'd' : 'f';
	}

	function walk(tree) {
		var code = '';
		for (var i = 0, l = tree.length; i < l; i++) {
			var tag = tree[i].tag;
			if (tag == '#') {
				code += section(tree[i].nodes, tree[i].n, chooseMethod(tree[i].n),
												tree[i].i, tree[i].end, tree[i].otag + " " + tree[i].ctag);
			} else if (tag == '^') {
				code += invertedSection(tree[i].nodes, tree[i].n,
																chooseMethod(tree[i].n));
			} else if (tag == '<' || tag == '>') {
				code += partial(tree[i]);
			} else if (tag == '{' || tag == '&') {
				code += tripleStache(tree[i].n, chooseMethod(tree[i].n));
			} else if (tag == '\n') {
				code += text('"\\n"' + (tree.length-1 == i ? '' : ' + i'));
			} else if (tag == '_v') {
				code += variable(tree[i].n, chooseMethod(tree[i].n));
			} else if (tag === undefined) {
				code += text('"' + esc(tree[i]) + '"');
			}
		}
		return code;
	}

	function section(nodes, id, method, start, end, tags) {
		return 'if(_.s(_.' + method + '("' + esc(id) + '",c,p,1),' +
					 'c,p,0,' + start + ',' + end + ',"' + tags + '")){' +
					 '_.rs(c,p,' +
					 'function(c,p,_){' +
					 walk(nodes) +
					 '});c.pop();}';
	}

	function invertedSection(nodes, id, method) {
		return 'if(!_.s(_.' + method + '("' + esc(id) + '",c,p,1),c,p,1,0,0,"")){' +
					 walk(nodes) +
					 '};';
	}

	function partial(tok) {
		return '_.b(_.rp("' +	 esc(tok.n) + '",c,p,"' + (tok.indent || '') + '"));';
	}

	function tripleStache(id, method) {
		return '_.b(_.t(_.' + method + '("' + esc(id) + '",c,p,0)));';
	}

	function variable(id, method) {
		return '_.b(_.v(_.' + method + '("' + esc(id) + '",c,p,0)));';
	}

	function text(id) {
		return '_.b(' + id + ');';
	}

})();