![logo](ext/icon.png)

# Corser

Corser WebExtension make it possible to:

* allows cross-domain request with sites which deny CORS in their headers
* allows embedding iframe of domain which restricts it by x-frame-options header

**Usage of this extension is intended for people who understand what they want to achieve. Otherwise it may compromise your security.**

[Install from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/corser/)

### Usage

Imagine we want to allow of embedding some iframe page of domain which denies embedding it pages.
Then after installing in options page we must paste the following sample config

<pre>
*://our-web-page-where-we-want-iframe-to-show.com/*
-
*://domain-which-restricts-iframe-usage.com/*
</pre>

`-` is a separator between origin urls and match urls

Each URL must conform to [Match Pattern](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns)

If you want another rule just separate it by double newline.

### Developing

In order to use you must have `web-ext` binary installed and be familiar with it. All task are described in `makefile`
