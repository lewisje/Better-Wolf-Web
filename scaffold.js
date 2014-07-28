function User(username, userid) {
  'use strict';
  this.username = username;
  this.userid = parseInt(userid, 10);
}

User.prototype.userLink = function() {
  'use strict';
  var userLink = $(document.createElement('a'));
  userLink.attr("href", "user_info.aspx?user=" + this.userid);
  userLink.attr("title", this.username);
  userLink.addClass("user_link");
  userLink.text(this.username);
  return userLink;
};

User.prototype.postsLink = function() {
  'use strict';
  var postsLink = $(document.createElement('a'));
  postsLink.addClass("plain search_posts_link");
  postsLink.attr("title", "Search for " + userName + "'s posts");
  postsLink.attr("href", "message_search.aspx?type=posts&amp;username=" + encodeURI(userName));
  return postsLink;
};

function Post(postid, text, author, authorid) {
  'use strict';
  this.id = postid;
  this.text = text;
  this.author = new User(author, authorid);
}

function Thread(threadid, topic, author, authorid, section) {
  'use strict';
  this.id = threadid;
  this.topic = topic;
  this.author = author;
  this.authorid = authorid;
  this.section = section;
}

/*
 * This function checks whether you are logged in and, if so, stores your user-
 * name for future use.
 */
function checkLogin() {
  'use strict';
  /*
   * Currently, the logged-in user's username only appears in a B element at
   * the top of the page. The XPath expression is ugly, but it's the quickest
   * path to the element we want.
   */
  var userNameElement = document.evaluate('/html/body/table/tbody/tr/td/table/tbody/tr[2]/td/b',
    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  /*
   * If the element containing the username is found, return the text value of
   * it (the username itself). Otherwise, return false.
   */
  if (userNameElement) {
    /*
     * Set an ID on the username element just in case we want to address it
     * again later.
     */
    $(userNameElement).attr("id", "username");

    GM_setValue("username", $(userNameElement).text());
    if (debugMode) {
      console.log("Logged in as " + GM_getValue("username"));
    }
  } else {
    return;
  }
}

function createWolfLink() {
  'use  strict';
  var wolflink = $('a').eq(0).attr("id", "wolflink"), logo = wolflink.children("img").attr("id", "logo");
  wolflink.replaceWith(logo);
  logo.after(wolfWebDialog('blocked_users_dialog', 'Blocked users', ''));
  logo.bind("click", function() {
    renderBlockedUsers('#blocked_users_dialog_content');
    $('#blocked_users_dialog').slideToggle('fast');
    return false;
  });
}

/*
 * This procedure handles header & footer scaffolding common to all pages as
 * well as some standard script set-up.
 */
function scaffoldCommonElements() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("Common elements");
  }

  getURLParameters();
  //addStyles();
  checkLogin();
  createWolfLink();

  if (debugMode) {
    console.groupEnd("Common elements");
  }
}

/*
 * Parses the message boards list (message.aspx).
 */
function scaffoldMessageBoards() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("Message Boards");
  }

  /*
   * First, identify the table containing the list of sections and add an ID
   * to it in case someone wants it later.
   */
  var sectionsTable = $("table.inbar"), threadList = [];
  sectionsTable.attr("id", "tww_sections");

  /* 
   * Next, we give the TABLE a THEAD and move the initial row of column
   * headers out of the TBODY and into the THEAD. This is semantically
   * pleasing, and it will simplify further parsing of the threads list since
   * we won't be skipping the first row every time--we can treat all of the
   * TBODY's children equally.
   *
   * TODO: Replace the header row's TD elements with TH elements.
   */
  var sectionsTableHead = $(document.createElement("thead"));
  sectionsTableHead.attr("id", "tww_sections_header");
  var sectionsTableBody = $("#tww_sections > tbody");
  sectionsTableBody.attr("id", "tww_sections_body");
  sectionsTableBody.before(sectionsTableHead);

  var sectionsTableHeaderRow = $("#tww_sections_body > tr:first-child");
  sectionsTableHeaderRow.attr("id", "tww_sections_header_row");
  sectionsTableHeaderRow.remove().appendTo(sectionsTableHead);

  /* 
   * Here, we select all the TR elements descended from the TBODY and add a
   * class identifying them.
   *
   * TODO: Add ID attributes to the rows signifying which message board
   * section they represent.
   */
  var sectionRows = $("#tww_sections_body > tr");
  sectionRows.addClass("tww_section");

  if (debugMode) {
    console.time("Scaffolding section rows");    
  }

  sectionRows.each(function () {
    var boardCells = $(this).children();
    boardCells.eq(0).addClass('board_status');
    var boardName = boardCells.eq(1).addClass('board_name').children("a:first").text();
    boardCells.eq(2).addClass('board_topics');
    var sectionLink = boardCells.eq(1).children("a:first"),
      threadLink = boardCells.eq(3).addClass('board_last_post').children('a:first').addClass('thread_link'),
      userLink = boardCells.eq(3).children('a:last').addClass('user_link');

    var sectionNum = sectionLink.attr("href").split("=");
    sectionNum = sectionNum[1].split("&")[0];
    $(this).attr("id", "section_" + sectionNum);
    
    var threadNum = threadLink.attr("href").split("=");
    threadNum = threadNum[1].split("&")[0];
    threadLink.attr("id", "thread_" + threadNum);
    var threadTopic = threadLink.text(), userNum = userLink.attr("href").split("=")[1];
    userLink.addClass("user_" + userNum);
    var userName = userLink.text();

    boardCells.eq(4).addClass('board_moderators').children('a').addClass('user_link');

    threadList.push(
      new Thread(threadNum, threadTopic, userName, userNum, sectionNum)
    );
  });

  buildSearchForm();
  blockUsersInboardList();

  if (debugMode) {
    console.timeEnd("Scaffolding section rows");
    console.groupEnd("Message Boards");
  }

  return threadList;
}

