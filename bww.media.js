/*
 * Disables autostart on all EMBED elements. 
 */
function disableAutostart() {
  'use strict';
  $('embed').attr("autostart", "false");
}

/*
 * Replace links to YouTube/Dailymotion/Facebook/MySpace videos with embed/object elements
 *  and links to Vimeo videos with iframe elements.
 */
function youtubeEmbed(videoID, listCode) {
  'use strict';
  var videoURL = '"https://www.youtube.com/v/' + videoID + '?' + listCode +
    'hl=en_US&amp;fs=1&amp;color1=0xdd0000&amp;color2=0x660000&amp;border=1&amp;modestbranding=1"';
  return '<object type="application/x-shockwave-flash" class="youtube_video" width="445" height="364" data=' +
    videoURL + '><param name="movie" value=' + videoURL +
    ' /><param name="allowFullScreen" value="true" /><param name="allowscriptaccess" value="always" /><embed class="youtube_video" src=' +
    videoURL + ' type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="445" height="364"></embed></object>';
}
function dailymotionEmbed(videoID) {
  'use strict';
  var videoURL = '"https://www.dailymotion.com/swf/video/' + videoID +
    '?foreground=%23FFFFFF&amp;highlight=%23DD0000&amp;background=%23660000&amp;related=1&amp;explicit=1&amp;loadRelatedInPlace=1"';
  return '<object type="application/x-shockwave-flash" class="dailymotion_video" width="560" height="315" data=' +
    videoURL + '><param name="movie" value=' + videoURL +
    ' /><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="wmode" value="transparent" /><embed class="dailymotion_video" type="application/x-shockwave-flash" src=' +
    videoURL + ' width="560" height="315" wmode="transparent" allowfullscreen="true" allowscriptaccess="always"></embed></object>';
}
function facebookEmbed(videoID) {
  'use strict';
  var videoURL = '"https://www.facebook.com/v/' + videoID + '"';
  return '<object type="application/x-shockwave-flash" class="facebook_video" width="400" height="224" data=' + videoURL +
    '><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value=' +
    videoURL + ' /><embed class="facebook_video" src=' + videoURL +
    ' type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="400" height="224"></embed></object>';
}
function myspaceEmbed(videoID) {
  'use strict';
  var videoURL = '"http://mediaservices.myspace.com/services/media/embed.aspx/m=' + videoID + ',t=1,mt=video"';
  return '<object type="application/x-shockwave-flash" class="myspace_video" width="425" height="360" data=' + videoURL +
    '><param name="allowFullScreen" value="true" /><param name="wmode" value="transparent" /><param name="movie" value=' +
    videoURL + ' /><embed class="myspace_video" src=' + videoURL +
    ' width="425" height="360" allowFullScreen="true" type="application/x-shockwave-flash" wmode="transparent"></embed></object>';
}

function youtubeListEmbed(listID) {
  'use strict';
  var videoURL = '"https://www.youtube.com/v/videoseries?listType=playlist&amp;list=PL' + listID +
    '&amp;hl=en_US&amp;fs=1&amp;autohide=1&amp;showinfo=1&amp;modestbranding=1"';
  return '<object type="application/x-shockwave-flash" class="youtube_video" width="560" height="315" data=' + videoURL +
    '><param name="movie" value=' + videoURL +
    ' /><param name="allowFullScreen" value="true" /><param name="allowscriptaccess" value="always" /><embed class="youtube_video" src=' +
    videoURL + ' type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="560" height="315"></embed></object>';
}

