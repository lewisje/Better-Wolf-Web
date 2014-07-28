/*!
 * contentloaded.js
 *
 * Author: Diego Perini (diego.perini at gmail.com)
 * Summary: cross-browser wrapper for DOMContentLoaded
 * Updated: 20101020
 * License: MIT
 * Version: 1.2
 *
 * URL:
 * http://javascript.nwbox.com/ContentLoaded/
 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
 *
 */
// @win window reference
// @fn function reference
function contentLoaded(win, fn) {
  'use strict';
  var done = false, top = true, doc = win.document, root = doc.documentElement,
  add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
  rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
  pre = doc.addEventListener ? '' : 'on',
  init = function(e) {
    if (e.type === 'readystatechange' && doc.readyState !== 'complete') return;
    (e.type === 'load' ? win : doc)[rem](pre + e.type, init, false);
    if (!done && (done = true)) fn.call(win, e.type || e);
  },
  poll = function() {
    try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
    init('poll');
  };
  if (doc.readyState === 'complete') fn.call(win, 'lazy');
  else {
    if (doc.createEventObject && root.doScroll) {
      try { top = !win.frameElement; } catch(e) { }
      if (top) poll();
    }
    doc[add](pre + 'DOMContentLoaded', init, false);
    doc[add](pre + 'readystatechange', init, false);
    win[add](pre + 'load', init, false);
  }
}
function cb_addEventListener(obj, evt, fnc) {
  'use strict';
  if (evt === "DOMContentLoaded") return contentLoaded(window, fnc);
  // W3C model
  if (obj.addEventListener) {
    obj.addEventListener(evt, fnc, false);
    return true;
  } 
  // Microsoft model
  else if (obj.attachEvent) {
    return obj.attachEvent('on' + evt, fnc);
  }
  // Browser doesn't support W3C or MSFT model, go on with traditional
  else {
    evt = 'on' + evt;
    if (typeof obj[evt] === 'function') {
      // Object already has a function on traditional
      // Let's wrap it with our own function inside another function
      fnc = (function(f1, f2) {
        return function () {
          f1.apply(this, arguments);
          f2.apply(this, arguments);
        };
      }(obj[evt], fnc));
    }
    obj[evt] = fnc;
    return true;
  }
  return false;
}
if (typeof Array.prototype.indexOf !== 'function') {
  Array.prototype.indexOf = function (obj, start) {
    'use strict';
    var i;
    for (i = (start || 0), j = this.length; i < j; i += 1) {
      if (this[i] === obj) return i;
    }
    return -1;
  };
}
if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    'use strict';
    return String(this).replace(/^[\s\u00a0]+|[\s\u00a0]+$/g, '');
  };
}
// Google Chrome GM_* (greasemonkey functions) emulation: http://userscripts-mirror.org/scripts/review/68559
// description from 2010, now preferring native versions
// --------------------------------
// Google Chrome can install userscripts natively, 
//   eg see http://3rdnews.info/20100201496080-news-it-news-chrome-4-supports-greasemonkey-user-scripts-without-an-extension-userscripts.html
//   (There is the Greasemetal extension http://greasemetal.31tools.com, but it's not required, and it didn't work for me)
// However, scripts that use GM_* functions don't work, see:
//   https://code.google.com/p/chromium/issues/detail?id=16341
//   https://code.google.com/p/chromium/issues/detail?id=4476
// This script provides the following functions, allowing you to use MANY MORE userscripts in Chrome:
// GM_setValue(key,value)
//   Stores the variable value as a cookie so it can be retrieved later. With Greasemonkey, these would be available to the script no matter what site it is being used on. With this script, it is available only for the current domain (as with normal cookies). Unlike Greasemonkey, which can store only numbers, strings and boolean values, this script can store regular expressions, dates, functions, arrays and objects as well (it utilises my toRecoverableString function).
// GM_getValue(key[,defaultValue])
//   Returns the previously stored variable using the given key. If none, it returns the defaultValue, or undefined if no defaultValue is provided.
// GM_deleteValue(key)
//   Deletes the stored value - this is not a normal Greasemonkey function, but it just seemed sensible to provide a way to delete them again...
// GM_registerMenuCommand(title,function)
//   Adds a menu item with the specified title that runs the specified function when clicked. Unlike Greasemonkey (which uses the browser's own menu), this script places a menu in the top right corner of the page when needed - it is even keyboard accessible, using spatial navigation.
// GM_xmlhttpRequest(details)
//   Performs an XMLHttpRequest using the XMLHttpRequest constructor. Restricted to the same domain (the Greasemonkey function has no cross domain restrictions), but it's better than nothing
// GM_addStyle(CSSString)
//   Adds a stylesheet LINK tag to the document containing the new CSS. Note that this can cause problems with sites using jQuery, or stylesheet switching scripts.
// Additionally, it maps window._content to window, as this is unnecessarily used by many Greasemonkey scripts.
//
// Adapted from http://www.howtocreate.co.uk/operaStuff/userjs/aagmfunctions.js by TarquinWJ, version 1.3.1
// See http://www.howtocreate.co.uk/operaStuff/userJavaScript.html for details

