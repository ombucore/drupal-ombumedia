(function ($) {

  Drupal.behaviors.ombumediaField = {
    attach: function(context, settings) {
      $('.ombumedia-widget', context).each(function() {
        var $container = $(this);
        var $fid = $('input.fid', $container);
        var $view_mode = $('input.view_mode', $container);

        var options = {
          types: $container.data('types'),
          view_modes: $container.data('view-modes').split(',')
        };

        $('.select-media').on('click', function(e) {
          e.preventDefault();

          if ($fid.val() != 0) {
            options.fid = $fid.val();
          }

          Drupal.ombumedia.selectMedia(options).then(function(values) {
            $fid.val(values.fid);
            $view_mode.val(values.view_mode);

            $.get(Drupal.settings.basePath + 'file/' + values.fid + '/preview', function(content) {
              $('.preview', $container).html($('.ombumedia-file-preview .file-preview', content).html());
            });
          });
        });
      });
    }
  };

})(jQuery);
