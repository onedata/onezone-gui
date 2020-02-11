/**
 * A first-level item component for shares sidebar
 *
 * @module components/sidebar-shares/share-item
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { conditional, eq, raw } from 'ember-awesome-macros';

export default Component.extend({
  tagName: '',

  icon: conditional(
    eq('item.fileType', raw('file')),
    raw('browser-file'),
    raw('browser-directory')
  ),
});
