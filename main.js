function first(arr, fn){
	for(let i of arr){
		if(fn(i)) return i;
	};
	return null;
}

function firstIndex(arr, fn){
	for(let i = 0; i < arr.length; i++){
		if(fn(arr[i])) return i;
	}
	return null;
}

function testMultipleRegexp(obj, ...regexps){
	for(let reg of regexps){
		if(reg.test(obj)) return true;
	}
	return false;
}


function matchPatternToRegExp(pattern) {
	const matchPattern = (/^(?:(\*|http|https|file|ftp|app):\/\/(\*|(?:\*\.)?[^\/\*]+|)\/(.*))$/i);
  if (pattern === '<all_urls>') {
    return (/^(?:https?|file|ftp|app):\/\//);
  }
  const match = matchPattern.exec(pattern);
  if (!match) {
    throw new TypeError(`"${ pattern }" is not a valid MatchPattern`);
  }
	const [ , scheme, host, path, ] = match;
  return new RegExp('^(?:'
    + (scheme === '*' ? 'https?' : escape(scheme)) +':\/\/'
    + (host === '*' ? '[^\/]+?' : escape(host).replace(/^\*/g, '(?:[^\/]+?.)?'))
    + (path ? '\/'+ escape(path).replace(/\*/g, '.*') : '\/?')
	+')$');
}

async function getRules(){
	const stored = await browser.storage.local.get("rules");
	if(!stored.rules) return [];
	return stored.rules.map(item => {
		item.origins = item.origins.map(x => matchPatternToRegExp(x));
		item.domains = item.domains.map(x => matchPatternToRegExp(x));
		return item;
	})
}

async function main(){
	const data = {
		rules: await getRules(),
	};

	browser.storage.onChanged.addListener(async () => {
		data.rules = await getRules();
	});

	browser.webRequest.onHeadersReceived.addListener((e)=>{
		for(let rule of data.rules){
			if(testMultipleRegexp(e.originUrl, ...rule.origins) && testMultipleRegexp(e.url, ...rule.domains)){
				const frameHeader = first(e.responseHeaders, (x)=>{
					return x.name === "x-frame-options";
				});
				const corsHeader = first(e.responseHeaders, (x)=>{
					return x.name === "access-control-allow-origin";
				});
				frameHeader.value = `ALLOW-FROM ${e.originUrl}`;
				if (corsHeader) {
					corsHeader.value = `${e.originUrl}`;
				} else {
					e.responseHeaders.push({
						name: "access-control-allow-origin",
						value: `${e.originUrl}`,
					});
				};
				return {responseHeaders: e.responseHeaders};
			};
		};
	}, {urls: ["<all_urls>"]}, ["responseHeaders", "blocking"]);
}

main().catch(e => console.error(e));