if (typeof GM_setValue !== 'function') {
  var GM_setValue = function (cookieName, cookieValue, lifeTime) {
    'use strict';
    if (!cookieName) return;
    if (lifeTime === "delete") lifeTime = -10;
    else lifeTime = 31536000;
    document.cookie = escape(cookieName) + '=' + escape(getRecoverableString(cookieValue)) +
      ';expires=' + (new Date((new Date()).getTime() + (1000 * lifeTime))).toGMTString() + ';path=/';
  };
}

if (typeof GM_getValue !== 'function') {
  var GM_getValue = function (cookieName, oDefault) {
    'use strict';
    var cookieJar = document.cookie.split('; '), oneCookie, footm, x;
    for (x = 0; x < cookieJar.length; x++) {
      oneCookie = cookieJar[x].split('=');
      if(oneCookie[0] === escape(cookieName)) {
        try {
          eval('footm = ' + unescape(oneCookie[1]));
        } catch(e) {return oDefault;}
        return footm;
      }
    }
    return oDefault;
  };
}

if (typeof GM_deleteValue !== 'function') {
  var GM_deleteValue = function (oKey) {
    'use strict';
    //yes, they didn't seem to provide a way to delete variables in Greasemonkey, and the user must use about:config to
    //delete them - so the stored variables will pile up forever ...
    GM_setValue(oKey, '', 'delete');
  };
}

var GM_falsifiedMenuCom = [], hasPageGMloaded = false;
if (typeof GM_registerMenuCommand !== 'function') {
  var GM_registerMenuCommand = function (oText, oFunc) {
    'use strict';
    GM_falsifiedMenuCom[GM_falsifiedMenuCom.length] = [oText, oFunc];
    if (hasPageGMloaded) doGMMeenoo(); //if the page has already loaded, do it now
  };
}

function doGMMeenoo() {
  'use strict'
  if (!GM_falsifiedMenuCom.length) return;
  //create a menu of commands in the top corner
  var foo = document.getElementById('GM_Falsify_me'), fs, fm, fal, bar, baz, bing, bf, bb,
    par = document.body ? document.body : document.documentElement;
  if (foo) par.removeChild(foo);
  foo = document.createElement('GMmenoo');
  foo.id = 'GM_Falsify_me';
  par.appendChild(foo);
  fs = foo.style;
  fs.border = '1px solid #000';
  fs.backgroundColor = '#bbf';
  fs.color = '#000';
  fs.position = 'fixed';
  fs.zIndex = '100000';
  fs.top = '0px';
  fs.right = '0px';
  fs.padding = '2px';
  fs.overflow = 'hidden';
  fs.height = '1.3em';
  foo.appendChild(bar = document.createElement('b'))
  bar.style.cursor = 'move';
  cb_addEventListener(bar, 'click', function () {
    this.parentNode.style.left = this.parentNode.style.left ? '' : '0px';
    this.parentNode.style.right = this.parentNode.style.right ? '' : '0px';
  });
  bar.appendChild(document.createTextNode('User Script Commands'));
  foo.appendChild(bar = document.createElement('ul'));
  bar.style.margin = '0px';
  bar.style.padding = '0px';
  bar.style.listStylePosition = 'inside';
  fal = function (i) {
    return function () {
      GM_falsifiedMenuCom[i][1](arguments[0]);
      return false;
    };
  };
  bf = function () {this.parentNode.style.height = '';};
  bb = function () {this.parentNode.style.height = '1.3em';};
  for(var i = 0; fm = GM_falsifiedMenuCom[i]; i++) {
    baz = document.createElement('li');
    baz.appendChild(bing = document.createElement('a'));
    bing.setAttribute('href', '#');
    cb_addEventListener(bing, 'click', fal(i));
    cb_addEventListener(bing, 'focus', bf);
    cb_addEventListener(bing, 'blur', bb);
    bing.appendChild(document.createTextNode(GM_falsifiedMenuCom[i][0]));
    bar.appendChild(baz);
  }
  foo.onmouseover = function () { this.style.height = ''; };
  foo.onmouseout = function () { this.style.height = '1.3em'; };
}
// GM_log = opera.postError;
cb_addEventListener(window, 'DOMContentLoaded', function () {'use strict'; hasPageGMloaded = true; doGMMeenoo();});

window._content = window;

