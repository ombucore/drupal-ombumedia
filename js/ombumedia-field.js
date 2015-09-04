(function ($) {

  Drupal.behaviors.ombumediaField = {
    attach: function(context, settings) {
      $('.ombumedia-widget', context).each(function() {
        var $container = $(this);
        var $fid = $('input.fid', $container);
        var options = {
          types: $container.attr('data-types'),
          view_modes: $container.attr('data-view-modes')
        };

        $('.select-media').on('click', function(e) {
          e.preventDefault();

          if ($fid.val()) {
            options.fid = $fid.val();
          }
          console.debug(options);

          Drupal.ombumedia.selectMedia({
          }).then(function(values) {
            $fid.val(values.fid);
            $.get(Drupal.settings.basePath + 'file/' + values.fid + '/preview', function(content) {
              $('.preview', $container).html($('.ombumedia-file-preview .file-preview', content).html());
            });
          });
        });
      });
    }
  };

})(jQuery);
