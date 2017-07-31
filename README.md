# Corser

Corser WebExtension make it possible to:

* allows cross-domain request with sites which deny CORS in their headers
* allows insertion of iframe by modifying x-frame-options header

**Use of this extension is intended for people who understand what they want to achieve. Otherwise it may compromise your security.**

### Usage

Imagine we want to allow of embedding some iframe page of domain which denies embedding it pages.
Then after installing in options page we must paste the following sample config

> \*://ourwebpagewherewewantiframetoshow.com/*
> \-
> \*://domainswhichrestrictsiframeusege.com/*

`-` is a separator between origin urls and match urls

Each URL must conform to [Match Pattern](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns)

If you want another rule just separate it by double newline.

### TODO

* Right now extension is tested only in firefox. Chrome and Opera in plans.

### Developing

In order to use you must have `web-ext` binary installed and be familiar with it. All task are described in `makefile`