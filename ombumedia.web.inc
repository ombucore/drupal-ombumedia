<?php
/**
 * @file
 * Code to duplicate the upload-from-web functionality of the Media module.
 */


/**
 * Hooks ombumedia is replacing from the media_internet module.
 */

/**
 * Implements hook_media_internet_providers().
 *
 * Provides a very basic handler which copies files from remote sources to the
 * local files directory.
 */
function ombumedia_media_internet_providers() {
  return array(
    'OmbuMediaInternetFileHandler' => array(
      'title' => 'Files',
      'hidden' => TRUE,
      // Make it go last.
      'weight' => 10000,
    ),
  );
}


/**
 * Helpers.
 */

/**
 * Gets the list of providers.
 *
 * A "Provider" is a bit of meta-data like a title and a logo and a class which
 * can handle saving remote files.  Each provider is able to parse an embed code or URL
 * and store it as a file object in file_managed.
 */
function ombumedia_internet_get_providers() {
  $providers = &drupal_static(__FUNCTION__);

  if (!isset($providers)) {
    $cid = 'media:internet:providers';
    if ($cache = cache_get($cid)) {
      $providers = $cache->data;
    }
    else {
      $providers = array();
      foreach (module_implements('media_internet_providers') as $module) {
        foreach (module_invoke($module, 'media_internet_providers') as $key => $provider) {
          // Store the module here too for convinience.
          $providers[$key] = $provider;
          $providers[$key]['module'] = $module;
          if (!isset($providers[$key]['weight'])) {
            $providers[$key]['weight'] = 0;
          }
        }
      }
      uasort($providers, 'drupal_sort_weight');
      cache_set($cid, $providers);
    }
  }

  return $providers;
}

/**
 * Finds the appropriate provider for a given URL or embed_string
 *
 * Each provider has a claim() method which it uses to tell media_internet
 * that it should handle this input.  We cycle through all providers to find
 * the right one.
 *
 * @todo: Make this into a normal hook or something because we have to instantiate
 * each class to test and that's not right.
 */
function ombumedia_internet_get_provider($embed_string) {
  foreach (ombumedia_internet_get_providers() as $class_name => $nothing) {
    $p = new $class_name($embed_string);
    if ($p->claim($embed_string)) {
      return $p;
    }
  }
  throw new MediaInternetNoHandlerException(t('Unable to handle the provided embed string or URL.'));
}


/**
 * Forms.
 */

/**
 * Provides a form for adding media items from 3rd party sources.
 *
 * @todo Convert the form arguments to just one array of options/parameters.
 */
function ombumedia_internet_add($form, &$form_state = array(), $types = NULL, $redirect = array('action' => 'edit', 'query' => array())) {
  $form['#redirect'] = $redirect;

  $form['embed_code'] = array(
    '#type' => 'textfield',
    '#title' => t('Upload a video from YouTube or Vimeo'),
    '#description' => t('Enter a URL to a video on YouTube or Vimeo.'),
    '#attributes' => array('class' => array('media-add-from-url')),
    // There is no standard specifying a maximum length for a URL. Internet
    // Explorer supports up to 2083 (http://support.microsoft.com/kb/208427)
    // so we assume publicly available media URLs are within this limit.
    '#maxlength' => 2083,
    '#required' => TRUE,
  );

  // Create an array to hold potential Internet media providers.
  $providers = array();

  // Determine if there are any visible providers.
  foreach (ombumedia_internet_get_providers() as $key => $provider) {
    if (empty($provider['hidden']) || $provider['hidden'] != TRUE) {
      $providers[] = array(
        'data' => check_plain($provider['title']),
        'class' => array(drupal_html_class($provider['title'])),
      );
    }
  }

  $form['#validators'] = array();
  if ($types) {
    $form['#validators']['media_file_validate_types'] = array($types);
  }

  $form['actions'] = array(
    '#type' => 'actions',
  );
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Continue'),
  );

  return $form;
}

/**
 * Allow stream wrappers to have their chance at validation.
 *
 * Any module that implements hook_media_parse will have an
 * opportunity to validate this.
 *
 * @see media_parse_to_uri()
 */
function ombumedia_internet_add_validate($form, &$form_state) {
  // Supporting providers can now claim this input. It might be a URL, but it
  // might be an embed code as well.
  $embed_code = $form_state['values']['embed_code'];

  try {
    $provider = ombumedia_internet_get_provider($embed_code);
    $provider->validate();
  }
  catch (MediaInternetNoHandlerException $e) {
    form_set_error('embed_code', $e->getMessage());
    return;
  }
  catch (MediaInternetValidationException $e) {
    form_set_error('embed_code', $e->getMessage());
    return;
  }

  $validators = $form['#validators'];
  $file = $provider->getFileObject();

  if ($validators) {
    try {
      $file = $provider->getFileObject();
    }
    catch (Exception $e) {
      form_set_error('embed_code', $e->getMessage());
      return;
    }

    // Check for errors. @see media_add_upload_validate calls file_save_upload().
    // this code is ripped from file_save_upload because we just want the validation part.
    // Call the validation functions specified by this function's caller.
    $errors = file_validate($file, $validators);

    if (!empty($errors)) {
      $message = t('%url could not be added.', array('%url' => $embed_code));
      if (count($errors) > 1) {
        $message .= theme('item_list', array('items' => $errors));
      }
      else {
        $message .= ' ' . array_pop($errors);
      }
      form_set_error('embed_code', $message);
      return FALSE;
    }
  }

  // @TODO: Validate that if we have no $uri that this is a valid file to
  // save. For instance, we may only be interested in images, and it would
  // be helpful to let the user know they passed the HTML page containing
  // the image accidentally. That would also save us from saving the file
  // in the submit step.

  // This is kinda a hack of the same.

  // This should use the file_validate routines that the upload form users.
  // We need to fix the media_parse_to_file routine to allow for a validation.
}

