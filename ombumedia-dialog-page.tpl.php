<?php

?>
<div class="ombumedia-popup">

  <?php if (isset($page['#tabs'])): ?>

    <div class="ombumedia-tabset ui-tabs">

        <div class="top">
          <ul class="ui-tabs-nav">
            <?php foreach(element_children($page['#tabs']) as $tab_key): ?>
              <li><a href="#<?php print $tab_key; ?>"><?php print $page['#tabs'][$tab_key]['#title']; ?></a></li>
            <?php endforeach; ?>
          </ul>
        </div>

        <?php foreach(element_children($page['#tabs']) as $tab_key): ?>
          <div id="<?php print $tab_key; ?>" class="ui-tabs-panel">

            <?php if ($page['#tabs']['#messages_tab'] === $tab_key): ?>
              <?php if (isset($messages)) { print $messages; } ?>
            <?php endif; ?>

            <?php print render($page['#tabs'][$tab_key]); ?>

          </div>
        <?php endforeach; ?>

    </div>

  <?php else: ?>

    <?php if (isset($messages)) { print $messages; } ?>
    <?php print render($page['content']); ?>

  <?php endif; ?>

</div>
