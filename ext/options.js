async function storageGet(key, def = null){
	const stored = await browser.storage.local.get(key);
	if(!(key in stored)) return def;
	return stored[key];
}

async function storageSet(key, value){
	await browser.storage.local.set({[key]: value});
}

async function getRules(){
	return await storageGet("rules", []);
}

async function setRules(rules){
	await storageSet("rules", rules);
}

function isPattern(pattern) {
	const matchPattern = (/^(?:(\*|http|https|file|ftp|app):\/\/(\*|(?:\*\.)?[^\/\*]+|)\/(.*))$/i);
	if (pattern === '<all_urls>') return true;
	const match = matchPattern.exec(pattern);
	return !!match;
}

function dbg(str){
	console.log(str);
	return str;
}

function notify(str){
	const n = document.querySelector(".notification");
	n.innerText = str;
}

function RulesSerializer(){};
RulesSerializer.serialize = function(rules){
	return rules.map(x => {
		return `${x.origins.join("\n")}\n-\n${x.domains.join("\n")}`
	}).join("\n\n");
};
RulesSerializer.unserialize = function(text){
	return text.split(/\n{2,}/).filter(line => line.length > 0).map(line => {
		const [matchesString, domainsString] = line.split("\n-\n");
		const data = {
			origins: matchesString.split("\n"),
			domains: domainsString.split("\n"),
		}
		data.origins.forEach(x => {
			if(!isPattern(x)) throw new Error(`Parse Error: "${x}" is invalid origin`);
		});
		data.domains.forEach(x => {
			if(!isPattern(x)) throw new Error(`Parse Error: "${x}" is invalid target`);
		});
		return data;
	});
};

async function main(){
	const saveButton = document.querySelector(".save-button");
	const area = document.querySelector(".rules");
	area.value = RulesSerializer.serialize(await getRules());
	saveButton.addEventListener("click", async e => {
		try{
			const rules = RulesSerializer.unserialize(area.value);
			await setRules(rules);
			notify("Rules saved");
		} catch (e) {
			if(e.message.indexOf("Parse Error:") === 0){
				notify(`Config parsing failed: \n${e.message}`);
			} else {
				notify(`Config parsing failed. Save aborted`);
			};
			return;
		}
	});

	const visibilityButton = document.querySelector(".usage-visibility-button");
	const usageList = document.querySelector(".usage-list");
	const visibilityState = await storageGet("usage-visibility", true);
	visibilityButton.addEventListener("click", async ()=>{
		if(usageList.classList.contains("hidden")){
			visibilityButton.innerText = "Hide";
			usageList.classList.remove("hidden");
			await storageSet("usage-visibility", true);
		} else {
			visibilityButton.innerText = "Show";
			usageList.classList.add("hidden");
			await storageSet("usage-visibility", false);
		}
	});

	if(visibilityState === false){
		visibilityButton.innerText = "Show";
		usageList.classList.add("hidden");
	}
}

main().catch(e => console.error(e));