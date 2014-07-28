// ==UserScript==
// @name          Better Wolf Web
// @author        Jonathan Hamilton - Modified for Chrome by Mark Evaul - Enhanced by James Lewis
// @namespace     http://jlhamilt.freeshell.org/
// @version       2.0
// @description   Extensions for the Wolf Web
// @include       http://*.thewolfweb.com/*
// @include       http://*.brentroad.com/*
// @exclude       http://site3.thewolfweb.com/*
// @require       https://code.jquery.com/jquery-1.11.1.min.js
// @require       https://code.jquery.com/jquery-migrate-1.2.1.min.js
// @require       https://raw.github.com/lewisje/Better-Wolf-Web/master/bww.utils.js
// @require       https://raw.github.com/lewisje/Better-Wolf-Web/master/bww.commands.js
// @require       https://raw.github.com/lewisje/Better-Wolf-Web/master/bww.blocking.js
// @require       https://raw.github.com/lewisje/Better-Wolf-Web/master/scaffold.js
// @require       https://raw.github.com/lewisje/Better-Wolf-Web/master/gm_jq_xhr.js
// ==/UserScript==

;(function () {
  'use strict';
  if (window.top !== window.self) {
    $.noop(); // Don't run the script if the page is in an IFRAME.
  } else {
    debugMode = GM_getValue("debug_mode", false);

	if (debugMode) {
		console.group("Better Wolf Web");
		console.time("Overall script execution");
	}

	scaffoldCommonElements();

	switch(location.pathname) {
		case "/message.aspx":
			threadList = scaffoldMessageBoards();
			break;
		case "/message_section.aspx":
			threadList = scaffoldThreads();
			break;
		case "/message_topic.aspx":
			postsInThread = scaffoldThread()[0]; // Firefox supports multiple returns.
			usersInthread = scaffoldThread()[1];
			break;
		case "/user_info.aspx":
			currentUser = scaffoldUserProfile();
			break;
		case "/user_settings.aspx":
			scaffoldSettingsPage();
			break;
		default:
			break;
	}

	if (debugMode) {
		document.title += " - Debugging";
		console.groupEnd("Better Wolf Web");
	}
}
}());
