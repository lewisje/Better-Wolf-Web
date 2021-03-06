/*
 * Adds a new object to an array stored as a Greasemonkey value.
 * 
 * TODO: Implement a case-insensitive sort.
 */
function addGMValue(setting, string) {
  'use strict';
  if (debugMode) {
    console.log('Adding value "' + string + '" to ' + setting);
  }

  var oldValues = JSON.parse(GM_getValue(setting));
  oldValues = oldValues.push(string);
  oldValues.sort();

  var newValues = JSON.stringify(oldValues);
  GM_setValue(setting, newValues);

  if (debugMode) {
    console.dir(newValues);
  }
}

/*
 * Returns an anchor element created with the supplied parameters.
 */
function createLink(href, text, parameters) {
  'use strict';
  var newLink = $(document.createElement('a'));

  newLink.attr("href", href);
  newLink.text(text);

  /*
   * If a title has been provided in the parameters array, set it on the an-
   * chor element. Otherwise, default to the link text.
   */
  var title = (parameters.title !== undefined) ? parameters.title : text;
  newLink.attr("title", title);

  if (parameters.classes === undefined) {
    newLink.addClass("plain"); // This is a Wolf Web style.
  } else {
    /*
     * Apply each class in the classes array passed as part of the pa-
     * rameters to the link.
     */
    parameters.classes.forEach(
      function(element, index, array) {
        newLink.addClass(element);
      }
    );
  }

  if (parameters.attributes !== undefined) {
    /*
     * If an associative array of attributes has been passed in the pa-
     * rameters, apply them to the link. I don't check whether they're
     * valid for anchors--that's the browser's problem.
     */
    var key, attributes = parameters.attributes; // TODO: Unnecessary assignment?
    for (key in attributes) {
      newLink.attr(key, attributes[key]);
    }
  }

  return newLink;
}

/*
 * Given an array, returns a new array of only the unique members.
 */
function filterUniquesInArray(array) {
  'use strict';
  var arrayOfUniques = [], arrayLength = array.length;

  for (var i = 0; i < arrayLength; i++) {
    for (var j = i + 1; j < arrayLength; j++) {
      if (array[i] === array[j])
        j = ++i;
    }

    arrayOfUniques.push(array[i]);
  }

  return arrayOfUniques;
}

/*
 * TODO: Replace this obsolete wrapper with a call to the generic function
 * in the blocking library.
 */
function filterUniqueUsers(users) {
  'use strict';
  return filterUniquesInArray(users);
}

/*
 * Parses any URL parameters out of the document's location and stores them
 * in a Greasemonkey value for convenient use in other functions.
 */
function getURLParameters() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("URL parameters");
  }

  var parametersArray = {};

  // A bit hackish.
  if (location.href.indexOf("#") > -1) {
    location.assign(location.href.replace(/\/?#\//, "/"));
  }

  location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    var setting = value.split("#")[0]; // Hack
    parametersArray[key] = setting;
  });

  var parameters = JSON.stringify(parametersArray);
  GM_setValue("current_parameters", parameters);

  if (debugMode) {
    console.dir(parametersArray);
    console.groupEnd("URL parameters");
  }
}

/*
 * Replaces iframe elements with an anchor that links to the iframe's source.
 * 
 * TODO: Might be faster done inline while processing posts.
 */
function removeInlineFrames() {
  'use strict';
  var inlineFrames = $('.post_message_content iframe').not("[src*='youtube']").not("[src*='youtu.be']").not("[src*='dailymotion.com']").not("[src*='facebook.com']").not("[src*='myspace.com']").not("[src*='vimeo.com']");
  inlineFrames.each(function(){
    var iFrame = $(this), iFrameURL = iFrame.attr("src"), iFrameLink = createLink(iFrameURL, iFrameURL, {target: "new"});
    if (iFrameURL.match(/(maps\.(google|yahoo)\.com|openstreetmap\.org\/export\/embed|bing\.com\/maps|mapquest\.com\/embed|tiles\.mapbox\.com)/) === null) {
      iFrame.replaceWith(iFrameLink);
    }
  });
}
