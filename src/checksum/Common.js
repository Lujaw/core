Module("core.checksum.Common", 
{
	
	/*
	 * Convert a raw string to a hex string
	 */
	rstr2hex : function(input)
	{
		try { hexcase } catch(e) { hexcase=0; }
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var output = "";
		var x;
		for(var i = 0; i < input.length; i++)
		{
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F)
						 +	hex_tab.charAt( x				 & 0x0F);
		}
		return output;
	},
	

	/*
	 * Convert a raw string to a base-64 string
	 */
	rstr2b64 : function(input)
	{
		try { b64pad } catch(e) { b64pad=''; }
		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var output = "";
		var len = input.length;
		for(var i = 0; i < len; i += 3)
		{
			var triplet = (input.charCodeAt(i) << 16)
									| (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
									| (i + 2 < len ? input.charCodeAt(i+2)			: 0);
			for(var j = 0; j < 4; j++)
			{
				if(i * 8 + j * 6 > input.length * 8) output += b64pad;
				else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
			}
		}
		return output;
	},
	
	
	/*
	 * Convert a raw string to an arbitrary string encoding
	 */
	rstr2any : function(input, encoding)
	{
		var divisor = encoding.length;
		var i, j, q, x, quotient;

		/* Convert to an array of 16-bit big-endian values, forming the dividend */
		var dividend = Array(Math.ceil(input.length / 2));
		for(i = 0; i < dividend.length; i++)
		{
			dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
		}

		/*
		 * Repeatedly perform a long division. The binary array forms the dividend,
		 * the length of the encoding is the divisor. Once computed, the quotient
		 * forms the dividend for the next step. All remainders are stored for later
		 * use.
		 */
		var full_length = Math.ceil(input.length * 8 /
																			(Math.log(encoding.length) / Math.log(2)));
		var remainders = Array(full_length);
		for(j = 0; j < full_length; j++)
		{
			quotient = Array();
			x = 0;
			for(i = 0; i < dividend.length; i++)
			{
				x = (x << 16) + dividend[i];
				q = Math.floor(x / divisor);
				x -= q * divisor;
				if(quotient.length > 0 || q > 0)
					quotient[quotient.length] = q;
			}
			remainders[j] = x;
			dividend = quotient;
		}

		/* Convert the remainders to the output string */
		var output = "";
		for(i = remainders.length - 1; i >= 0; i--)
			output += encoding.charAt(remainders[i]);

		return output;
	}
	
});