function getRecoverableString(oVar,notFirst) {
  'use strict';
  var oType = typeof oVar;
  if ((oType === 'null') || (oType === 'object' && !oVar)) {
    //most browsers say that the typeof for null is 'object', but unlike a real
    //object, it will not have any overall value
    return 'null';
  }
  if (oType === 'undefined') return 'window.uDfXZ0_d';
  if (oType === 'object') {
    //Safari throws errors when comparing non-objects with window/document/etc
    if (oVar === window) return 'window';
    if (oVar === document) return 'document';
    if (oVar === document.body) return 'document.body';
    if (oVar === document.documentElement) return 'document.documentElement';
  }
  if (oVar.nodeType && (oVar.childNodes || oVar.ownerElement)) return '{error:\'DOM node\'}';
  if (!notFirst) {
    Object.prototype.toRecoverableString = function (oBn) {
      if (this.tempLockIgnoreMe) return '{\'LoopBack\'}';
      this.tempLockIgnoreMe = true;
      var retVal = '{', sepChar = '', j;
      for (var i in this) {
        if (i === 'toRecoverableString' || i === 'tempLockIgnoreMe' || i === 'prototype' || i === 'constructor') continue;
        if (oBn && (i === 'index' || i === 'input' || i === 'length' || i === 'toRecoverableObString')) continue;
        j = this[i];
        if(!i.match(basicObPropNameValStr)) {
          //for some reason, you cannot use unescape when defining peoperty names inline
          for (var x = 0; x < cleanStrFromAr.length; x++) {
            i = i.replace(cleanStrFromAr[x],cleanStrToAr[x]);
          }
          i = '\'' + i + '\'';
        } else if (window.ActiveXObject && navigator.userAgent.indexOf('Mac') + 1 && !navigator.__ice_version &&
                  window.ScriptEngine && ScriptEngine() === 'JScript' && i.match(/^\d+$/)) {
          //IE mac does not allow numerical property names to be used unless they are quoted
          i = '\'' + i + '\'';
        }
        retVal += sepChar + i + ':' + getRecoverableString(j, true);
        sepChar = ',';
      }
      retVal += '}';
      this.tempLockIgnoreMe = false;
      return retVal;
    };
    Array.prototype.toRecoverableObString = Object.prototype.toRecoverableString;
    Array.prototype.toRecoverableString = function () {
      if (this.tempLock)return '[\'LoopBack\']';
      if (!this.length) {
        var oCountProp = 0;
        for (var i in this) {
          if (i !== 'toRecoverableString' && i !== 'toRecoverableObString' && i !== 'tempLockIgnoreMe' &&
              i !== 'prototype' && i !== 'constructor' && i !== 'index' && i !== 'input' && i !== 'length') oCountProp++;
        }
        if (oCountProp) return this.toRecoverableObString(true);
      }
      this.tempLock = true;
      var retVal = '[';
      for (var i = 0; i < this.length; i++) {
        retVal += (i ? ',' :'') + getRecoverableString(this[i], true);
      }
      retVal += ']';
      delete this.tempLock;
      return retVal;
    };
    Boolean.prototype.toRecoverableString = function () {return '' + this + '';};
    Date.prototype.toRecoverableString = function () {return 'new Date(' + this.getTime() + ')';};
    Function.prototype.toRecoverableString = function () {
      return this.toString().replace(/^\s+|\s+$/g, '').replace(/^function\s*\w*\([^\)]*\)\s*\{\s*\[native\s+code\]\s*\}$/i, 'function () {[\'native code\'];}');
    };
    Number.prototype.toRecoverableString = function () {
      if (isNaN(this)) return 'Number.NaN';
      if (this === Number.POSITIVE_INFINITY) return 'Number.POSITIVE_INFINITY';
      if (this === Number.NEGATIVE_INFINITY) return 'Number.NEGATIVE_INFINITY';
      return '' + this + '';
    };
    RegExp.prototype.toRecoverableString = function () {
      return '\/' + this.source + '\/' + (this.global ? 'g' : '') + (this.ignoreCase ? 'i' : '');
    };
    String.prototype.toRecoverableString = function () {
      var oTmp = escape(this);
      if (oTmp === this) return '\''+this+'\'';
      return 'unescape(\'' + oTmp + '\')';
    };
  }
  if (!oVar.toRecoverableString) return '{error:\'internal object\'}';
  var oTmp = oVar.toRecoverableString();
  if (!notFirst) {
    //prevent it from changing for...in loops that the page may be using
    delete Object.prototype.toRecoverableString;
    delete Array.prototype.toRecoverableObString;
    delete Array.prototype.toRecoverableString;
    delete Boolean.prototype.toRecoverableString;
    delete Date.prototype.toRecoverableString;
    delete Function.prototype.toRecoverableString;
    delete Number.prototype.toRecoverableString;
    delete RegExp.prototype.toRecoverableString;
    delete String.prototype.toRecoverableString;
  }
  return oTmp;
}
var basicObPropNameValStr = /^\w+$/, cleanStrFromAr = [/\\/g,/'/g,/"/g,/\r/g,/\n/g,/\f/g,/\t/g, new RegExp('-'+'->', 'g'), new RegExp('<!-'+'-', 'g'), /\//g], cleanStrToAr = ['\\\\', '\\\'', '\\\"', '\\r', '\\n', '\\f', '\\t', '-\'+\'->', '<!-\'+\'-', '\\\/'];