function applyMediaEnhancements() {
  'use strict';
  //Flash MP3 Player from http://flash-mp3-player.net/players/maxi/generator/
  var mp3Player = 'http://jansal.net/player_mp3_maxi.swf';
  messageLinks = $('div.post_message_content a');
  messageLinks.filter('a[href*=".mp3"]').each(function () {
    var mp3Link = $(this), mp3LinkURL = mp3Link.attr("href");
    mp3Link.replaceWith('<object class="mp3_player" type="application/x-shockwave-flash" data="' + mp3Player +
      '" width="560" height="20"><param name="movie" value="' + mp3Player +
      '" /><param name="bgcolor" value="#ffffff"><param name="FlashVars" value="mp3=' + mp3LinkURL +
      '&amp;width=560&amp;height=20&amp;loop=0&amp;autoplay=0&amp;autoload=1&amp;volume=200&amp;showstop=1&amp;' +
      'showinfo=1&amp;showvolume=1&amp;showslider=1&amp;showloading=always&amp;buttonwidth=24&amp;sliderwidth=20&amp;' +
      'sliderheight=10&amp;volumewidth=30&amp;volumeheight=6&amp;loadingcolor=ffffff&amp;bgcolor=ffffff&amp;' +
      'bgcolor1=dd0000&amp;bgcolor2=880000&amp;slidercolor1=ff5555&amp;slidercolor2=ff3333&amp;sliderovercolor=ff7777' +
      '&amp;buttoncolor=ffffff&amp;buttonovercolor=ff9999&amp;textcolor=ffffff" />' +
      '<param name="allowscriptaccess" value="always" /><embed class="mp3_player" src="' + mp3Player + '?mp3=' + mp3LinkURL +
      '&amp;width=560&amp;height=20&amp;loop=0&amp;autoplay=0&amp;autoload=1&amp;volume=200&amp;showstop=1&amp;' +
      'showinfo=1&amp;showvolume=1&amp;showslider=1&amp;showloading=always&amp;buttonwidth=24&amp;sliderwidth=20&amp;' +
      'sliderheight=10&amp;volumewidth=30&amp;volumeheight=6&amp;loadingcolor=ffffff&amp;bgcolor=ffffff&amp;' +
      'bgcolor1=dd0000&amp;bgcolor2=880000&amp;slidercolor1=ff5555&amp;slidercolor2=ff3333&amp;sliderovercolor=ff7777' +
      '&amp;buttoncolor=ffffff&amp;buttonovercolor=ff9999&amp;textcolor=ffffff" type="application/x-shockwave-flash" allowscriptaccess="always" width="560" height="20"></embed></object>' +
      '<br /><a href="' + mp3LinkURL + '" class="plain mp3_link" title="Download this MP3" rel="nofollow">Download this MP3</a>');
  });
 //YouTube support, including embed links, youtu.be, and playlists
  messageLinks.filter('a[href*="youtube.com/watch"]').each(function () {
    var videoLink = $(this).attr("href"), videoID = videoLink.replace(/^[^v]+v.(.{11}).*/, "$1");
    var listTest = videoLink.replace(/^.*list=(PL[A-F0-9]{16}).*/,"$1");
    var listCode = (listTest !== videoLink ? "listType=playlist&amp;list=" + listTest : "version=2") + "&amp;";
    $(this).replaceWith(youtubeEmbed(videoID, listCode));
  });
  messageLinks.filter('a[href*="youtube.com/embed"]').each(function () {
    var videoLink = $(this).attr("href"), videoID=videoLink.replace(/^[^d]+d.(.{11}).*/, "$1");
    var listTest = videoLink.replace(/^.*list=(PL[A-F0-9]{16}).*/,"$1");
    var listCode = (listTest !== videoLink ? "listType=playlist&amp;list=" + listTest : "version=2") + "&amp;";
    $(this).replaceWith(youtubeEmbed(videoID,listCode));
  });
  messageLinks.filter('a[href*="youtu.be"]').each(function () {
    var videoID = $(this).attr("href").replace(/^[^e]+be.(.{11}).*/, "$1");
    $(this).replaceWith(youtubeEmbed(videoID, "version=2&amp;"));
  });
  //YouTube playlists
  messageLinks.filter('a[href*="youtube.com/playlist"]').each(function () {
    var listID = $(this).attr("href").replace(/^.*=PL([A-F0-9]{16})$/, "$1");
    $(this).replaceWith(youtubeListEmbed(listID));
  });
  messageLinks.filter('a[href*="youtube.com/course"]').each(function () {
    var listID = $(this).attr("href").replace(/^.*=PL([A-F0-9]{16})$/, "$1");
    $(this).replaceWith(youtubeListEmbed(listID));
  });
  //DailyMotion support
  messageLinks.filter('a[href*="dailymotion.com/video"]').each(function () {
    var videoID = $(this).attr("href").replace(/^[^e]+eo.(.{6}).*/, "$1");
    $(this).replaceWith(dailymotionEmbed(videoID));
  });
  //Facebook support
  messageLinks.filter('a[href*="facebook.com/video"]').each(function () {
    var videoID = $(this).attr("href").replace(/^[^?]+\?v.([0-9]*).*/, "$1");
    $(this).replaceWith(facebookEmbed(videoID));
  });
  //MySpace support (disabled for now)
  //messageLinks.filter('a[href*="myspace.com/video"]').each(function () {
  //  var videoID = $(this).attr("href").replace(/^.*\/(\d*)$/, "$1");
  //  $(this).replaceWith(myspaceEmbed(videoID));
  //});
  disableAutostart();
}
