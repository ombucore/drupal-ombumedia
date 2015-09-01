(function($) {
"use strict";

Drupal.ombumedia = Drupal.ombumedia || {};

/**
 * Kicks off media selection workflow.
 *
 * @param {object} options
 *  - type: {string} 'image', 'video' 'document', 'audio'
 *  - viewModes: {object} keyed by file type, each with an array of view mode
 *                        strings
 */
Drupal.ombumedia.selectMedia = function(options) {
  return Drupal.ombumedia.launchPopup(options);
};

/**
 * Skips the selection phase of the selection, goes straight to the
 * preview/edit form.
 */
Drupal.ombumedia.configureMedia = function(fid, options) {
  options.fid = fid;
  return Drupal.ombumedia.launchPopup(options);
};

/**
 * Opens the OMBU Media pop-up for selecting or editing a media file.
 */
Drupal.ombumedia.launchPopup = function(options) {
  options = options || {};
  var deferred = $.Deferred();
  var query = {
    render: 'ombumedia-popup'
  };
  var src, path, $iframe;

  if (options.type) {
    query.type = options.type;
  }
  if (options.viewModes) {
    query.view_modes = options.view_modes;
  }
  if (options.fid) {
    path = '/file/' + options.fid + '/configure';
  }
  else {
    path = '/admin/dashboard/select-media';
  }

  src = path + '?' + $.param(query);

  $iframe = $('<iframe class="ombumedia-modal-frame"/>')
                  .attr('src', src)
                  .attr('width', options.width);

  $iframe.on('load', function() {
    // Inject a callback function that can be called from the iframe js.
    $iframe[0].contentWindow.ombumediaSelectCallback = function(fid, viewMode) {
      deferred.resolve({fid: fid, viewMode: viewMode});
    };
  });

  var dialogOptions = {
    modal: true,
    draggable: false,
    resizable: false,
    zIndex: 10000,
    position: { my: "top center", at: "top center" },
    overlay: { backgroundColor: "#000000", opacity: 0.4 },
    close: function(e, ui) {
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
 * Close the open dialog.
 */
Drupal.ombumedia.closeDialog = function() {
  $('iframe.ombumedia-modal-frame')
      .dialog('close')
      .dialog('destroy');
};


})(jQuery);
