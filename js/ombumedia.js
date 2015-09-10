(function($) {
"use strict";

Drupal.ombumedia = Drupal.ombumedia || {};

var preventDefault = Drupal.ombumedia.util.preventDefaultWrapper;
var stopPropagation = Drupal.ombumedia.util.stopPropagationWrapper;
var fileUrl = Drupal.ombumedia.util.fileUrl;

/**
 * Kicks off media selection workflow.
 *
 */
Drupal.ombumedia.selectMedia = function(options) {
  return Drupal.ombumedia.launchPopup(options);
};

/**
 * Opens the OMBU Media pop-up for selecting or editing a media file.
 *
 * @param {object} options, all optional
 *  - type: {string} 'image', 'video' 'document', 'audio'
 *  - view_modes: {object} keyed by file type, each with an array of view mode
 *                        strings
 *  - view_mode: {string} the default view mode for the configure form
 *  - fid: the file id to configure
 *  - wysiwyg_format: {string} the wysiwyg format, useful for adding configure
 *                    form functionality to specific cases.
 *
 *  @returns Promise
 */
Drupal.ombumedia.launchPopup = function(options) {
  options = options || {};
  var deferred = $.Deferred();
  var query = options;
  var src, path, $iframe;

  query.render = 'ombumedia-popup';

  if (options.fid) {
    path = '/file/' + options.fid + '/configure';
    delete query.fid;
  }
  else {
    path = '/admin/dashboard/select-media';
  }

  src = path + '?' + $.param(query);

  $iframe = $('<iframe class="ombumedia-modal-frame"/>');

  $iframe.attr('src', src);

  Drupal.ombumedia._popupCallback = function() {
      deferred.resolve.apply(null, arguments);
      $iframe
        .dialog('close')
        .dialog('destroy');
  };

  var dialogOptions = {
    modal: true,
    draggable: false,
    resizable: false,
    zIndex: 10000,
    position: { my: "top center", at: "top center" },
    open: function(e, ui) {
      $('body').addClass('ui-dialog-open');
    },
    close: function(e, ui) {
      $('body').removeClass('ui-dialog-open');
      $(e.target).remove();
      var deferredState = deferred.state();
      if (deferredState != 'resolved') {
        deferred.reject();
      }
    },
    title: "Select Media"
  };


  $iframe.dialog(dialogOptions);

  var $uiDialog = $iframe.parents('.ui-dialog:eq(0)');
  var $uiOverlay = $uiDialog.siblings('.ui-widget-overlay');

  $uiOverlay.addClass('ombumedia-ui-overlay');
  $uiDialog.addClass('ombumedia-ui-dialog');

  $uiDialog.css({
    top: '3em',
    right: '3em',
    bottom: '3em',
    left: '3em',
    padding: '0',
    width: 'auto',
    height: 'auto'
  });

  $iframe.css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  });

  return deferred.promise();
};

/**
 * Close the open popup.
 */
Drupal.ombumedia.closePopup = function() {
  $('iframe.ombumedia-modal-frame')
      .dialog('close')
      .dialog('destroy');
};


/**
 * Adds drag upload catabilities to an element with a success callback that
 * includes the uploaded file.
 */
Drupal.ombumedia.addDragUpload = function($rootEl, doneCallback) {

  var $dragOverlay = $('<div class="ombumedia-upload-drag"><span>Drop file to upload</span></div>').appendTo($rootEl);
  var $uploadOverlay = $(['',
                          '<div class="ombumedia-upload-progress">',
                            '<div class="progress-bar">',
                              '<span class="bar"></span>',
                              '<span class="progress-text">Uploading <span class="progress-text-filename"></span></span>',
                            '</div>',
                          '</div>',
                        ''].join('')).appendTo($rootEl);
  var $progressFilename = $uploadOverlay.find('.progress-text-filename');
  var $progressBarBar = $uploadOverlay.find('.progress-bar .bar');

  $rootEl.on('dragover', preventDefault(stopPropagation(dragOver)));
  $dragOverlay.on('dragleave', preventDefault(stopPropagation(dragLeave)));
  $dragOverlay.on('drop', preventDefault(stopPropagation(uploadDroppedFile)));

  function dragOver () {
    $rootEl.addClass('drag-over');
  }

  function dragLeave(e) {
    $rootEl.removeClass('drag-over');
  }

  function uploadDroppedFile(e) {
    dragLeave(e);
    $rootEl.addClass('uploading');

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
        doneCallback(data.file);
      }
    });
  }

};


/**
 * Drag uploading on media manager.
 */
Drupal.behaviors.ombumediaDragUploadManage = {
  attach: function(context) {
    var $body = $('body.page-admin-dashboard-manage-media').once('drag-upload');

    if (!$body.length) {
      return;
    }

    Drupal.ombumedia.addDragUpload($body, function(file) {
        window.location = fileUrl(file.fid, 'edit');
    });
  }
};


})(jQuery);
