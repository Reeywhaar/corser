function findIndex(arr, fn){
	for(let i = 0; i < arr.length; i++){
		if(fn(arr[i])) return i;
	}
	return null;
}

function find(arr, fn){
	const index = findIndex(arr, fn);
	return index === null ? null : arr[index];
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
			if(testMultipleRegexp(e.documentUrl, ...rule.origins) && testMultipleRegexp(e.url, ...rule.domains)){
				const frameHeader = find(e.responseHeaders, x => x.name === "x-frame-options" );
				const corsHeader = find(e.responseHeaders, x => x.name === "access-control-allow-origin" );
				if(frameHeader){
					frameHeader.value = `ALLOW-FROM ${e.documentUrl}`;
				} else {
					e.responseHeaders.push({
						name: "x-frame-options",
						value: `ALLOW-FROM ${e.documentUrl}`,
					});
				};
				if(corsHeader){
					corsHeader.value = `*`;
				} else {
					e.responseHeaders.push({
						name: "access-control-allow-origin",
						value: `*`,
					});
				};
				return {responseHeaders: e.responseHeaders};
			};
		};
	}, {urls: ["<all_urls>"]}, ["responseHeaders", "blocking"]);
}

main().catch(e => console.error(e));