/**
 * Upload a file from a URL.
 *
 * This will copy a file from a remote location and store it locally.
 *
 * @see media_parse_to_uri()
 * @see media_parse_to_file()
 */
function ombumedia_internet_add_submit($form, &$form_state) {
  $embed_code = $form_state['values']['embed_code'];

  try {
    // Save the remote file
    $provider = ombumedia_internet_get_provider($embed_code);
    // Providers decide if they need to save locally or somewhere else.
    // This method returns a file object
    $file = $provider->save();
  }
  catch (Exception $e) {
    form_set_error('embed_code', $e->getMessage());
    return;
  }

  if (!$file->fid) {
    form_set_error('embed_code', t('The file %file could not be saved. An unknown error has occurred.', array('%file' => $embed_code)));
    return;
  }
  else {
    $form_state['file'] = $file;
  }

  // Redirect to the file edit page after submission.
  $redirect_path = 'file/' . $file->fid . '/' . $form['#redirect']['action'];
  $redirect_query = $form['#redirect']['query'];
  $form_state['redirect'] = array($redirect_path, array('query' => $redirect_query));
}


/**
 * Classes.
 */

if (!class_exists('MediaInternetBaseHandler')) {
  /**
   * Base OmbuMediaInternetBaseHandler class.
   */
  abstract class MediaInternetBaseHandler {

    /**
     * The constructor for the OmbuMediaInternetBaseHandler class. This method is also called
     * from the classes that extend this class and override this method.
     */
    public function __construct($embedCode) {
      $this->embedCode = $embedCode;
    }

    /**
     * Determines if this handler should claim the item.
     *
     * @param string $embed_code
     *   A string of user-submitted embed code.
     *
     * @return boolean
     *   Pass TRUE to claim the item.
     */
    abstract public function claim($embed_code);

    /**
     * Returns a file object which can be used for validation.
     *
     * @return StdClass
     */
    abstract public function getFileObject();

    /**
     * If required, implementors can validate the embedCode.
     */
    public function validate() {
    }

    /**
     * Before the file has been saved, implementors may do additional operations.
     *
     * @param object $file_obj
     */
    public function preSave(&$file_obj) {
    }

    /**
     * Saves a file to the file_managed table (with file_save).
     *
     * @return StdClass
     */
    public function save() {
      $file_obj = $this->getFileObject();
      $this->preSave($file_obj);
      file_save($file_obj);
      $this->postSave($file_obj);
      return $file_obj;
    }

    /**
     * After the file has been saved, implementors may do additional operations.
     *
     * @param object $file_obj
     */
    public function postSave(&$file_obj) {
    }
  }

  class MediaInternetValidationException extends Exception {}
  class MediaInternetNoHandlerException extends Exception {}

}
/**
 * Media InternetFileHandler.
 */
class OmbuMediaInternetFileHandler extends MediaInternetBaseHandler {

  public $fileObject;

  public function preSave(&$file_obj) {
    // Coppies the remote file locally.
    $remote_uri = $file_obj->uri;
    //@TODO: we should follow redirection here an save the final filename, not just the basename.
    $local_filename = basename($remote_uri);
    $local_filename = file_munge_filename($local_filename, variable_get('ombumedia__file_extensions'), FALSE);
    $local_uri = file_stream_wrapper_uri_normalize('temporary://' . $local_filename);
    if (!@copy($remote_uri, $local_uri)) {
      throw new Exception('Unable to add file ' . $remote_uri);
      return;
    }
    // Make the current fileObject point to the local_uri, not the remote one.
    $file_obj = file_uri_to_object($local_uri);
  }

  public function postSave(&$file_obj) {
    $scheme = variable_get('file_default_scheme', 'public') . '://';
    module_load_include('inc', 'file_entity', 'file_entity.pages');
    $destination_uri = file_entity_upload_destination_uri(array());
    $uri = file_stream_wrapper_uri_normalize($destination_uri . '/' . $file_obj->filename);
    // Now to its new home.
    $file_obj = file_move($file_obj, $uri, FILE_EXISTS_RENAME);
  }

  public function getFileObject() {
    if (!$this->fileObject) {
      $this->fileObject = file_uri_to_object($this->embedCode);
    }
    return $this->fileObject;
  }

  public function claim($embedCode) {
    // Claim only valid URLs using a supported scheme.
    if (!valid_url($embedCode, TRUE) || !in_array(file_uri_scheme($embedCode), variable_get('ombumedia__fromurl_supported_schemes'))) {
      return FALSE;
    }

    // This handler is intended for regular files, so don't claim URLs
    // containing query strings or fragments.
    if (preg_match('/[\?\#]/', $embedCode)) {
      return FALSE;
    }

    // Since this handler copies the remote file to the local web server, do not
    // claim a URL with an extension disallowed for media uploads.
    $regex = '/\.(' . preg_replace('/ +/', '|', preg_quote(variable_get('ombumedia__file_extensions'))) . ')$/i';
    if (!preg_match($regex, basename($embedCode))) {
      return FALSE;
    }

    return TRUE;
  }
}

