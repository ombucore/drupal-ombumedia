(function($) {
"use strict";

/**
 * Functionality inside the file selection pop-up.
 */



/**
 * Initializes the Library/Upload/Web tabs.
 */
Drupal.behaviors.ombumediaPopupTabs = {
  attach: function(context) {
    $('.ombumedia-tabset').tabs();
  }
};



/**
 * Drag n Drop uploading in popup.
 */

var preventDefault = Drupal.ombumedia.util.preventDefaultWrapper;
var stopPropagation = Drupal.ombumedia.util.stopPropagationWrapper;
var fileUrl = Drupal.ombumedia.util.fileUrl;

Drupal.behaviors.ombumediaDragUpload = {
  attach: function(context) {
    var $body = $('body.page-admin-dashboard-select-media').once('drag-upload');

    if (!$body.length) {
      return;
    }

    var $dragOverlay = $('<div class="ombumedia-upload-drag"><span>Drop file to upload</span></div>').appendTo($body);
    var $uploadOverlay = $(['',
                            '<div class="ombumedia-upload-progress">',
                              '<div class="progress-bar">',
                                '<span class="bar"></span>',
                                '<span class="progress-text">Uploading <span class="progress-text-filename"></span></span>',
                              '</div>',
                            '</div>',
                          ''].join('')).appendTo($body);
    var $progressFilename = $uploadOverlay.find('.progress-text-filename');
    var $progressBarBar = $uploadOverlay.find('.progress-bar .bar');

    $body.on('dragover', preventDefault(stopPropagation(dragOver)));
    $dragOverlay.on('dragleave', preventDefault(stopPropagation(dragLeave)));
    $dragOverlay.on('drop', preventDefault(stopPropagation(uploadDroppedFile)));

    function dragOver () {
      $body.addClass('drag-over');
    }

    function dragLeave(e) {
      $body.removeClass('drag-over');
    }

    function uploadDroppedFile(e) {
      dragLeave(e);
      $body.addClass('uploading');

      var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
      if (!files.length) {
        return;
      }
      var file = files[0];
      var formData = new FormData();
      formData.append('files[]', file);

      $progressFilename.text(file.name);

      $.ajax({
        url: Drupal.settings.ombumedia.upload.url,
        type: 'POST',
        xhr: function() {
          var myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
            myXhr.upload.addEventListener('progress', function(e) {
              if (e.lengthComputable) {
                var loaded = e.loaded;
                var total = e.total;
                var width = ((loaded / total) * 100) + '%';
                $progressBarBar.css('width', width);
              }
            }, false);
          }
          return myXhr;
        },
        data: formData,
        cache: false,
        contentType: false,
        processData: false
      })
      .done(function(data, textStatus, jQueryXHR) {
        if (data.file && data.file.fid) {
          window.location = fileUrl(data.file.fid, 'configure');
        }
      });
    }

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
      var fid = $form.find('input[name="fid"]').val();
      try {
        ombumediaSelectCallback(fid, 'foobar');
      }
      catch (error) {}
    });
  }
};



})(jQuery);
