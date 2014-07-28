// ==UserScript==
// @name        Better Wolf Web
// @author      Jonathan Hamilton
// @contributor Mark Evaul
// @contributor James Lewis
// @namespace   http://jlhamilt.freeshell.org/
// @icon        http://thewolfweb.com/favicon.ico
// @version     2.0
// @description Extensions for the Wolf Web
// @include     http://thewolfweb.com/*
// @include     http://*.thewolfweb.com/*
// @include     http://brentroad.com/*
// @include     http://*.brentroad.com/*
// @include     https://thewolfweb.com/*
// @include     https://*.thewolfweb.com/*
// @include     https://brentroad.com/*
// @include     https://*.brentroad.com/*
// @exclude     http://site3.thewolfweb.com/*
// @exclude     https://site3.thewolfweb.com/*
// @require     https://raw.githubusercontent.com/douglascrockford/JSON-js/master/json2.js
// @require     https://code.jquery.com/jquery-1.11.1.min.js
// @require     https://code.jquery.com/jquery-migrate-1.2.1.min.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/compat.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/bww.utils.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/bww.controls.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/bww.media.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/bww.commands.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/bww.blocking.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/scaffold.js
// @require     https://raw.githubusercontent.com/lewisje/Better-Wolf-Web/master/gm_jq_xhr.js
// @noframes
// @run-at      document-end
// ==/UserScript==

if (window.top !== window.self) {
  $.noop(); // Don't run the script if the page is in an iframe.
} else {
  debugMode = GM_getValue('debug_mode', false);

  if (debugMode) {
    console.group('Better Wolf Web');
    console.time('Overall script execution');
  }

  scaffoldCommonElements();

  switch(location.pathname) {
    case '/message.aspx':
      threadList = scaffoldMessageBoards();
      break;
    case '/message_section.aspx':
      threadList = scaffoldThreads();
      break;
    case '/message_topic.aspx':
      threadScaffold = scaffoldThread();
      postsInThread = threadScaffold[0];
      usersInthread = threadScaffold[1];
      break;
    case '/user_info.aspx':
      currentUser = scaffoldUserProfile();
      break;
    case '/user_settings.aspx':
      scaffoldSettingsPage();
      break;
    default:
      break;
  }

  if (debugMode) {
    document.title += ' - Debugging';
    console.groupEnd('Better Wolf Web');
  }
}
