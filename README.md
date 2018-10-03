OMBU Media
==========

Provides custom media functionality based on `file_entity` including:

- Media management
- Media selection workflow
- Adding media via upload, drag upload, and oembed (Youtube & Vimeo)
- Media field
- Media integration with CKEditor and input filtering

Media file display is done through the file's view modes. View modes that are
enabled for the file types will be available on the settings form for the
CKEditor plugin and fields.


Selection Workflow
------------------

Media files can be selected by calling `Drupal.ombumedia.selectMedia()` with
options defining which file types and view modes can be selected.  The function
returns a Promise that will resolve when a file has been chosen. See
`js/ombumedia.js` for more information on options.


WYSIWYG Integration
-------------------

OMBU Media provides a CKEditor plugin for selecting media files and can be
configured on the edit form for the WYSIWYG profile.

Input filtering (converting the WYSIWYG-ready element into front-end HTML) is
done by this module and usually invoves loading file by FID and rendering it
according to the selected view mode.

Extra fields can be added to the configuration form to pass extra information
with the embedded item.  An example can be seen in `ombumedia_position.module`.


Examples
--------

Examples of media selection and the WYSIWYG integration can be found attributes
`/admin/dashbaord/ombumedia-test` and are implemented in `ombumedia-test.js`.