/* GM_xmlhttpRequest implementation adapted from the
Turnabout GM compatibility library:
http://www.reifysoft.com/turnabout.php
Used under the following license:

 Copyright (c) 2005, Reify Software, Inc.
 All rights reserved.

 Redistribution and use in source and binary forms,
 with or without modification, are permitted provided
 that the following conditions are met:

 1) Redistributions of source code must retain the
    above copyright notice, this list of conditions
    and the following disclaimer.
 2) Redistributions in binary form must reproduce the
    above copyright notice, this list of conditions
    and the following disclaimer in the documentation
    and/or other materials provided with the
    distribution.
 3) Neither the name of the Reify Software, Inc. nor
    the names of its contributors may be used to
    endorse or promote products derived from this
    software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS
 AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED    
 WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF
 USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
 USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 OF SUCH DAMAGE.

*/

/*
   Provide the XMLHttpRequest constructor for Internet Explorer 5.x-6.x:
   Other browsers (including Internet Explorer 7.x-9.x) do not redefine
   XMLHttpRequest if it already exists.
 
   This example is based on findings at:
   http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
*/
if (typeof XMLHttpRequest === 'undefined') {
  var XMLHttpRequest = function () {
    'use strict';
    try {return new ActiveXObject('Msxml2.XMLHTTP.6.0');} catch (e) {}
    try {return new ActiveXObject('Msxml2.XMLHTTP.3.0');} catch (e) {}
    try {return new ActiveXObject('Microsoft.XMLHTTP');} catch (e) {}
    throw new Error('This browser does not support XMLHttpRequest.');
  };
}

//yes, I know the domain limitations, but it's better than an outright error
if (typeof GM_xmlhttpRequest !== 'function') {
  var GM_xmlhttpRequest = function (details) {
    'use strict';
    var xmlhttp = new XMLHttpRequest();
    cb_addEventListener(xmlhttp, 'readystatechange', function() {
      var responseState = {
        responseXML: (xmlhttp.readyState === 4 ? xmlhttp.responseXML : ''),
        responseText: (xmlhttp.readyState === 4 ? xmlhttp.responseText : ''),
        readyState: xmlhttp.readyState,
        responseHeaders: (xmlhttp.readyState === 4 ? xmlhttp.getAllResponseHeaders() : ''),
        status: (xmlhttp.readyState === 4 ? xmlhttp.status : 0),
        statusText: (xmlhttp.readyState === 4 ? xmlhttp.statusText : '')
      }
      if (details["onreadystatechange"]) {
        details["onreadystatechange"](responseState);
      }
      if (xmlhttp.readyState === 4) {
        if (details["onload"] && xmlhttp.status >= 200 && xmlhttp.status < 300) {
          details["onload"](responseState);
        }
        if (details["onerror"] && (xmlhttp.status < 200 || xmlhttp.status >= 300)) {
          details["onerror"](responseState);
        }
      }
    });
    try {
      //cannot do cross domain
      xmlhttp.open(details.method, details.url);
    } catch(e) {
      if (details["onerror"]) {
        //simulate a real error
        details["onerror"]({
          responseXML: '',
          responseText: '',
          readyState: 4,
          responseHeaders: '',
          status: 403,
          statusText: 'Forbidden'
        });
      }
      return;
    }
    if (details.headers) {
      for (var prop in details.headers) {
        xmlhttp.setRequestHeader(prop, details.headers[prop]);
      }
    }
    xmlhttp.send((typeof details.data === 'undefined') ? null : details.data);
  };
}

if (typeof GM_addStyle !== 'function') {
  var GM_addStyle = function (css) {
    'use strict';
    var NSURI = 'http://www.w3.org/1999/xhtml', hashead = document.getElementsByTagName('head')[0];
    var parentel = hashead || document.documentElement, newElement = document.createElementNS(NSURI, 'link');
    newElement.setAttributeNS(NSURI, 'rel', 'stylesheet');
    newElement.setAttributeNS(NSURI, 'type', 'text/css');
    newElement.setAttributeNS(NSURI, 'href', 'data:text/css,' + encodeURIComponent(css));
    if (hashead) parentel.appendChild(newElement);
    else parentel.insertBefore(newElement, parentel.firstChild);
  };
}
