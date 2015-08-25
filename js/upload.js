(function($) {
$(function() {


var supportsDragDrop = (function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    });

var supportsAjaxUpload = (function() {
        var xhr = new XMLHttpRequest();
        return !!(xhr && ('upload' in xhr));
    });

function dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    $library.addClass('drag-over');
}

function dragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    $library.removeClass('drag-over');
}

function uploadDroppedFile(e) {
    // Cancel dragOver.
    e.stopPropagation();
    e.preventDefault();
    $library.removeClass('drag-over');
    $library.addClass('uploading');

    var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
    if (!files.length) {
        return;
    }
    var file = files[0];
    var formData = new FormData();
    formData.append('files[]', file);

    $library.find('.progress-text-filename').text(file.filename);

    $.ajax({
        url: Drupal.settings.ombumedia.upload.url,
        type: 'POST',
        xhr: function() {  // Custom XMLHttpRequest
            var myXhr = $.ajaxSettings.xhr();
            // Check if upload property exists
            if (myXhr.upload) {
                 // For handling the progress of the upload
                myXhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        var loaded = e.loaded;
                        var total = e.total;
                        var width = ((loaded / total) * 100) + '%';
                        $library.find('.progress-bar .bar').css('width', width);
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
        if (data.actions && data.actions.edit) {
            var dest = window.location.pathname.slice(1); // Remove preceding slash '/'.
            window.location = data.actions.edit + '?destination=' + dest;
        }
    });

}


/**
 * Wiring.
 */

var $library = $('.ombumedia-page .ombumedia-media-library');
var $uploadDragZone = $('.ombumedia-upload-drag');
$library.on('dragover', dragOver);
$uploadDragZone.on('dragleave', dragLeave);
$uploadDragZone.on('drop', uploadDroppedFile);


});
})(jQuery);
