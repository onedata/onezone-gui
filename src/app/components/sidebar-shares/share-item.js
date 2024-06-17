/**
 * A first-level item component for shares sidebar
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { conditional, eq, raw } from 'ember-awesome-macros';
import { reads, collect } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import { computedRelationProxy } from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  spaceManager: service(),
  clipboardActions: service(),

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
   * @type {ComputedProperty<PromiseObject<Space>>}
   */
  spaceProxy: computedRelationProxy('share', 'space'),

  /**
   * @type {ComputedProperty<Record<string, Utils.Action>>}
   */
  actionsCache: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('share', function copyIdAction() {
    this.actionsCache.copyIdAction?.destroyAfterAllExecutions();
    const {
      share,
      clipboardActions,
    } = this.getProperties('share', 'clipboardActions');

    return this.actionsCache.copyIdAction =
      clipboardActions.createCopyRecordIdAction({ record: share });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect('copyIdAction'),

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.cacheFor('copyIdAction')?.destroyAfterAllExecutions();
    } finally {
      this._super(...arguments);
    }
  },
});
