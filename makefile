include ./.env

ignore_files = ".git" ".gitignore" "makefile" ".env" "web-ext-artifacts" "icon.psd"

build:
	web-ext build --ignore-files ${ignore_files}

run:
	web-ext run

sign:
	source .env && web-ext sign --api-key ${APIKEY} --api-secret ${APISECRET} --ignore-files ${ignore_files}