/*
 * Scaffolds a message board section's thread list.
 */
function scaffoldThreads() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("Scaffolding threads");
  }
  var parameters = JSON.parse(GM_getValue("current_parameters"));

  // Which section are we viewing?
  var sectionID = parameters.section;
  GM_setValue("current_section_id", sectionID);
  GM_setValue("current_section", $("#ctl00_section > option[selected='true']").text().trim());
  $(window).unload(function () {
    GM_deleteValue("current_section_id");
    GM_deleteValue("current_section");
  });

  /* Again, we identify the TABLE we're interested in and build a new THEAD to
   * separate the column headers from the thread rows.
   *
   * TODO: Replace the header row's TD elements with TH elements.
   */
  var threadTable = $("table.inbar");
  threadTable.attr("id", "tww_thread_table");

  var threadTableBody = $("#tww_thread_table > tbody");
  threadTableBody.attr("id", "tww_thread_table_body");

  var threadTableHeaderRow = $("#tww_thread_table_body > tr:first-child");
  threadTableHeaderRow.attr("id", "tww_thread_table_header_row");

  var threadTableHead = $(document.createElement("thead"));
  threadTableHead.attr("id", "tww_thread_table_header");
  threadTableBody.before(threadTableHead);

  $("#tww_thread_table_header_row").remove().appendTo(threadTableHead);

  /* And again, we add classes to each of the rows we're actually interested
   * in to reflect that they contain thread information.
   */
  var threadRows = $("#tww_thread_table_body > tr").addClass("tww_thread_row"), threads = [];

  if (debugMode) {
    console.time("Scaffolding threads");
  }

  /* Just like with the message boards list, we're going to just break down
   * each cell, take what we need, and build on to the document. This run of
   * code takes the longest to run. :P
   */
  threadRows.each(function() {
    var threadRow = $(this), threadCells = threadRow.children();
    threadCells.eq(0).addClass("thread_status");
    var threadLink = threadCells.eq(1).addClass("thread_topic").children("a:first").addClass("thread_link");
    
    var threadID = threadLink.attr("href").split("=")[1], threadTopic = threadLink.text();
    threadLink.parent().parent().attr("id", "thread_" + threadID);

    threadCells.eq(2).addClass("thread_author");
    
    var authorLink = threadCells.eq(2).children("a:first"), userID = authorLink.attr("href").split("=")[1], userName = authorLink.text();
    authorLink.parent().parent().addClass("thread_by_" + userID);

    threads.push(new Thread(threadID, threadTopic, userName, userID, sectionID));

    threadCells.eq(3).addClass("thread_replies");
    threadCells.eq(4).addClass("thread_views");
    threadCells.eq(5).addClass("thread_last_post").children("a:first").addClass("user_link");
  });

  if (debugMode) {
    console.table(threads);
    console.timeEnd("Scaffolding threads");
  }

  var threadStatusImages = $(".thread_status img");
  threadStatusImages.filter("img[src*='new']").each(function() {
    $(this).parent().parent().addClass("new_posts");
  });

  threadStatusImages.filter("img[src*='old']").each(function() {
    $(this).parent().parent().addClass("old_posts");
  });

  threadStatusImages.filter("img[src*='lock']").each(function() {
    $(this).parent().parent().addClass("locked");
  });

  $("body").append('<style>.nsfw_tag{-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #D27979!important;' +
                   'color:#AC3939;font-size:x-small;padding:0 2px;text-decoration:none;margin-right:-32px}</style>');
  buildSearchForm();
  blockUsersInThreadsList();
  // future voting
  //var section = GM_getValue('current_section_id'), threadIDs = [];
  //$.each(threadListing, function (key, value) {threadIDs.push(this.id);});
  //$.getJSON('http://lolibrary.org/bww/getvotes.php', {'threads[]': threadIDs, section: section }, function (json) {
  //  if (json !== null) {
  //    $.each(json, function (key, value) {
  //      $('#thread_' + value).addClass('nsfw');
  //    });
  //    $('.nsfw').attr('bgcolor', '').css('backgroundColor','#ffb2b2');
  //    $('.nsfw').find('td:first-child a').html('<abbr class="nsfw_tag" title="Not Safe For Work">nsfw</abbr>');
  //  }
  //});

  if (debugMode) {
    console.groupEnd("Scaffolding threads");
  }
  return threads;
}

