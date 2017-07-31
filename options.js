async function getRules(){
	const stored = await browser.storage.local.get("rules");
	if(!stored.rules) return [];
	return stored.rules;
}

async function setRules(rules){
	await browser.storage.local.set({"rules": rules});
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
	n.innerHTML = str;
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
			if(!isPattern(x)) throw new Error("Invalid Format");
		});
		data.domains.forEach(x => {
			if(!isPattern(x)) throw new Error("Invalid Format");
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
			notify("Config parsing failed. Save aborted");
			return;
		}
	});
}

main().catch(e => console.error(e));