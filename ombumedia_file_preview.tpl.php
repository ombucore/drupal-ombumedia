<?php

?>
<div class="ombumedia-file-preview">
  <h1><?php print $title; ?></h1>
  <div class="file-preview">
    <?php print render($preview); ?>
  </div>
  <hr>
  <?php print render($actions); ?>
  <?php print render($usage); ?>
</div>
