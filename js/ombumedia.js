(function($) {
"use strict";

Drupal.ombumedia = Drupal.ombumedia || {};

var preventDefault = Drupal.ombumedia.util.preventDefaultWrapper;
var stopPropagation = Drupal.ombumedia.util.stopPropagationWrapper;
var fileUrl = Drupal.ombumedia.util.fileUrl;


/**
 * Opens the OMBU Media pop-up for selecting or editing a media file.
 *
 * @param {object} options, all optional
 *  - types: {array} of types to allow: 'image', 'video' 'document', 'audio'
 *  - view_modes: {object} keyed by file type, each with an array of view mode
 *                        strings
 *  - view_mode: {string} the default view mode for the configure form
 *  - fid: the file id to configure
 *  - wysiwyg_format: {string} the wysiwyg format, useful for adding configure
 *                    form functionality to specific cases.
 *
 *  @returns Promise
 */
Drupal.ombumedia.selectMedia = function(options) {
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
                            '<div class="error-container">',
                              '<a href="#" class="close">&times;</a>',
                              '<div class="errors"></div>',
                            '</div>',
                          '</div>',
                        ''].join('')).appendTo($rootEl);
  var $progressFilename = $uploadOverlay.find('.progress-text-filename');
  var $progressBarBar = $uploadOverlay.find('.progress-bar .bar');
  var $errorsClose = $uploadOverlay.find('.error-container .close');

  $(window).on('dragover', preventDefault(stopPropagation(dragOver)));
  $dragOverlay.on('dragleave', preventDefault(stopPropagation(dragLeave)));
  $dragOverlay.on('drop', preventDefault(stopPropagation(uploadDroppedFile)));
  $errorsClose.on('click', preventDefault(hideErrors));


  function dragOver() {
    $rootEl.addClass('drag-over');
  }

  function dragLeave(e) {
    $rootEl.removeClass('drag-over');
  }

  function showErrors(errors) {
    $rootEl.addClass('upload-error');
    $rootEl.removeClass('uploading');
    $uploadOverlay.find('.errors').html('<p>' + errors.join('</p><p>') + '</p>');
  }

  function hideErrors(e) {
    $rootEl.removeClass('upload-error');
    $uploadOverlay.find('.errors').html('');
  }

  function uploadDroppedFile(e) {
    dragLeave(e);

    var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
    if (!files.length) {
      return;
    }

    $rootEl.addClass('uploading');

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
      else if (data.errors) {
        showErrors(data.errors);
      }
    });
  }

};

Drupal.ombumedia.plupload = function(g, files) {

  if (!files.length) {
    return;
  }

  $.each(files, function(index, file){
    var jsFile = new File([""],file.name,{type: 'image/jpeg'});
    var formData = new FormData();
    file.type = 'image/jpeg';
    file.temp_name = file.target_name;
    formData.append('file-0', file);

    $.ajax({
      url: Drupal.settings.ombumedia.upload.url,
      type: 'POST',
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        return myXhr;
      },
      data: formData,
      cache: false,
      contentType: false,
      processData: false
    })
      .done(function(data, textStatus, jQueryXHR) {
        if (data.file && data.file.fid) {
          console.log(data.file);
        }
        else if (data.errors) {
          console.log(data.errors);
        }
      });

  });


  function apply(uploader, files) {
    console.log(uploader);
    console.log(files);
  }

};


  Drupal.ombumedia.pluploaded = function(e) {

    var test = 'test';
    console.log(e);

  };

  Drupal.ombumedia.beforePlupload = function(e) {

    var test = 'test';
    console.log(e);


    var files = e.files;
    if (!files.length) {
      return;
    }

    var file = files[0];
    var formData = new FormData();
    var jsFile = new File([file],file.name,{type: 'image/jpeg'});
    formData.append('files[]', jsFile);

    $.ajax({
      url: Drupal.settings.ombumedia.upload.url,
      type: 'POST',
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        return myXhr;
      },
      data: formData,
      cache: false,
      contentType: false,
      processData: false
    })
      .done(function(data, textStatus, jQueryXHR) {
        if (data.file && data.file.fid) {
          console.log(data.file);
        }
        else if (data.errors) {
          console.log(data.errors);
        }
      });

    var test = 'ffoooo';

    function apply(uploader, files) {
      console.log(uploader);
      console.log(files);
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

    // Drupal.ombumedia.addDragUpload($body, function(file) {
    //     window.location = fileUrl(file.fid, 'edit');
    // });
  }
};


})(jQuery);