// This function applies descriptive classes to three types of images: smileys,
// photo gallery pics, and all other images. It also protects you somewhat from
// huge images causing horizontal scrolling.
function parseImagesInThread() {
  'use strict';
  var allThreadImages = $("div.post_message_content img");
  
  allThreadImages.filter("[width=15], [height=15]").addClass('tww_smiley');
  allThreadImages.filter("img[border=0]").addClass('post_image');
  var probablyLinkedPhotos = allThreadImages.not('.tww_smiley').not('.post_image').filter('href*=photos').addClass('photo_post_image');

  probablyLinkedPhotos.each(function () {
    var linkedPhoto = $(this);
    linkedPhoto.attr("src", linkedPhoto.parent().attr("href"));
    linkedPhoto.parent().replaceWith(linkedPhoto);
  });

  // Here is where we defend against big images. This actually scales the
  // image by your viewport, resolution be damned!
  allThreadImages.css("max-width", parseInt(window.innerWidth * 0.84, 10));
}

/*
 * Scaffolds an individual post.
 */
function scaffoldPost(post) {
  //'use strict';
  if (debugMode) {
    console.groupCollapsed("Scaffolding post");
  }

  postBackgroundColor = post.attr("bgcolor"); postCells = post.children();

  /*
   * Assign unique IDs to each post row based on the post's own ID, which
   * comes from its anchor.
   */
  authorCell = postCells.eq(0);
  authorCell.addClass("post_author_info");
  postAnchor = authorCell.children("a[name]"); postID = postAnchor.attr("name");

  /*
   * Build additional links in the poster's cell: "send PM" and "view photos."
   * TODO: Extend the post count as a link to search for all the users' posts.
   */
  
  userLink = authorCell.children("span").children("a[href*='user_info']");
  userLink.addClass("user_link");
  userLinkURL = userLink.attr("href"); userID = userLinkURL.split("=")[1]; parentSpan = userLink.parent();
    userName = parentSpan.parent().children().filter("b:first").text();
  userLink.attr("title", userName);
  userLink.data("userid", userID);
  var sendPM = createLink("mail_compose.aspx?user=" + userID, "send PM", {
    title: "Send " + userName + " a private message",
    classes: ["pm_link"]
  });

  $(document.createElement("br")).appendTo(parentSpan);
  sendPM.appendTo(parentSpan);

  $(document.createElement("br")).appendTo(parentSpan);
  var viewPhotos = createLink("photo_folder.aspx?user=" + userID, "view photos", {
    title: "View " + userName + "'s photo gallery",
    classes: ["photo_gallery_link"]
  });
  viewPhotos.appendTo(parentSpan);

  var postContentCell = postCells.eq(1), postContent = postContentCell.html();
  postContentCell.empty();
  postContentCell.addClass("post_message");
  postContentCell.prepend('<div id="content_' + postID + '" class="post_message_content content_by_' + userID + '" style="margin-top: -1em;"></div>');
  var contentDiv = $("#content_" + postID);
  contentDiv.append(postContent);
  var postFooter = contentDiv.children("p.small").remove();
  post.wrap('<tbody id="post_' + postID + '" class="tww_post post_by_' + userID + '"></tbody>');
  var postBody = $("tbody#post_" + postID);
  postBody.addClass("post_by_" + userID);
  postBody.append('<tr id="footer_' + postID + '" class="post_footer"><td align="right"><div class="voting_links" style="float: left; display: none;"><a class="plain vote_link" style="font-size: 11px;" id="nsfw_' + postID + '">[nsfw]</a></div></td></tr>');
  var postText = contentDiv.text();
  postCells.eq(0).attr("rowspan", "2");

  postFooter.appendTo('#footer_' + postID + ' > td:first-child').parent().css("height", "15px").attr("bgcolor", postBackgroundColor);
  postBody.appendTo("#tww_post_table");

  removeInlineFrames();
  applyMediaEnhancements();

  var scaffoldedPost = new Post(postID, postText, userName, userID);
  if (debugMode) {
    console.dir(scaffoldedPost);
    console.groupEnd("Scaffolding post");
  }
  return scaffoldedPost;
}

