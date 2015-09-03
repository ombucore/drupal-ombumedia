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
    $('.ombumedia-tabset').tabs();
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

    $preview.find('input[type="submit"][value="Back"]').on('click', preventDefault(function(e) {
      window.history.back();
    }));

    $preview.find('input[type="submit"][value="Select"]').on('click', preventDefault(function(e) {
      window.location = $(this).attr('data-href');
    }));

  }
};



/**
 * Code to run on the configure form before a media file is selected.
 */
Drupal.behaviors.ombumediaFileEntityConfigure = {
  attach: function(context) {
    var $form = $('form.ombumedia-file-entity-configure').once('ombumedia-file-entity-configure');

    if (!$form.length) {
      return;
    }

    $form.find('input[type="submit"][value="Back"]').on('click', preventDefault(function(e) {
      window.history.back();
    }));

    // Grab values we need from the form on submit.
    $form.on('submit', function(e) {
      var fid = $form.find('[name="fid"]').val();
      var view_mode = $form.find('[name="view_mode"]').val();
      try {
        ombumediaSelectCallback({fid: fid, view_mode: view_mode});
      }
      catch (error) {}
    });
  }
};



})(jQuery);
