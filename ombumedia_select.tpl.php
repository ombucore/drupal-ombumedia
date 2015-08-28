<?php

?>
<div class="ombumedia-tabset ui-tabs">
  <div class="top">
    <ul class="ui-tabs-nav">
      <?php if ($library): ?>
        <li><a href="#library"><?php print t('Library'); ?></a></li>
      <?php endif; ?>
      <?php if ($upload): ?>
        <li><a href="#upload"><?php print t('Upload'); ?></a></li>
      <?php endif; ?>
      <?php if ($web): ?>
        <li><a href="#web"><?php print t('Web'); ?></a></li>
      <?php endif; ?>
    </ul>
  </div>

  <?php if ($library): ?>
    <div id="library" class="ui-tabs-panel"><?php print $library; ?></div>
  <?php endif; ?>

  <?php if ($upload): ?>
    <div id="upload" class="ui-tabs-panel"><?php print $upload; ?></div>
  <?php endif; ?>

  <?php if ($web): ?>
    <div id="web" class="ui-tabs-panel"><?php print $web; ?></div>
  <?php endif; ?>

</div>
