(function($) {
"use strict";

/**
 * Functionality inside the file selection pop-up.
 */


var preventDefault = Drupal.ombumedia.util.preventDefaultWrapper;
var fileUrl = Drupal.ombumedia.util.fileUrl;
var deparam = Drupal.ombumedia.util.deparam;
var destPath = Drupal.ombumedia.util.destPath;


/**
 * Initializes the Library/Upload/Web tabs.
 */
Drupal.behaviors.ombumediaPopupTabs = {
  attach: function(context) {
    var $ombumediaTabset = $('.ombumedia-tabset', context).once('ombumedia-tabset');

    if (!$ombumediaTabset.length) {
      return;
    }

    var active = 0;
    $ombumediaTabset.find('.ui-tabs-panel').each(function(i, panelEl) {
      if ($(panelEl).find('.messages').length) {
        active = i;
      }
    });

    $ombumediaTabset.tabs({active: active});
  }
};



/**
 * Drag uploading in popup.
 */
Drupal.behaviors.ombumediaDragUploadPopup = {
  attach: function(context) {
    var $body = $('body.page-admin-dashboard-select-media').once('drag-upload');

    if (!$body.length) {
      return;
    }

    Drupal.ombumedia.addDragUpload($body, function(file) {
        window.location = fileUrl(file.fid, 'configure');
    });
  }
};


/**
 * OMBU Media select grid items.
 */
Drupal.behaviors.ombumediaSelectGrid  = {
  attach: function(context) {
    var $files = $('.ombumedia-library-file-select_media').once('ombumedia-select-grid');

    if (!$files.length) {
      return;
    }

    var params = deparam(window.location.search.replace('?', ''));
    params.destination = destPath();
    var queryString = '?' + $.param(params);
    $files.each(function(i, fileEl) {
      $(fileEl).find('a').each(function(i, aEl) {
        $(aEl).attr('href', $(aEl).attr('href') + queryString);
      });
    });

  }
};



/**
 * Code to run on the preview step before a media file is selected.
 */
Drupal.behaviors.ombumediaFilePreview = {
  attach: function(context) {
    var $preview = $('.ombumedia-file-preview').once('ombumedia-file-preview');

    if (!$preview.length) {
      return;
    }

  }
};


})(jQuery);
