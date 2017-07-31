async function getRules(){
	const stored = await browser.storage.local.get("rules");
	if(!stored.rules) return [];
	return stored.rules;
}

async function setRules(rules){
	await browser.storage.local.set({"rules": rules});
}

function db(str){
	console.log(str);
	return str;
}

function RulesSerializer(){};
RulesSerializer.serialize = function(rules){
	return rules.map(x => {
		return `${x.origins.join("|")} - ${x.domains.join("|")}`
	}).join("\n");
};
RulesSerializer.unserialize = function(text){
	return text.split("\n").filter(line => line.length > 0).map(line => {
		const [matchesString, domainsString] = line.split(" - ");
		return {
			origins: matchesString.split("|"),
			domains: domainsString.split("|"),
		};
	});
};

async function main(){
	const saveButton = document.querySelector(".save-button");
	const area = document.querySelector(".rules");
	area.value = RulesSerializer.serialize(await getRules());
	saveButton.addEventListener("click", async e => {
		const rules = RulesSerializer.unserialize(area.value);
		await setRules(rules);
	});
}

main().catch(e => console.error(e));