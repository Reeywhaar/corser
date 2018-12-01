include ./.env

ignore_files = ".git" ".gitignore" "makefile" ".env" "web-ext-artifacts" "icon.psd" "README.MD"

build:
	web-ext -s ext build --ignore-files ${ignore_files}

run:
	web-ext -s ext run --firefox-profile ${WEB_EXT_FIREFOX_PROFILE}

sign:
	web-ext -s ext sign --api-key ${APIKEY} --api-secret ${APISECRET} --ignore-files ${ignore_files}