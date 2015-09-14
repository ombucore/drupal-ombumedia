<?php

/**
 * @file
 * Filter formatter for ombu media module.
 */


/**
 * Implements hook_filter_info().
 */
function ombumedia_filter_info() {
  $filters['ombumedia'] = array(
    'title' => t('Render media placeholders'),
    'description' => t('Replaces media placeholders with the rendered file.'),
    'process callback' => 'ombumedia_render_filter_placeholders',
    'cache' => TRUE,
  );

  return $filters;
}


/**
 * Implements callback_filter_process().
 *
 * Converts embedded entity placeholders into rendered entities.
 */
function ombumedia_render_filter_placeholders($text, $filter, $format, $langcode, $cache, $cache_id) {
  $result = $text;

  if (strpos($text, 'data-ombumedia') !== FALSE) {
    $dom = ombumedia_dom_load_html($text);
    $xpath = new \DOMXPath($dom);

    foreach ($xpath->query('//*[@data-ombumedia]') as $node) {
      $media_info = $node->getAttribute('data-ombumedia');
      $media_info = json_decode($media_info);

      $file = NULL;
      $file_output = '';

      $file = file_load($media_info->fid);

      if ($file) {
        $file_output = file_view($file, $media_info->view_mode);
        $file_output = drupal_render($file_output);

        $file_node = $dom->createDocumentFragment();
        $file_node->appendXML($file_output);

        $node->parentNode->replaceChild($file_node, $node);
      }

    }

    $result = '';
    $body_node = $dom->getElementsByTagName('body')->item(0);
    foreach ($body_node->childNodes as $node) {
      $result .= $dom->saveXML($node);
    }
  }

  return $result;
}

/**
 * Helper function to load text snippet into full HTML for DOMDocument.
 */
function ombumedia_dom_load_html($snippet) {
  $document = <<<EOD
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
<body>!snippet</body>
</html>
EOD;
  // PHP's \DOMDocument serialization adds straw whitespace in case the markup
  // of the wrapping document contains newlines, so ensure to remove all
  // newlines before injecting the actual HTML body to process.
  $document = strtr($document, array("\n" => '', '!snippet' => $snippet));

  $dom = new \DOMDocument();
  // Ignore warnings during HTML soup loading.
  @$dom->loadHTML($document);

  return $dom;
}