/*
 * Scaffolds a thread.
 */
function scaffoldThread() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("Scaffolding thread");
  }

  GM_deleteValue("current_section_id");
  GM_deleteValue("current_thread_id");
  GM_deleteValue("current_thread_page");

  var parameters = JSON.parse(GM_getValue("current_parameters")), threadID = parameters.topic;
  GM_setValue("current_thread_id", threadID); // TODO: Necessary?

  if (parameters.page !== undefined) {
    GM_setValue("current_thread_page", parameters.page);
  } else {
    GM_setValue("current_thread_page", 1);
  }

  var tempParams = $('#ctl00_lnkSection').attr('href').match(/section=\d+/), sectionID = tempParams[0].split("=")[1];
  GM_setValue("current_section_id", sectionID);

  var postTable = $("table.inbar").attr("id", "tww_post_table");
  postTable.parent().parent().parent().parent().attr("id", "tww_post_table_head");
  var postRows = $("#tww_post_table > tbody > tr");
  $("#tww_post_table_head > tr > td").eq(1).attr("id", "page_links");

  /*
   * Parse the thread's topic out of the TITLE element.
   */
  var threadTopic = document.title.substr(6);
  /*
   * For future sharing.
  metaTitle = $(document.createElement("meta"));
  metaTitle.attr("name", "title");
  metaTitle.attr("content", threadSubject);
  metaDescr = $(document.createElement("meta"));
  metaDescr.attr("name", "description");
  linkImage = $(document.createElement("link"));
  linkImage.attr("rel", "image_src");
  linkImage.attr("href", "images/logo.gif");
  */
  GM_setValue("current_thread_subject", threadTopic);

  var usersInThread = [], postsInThread = [];

  if (debugMode) {
    console.groupCollapsed("Scaffolding posts");
    console.time("Scaffolding posts");
  }

  // We'll class each post up so the data we want later will be easier to
  // address.
  postRows.each(function () {
    var post = scaffoldPost($(this));
    postsInThread.push(post);
    usersInThread.push(post.author); // Blocking is faster with a separate array.
  });

  if (debugMode) {
    console.timeEnd("Scaffolding posts");
    console.groupEnd("Scaffolding posts");
  }
  /*
   * Again, future sharing.
  threadDescr = $("div.post_message_content:first").text();
  metaDescr.attr("content", threadDescr);

  $("head").append(metaTitle).append(metaDescr).append(linkImage);
  */

  $("#tww_post_table > tbody:first-child").remove();

  parseImagesInThread();

  /*
   * For future voting.
   *
  $(".vote_link").bind("click", function () {
    var voteValues = $(this).attr("id").split("_"), post = voteValues[1], vote = voteValues[0];
    var thread = GM_getValue("current_thread_id"), page = GM_getValue("current_thread_page");
    var section = GM_getValue("current_section_id"), voter = GM_getValue("username");
    $.get('http://lolibrary.org/bww/vote.php', { post: post, vote: vote, thread: thread, voter: voter, section: section, page: page });
  });

  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 86) {
      $('.voting_links').slideToggle('fast');
    }
  }, true);
  */
  var uniqueUsers = filterUniquesInArray(usersInThread);
  blockUsersInThread(uniqueUsers);
  if (debugMode) {
    consoleGroupEnd("Scaffolding thread");
  }
  return [postsInThread, uniqueUsers];
}

