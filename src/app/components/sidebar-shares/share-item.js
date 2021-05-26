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
import { reads, collect } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  globalClipboard: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarShares.shareItem',

  /**
   * @virtual optional
   * @type {boolean}
   */
  inSidenav: false,

  /**
   * @type {Ember.ComputedProperty<Share>}
   */
  share: reads('item'),

  icon: conditional(
    eq('item.fileType', raw('file')),
    raw('browser-file'),
    raw('browser-directory')
  ),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed(function copyIdAction() {
    return {
      action: () => this.get('globalClipboard').copy(
        this.get('share.entityId'),
        this.t('shareId')
      ),
      title: this.t('copyId'),
      class: 'copy-share-id-action-trigger',
      icon: 'copy',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect('copyIdAction'),
});