function scaffoldPhotoPage() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("Scaffolding photo page");
  }
  var photoImg = $('img#ctl00_imgPhoto'), photoTitle = document.title.substr(6);
  photoImg.attr("alt", photoTitle);

  var tempParams = (location.search).match(/user=\d+/), photoUserID = tempParams[0].split("=")[1],
    photoUsername = $('#ctl00_folderCrumbs').text(), photoOwner = new User(photoUsername, photoUserID),
    prevLink = $('#ctl00_prevLink').attr('href'), nextLink = $('#ctl00_nextLink').attr('href');

  if (nextLink) {
    photoImg.bind('click', function () {
      window.location = nextLink;
    });
  }

  $(window).keypress(function (e) {
    switch(e.keyCode) {
      case 37: {if (prevLink) {window.location = prevLink;} return false;}
      case 39: {if (nextLink) {window.location = nextLink;} return false;}
    }
  });
  if (debugMode) {
    console.groupEnd("Scaffolding photo page");
  }
}

function wolfWebDialog(id, title, content) {
  'use strict';
  return '<table id="' + id +
   '" class="bar tww_script_dialog" cellspacing="0" cellpadding="3" style="position: absolute; z-index: 50; display: none;">' +
   '<thead><tr><th style="text-align: left;">' + title + '</th></tr></thead><tbody><tr><td>' +
   '<table class="inbar" cellspacing="0" cellpadding="5" style="width: 100%;"><tbody>' + '<tr><td><div id="' +
   id + '_content">' + content + '</div></td></tr></tbody></table></td></tr></tbody></table>';
}

function scaffoldUserProfile() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("Scaffolding profile");
  }
  var parameters = JSON.parse(GM_getValue("current_parameters")), userID = parameters.user;
  var userName = $("td.rightbold:contains('Username')").next().text(), currentUser = new User(userName, userID);

  var userProfileBody = $("#ctl00_tblInfo tbody").attr("id", "user_profile_body");
  addBlockLink(currentUser);
  // userProfileBody.append('<tr><td class="medium" align="center" colspan="2"><a id="block_link" href="#">opa</a></td></tr>');
  var userProfileRows = userProfileBody.children();
  userProfileRows.filter(":even").attr("bgcolor", "#E3E3E3");
  userProfileRows.filter(":odd").attr("bgcolor", "");

  if (debugMode) {
    console.dir(currentUser);
    console.groupEnd("Scaffolding profile");
  }
  return currentUser;
}

function scaffoldUserList() {
  'use strict';
  if (debugMode) {
    console.groupCollapsed("Scaffolding user list");
  }
  $('table.inbar:last').attr("id", "users_list");
  var userRows = $('table#users_list tr');
  userRows.each(function () {
    var userRow = $(this), userLink = userRow.children().eq(1).children(), userNum = userLink.attr("href").split('='),
      userName = userLink.text(), postsCell = userRow.children().eq(3);
    if (postsCell.text() !== '0 posts') {
      postsCell.wrapInner('<a class="plain search_posts_link" title="Search for ' + userName +
                          '\'s posts" href="message_search.aspx?type=posts&amp;username=' + encodeURI(userName) + "></a>");
    }
  });
  if (debugMode) {
    console.groupEnd("Scaffolding user list");
  }
}

/*
 * Adds a new form element to user_settings.aspx for managing some of the
 * Greasemonkey preferences.
 */
function scaffoldSettingsPage() {
  'use strict';
  var settingsBody = $("#ctl00_lnkUser").parent().parent().parent();
  settingsBody.append('<tr><td>&nbsp;Better Wolf Web Settings</td></tr>');
  settingsBody.append('<tr><td><form action="javascript:return(false);" id="bww_settings_form" name="bww_settings_form">' +
                      '<table cellspacing="0" cellpadding="6" border="0" style="width:100%;border-collapse:collapse;" ' +
                      'class="inbar" id="bww_settings_table"><tbody id="bww_settings_body"><tr id="debugmode" ' +
                      'style="background-color:#E3E3E3;"></tr></tbody></table></td></tr></form>');
  var debugModeRow = $("#debugmode");
  debugModeRow.append('<td style="width:220px;white-space:nowrap;" class="rightbold">Debug Mode :</td>');
  debugModeRow.append('<td><input type="radio" name="debug_mode" value="true">On <input type="radio" name="debug_mode" value="false"> Off</td>');
  var debugMode = GM_getValue("debug_mode", false);
  $("input[name='debug_mode'][value='" + debugMode + "']").attr("checked", "true");
  //$("#bww_settings_body").append('<tr><td align="center><input type="submit" value="Save Preferences" class="button"></td></tr>');
}
