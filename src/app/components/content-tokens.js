/**
 * A content page for single selected token.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, set, get, observer } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import { resolve } from 'rsvp';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import computedT from 'onedata-gui-common/utils/computed-t';
import Action from 'onedata-gui-common/utils/action';
import { tag, equal, raw } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-tokens'],

  i18n: service(),
  tokenActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokens',

  /**
   * @virtual
   * @type {Models.Token}
   */
  token: undefined,

  /**
   * One of: view, edit
   * @type {String}
   */
  mode: 'view',

  /**
   * @override
   */
  globalActionsTitle: computedT('globalActionsGroupName'),

  /**
   * @override
   */
  globalActions: collect('editTriggerAction'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  editTriggerAction: computed(function editTriggerAction() {
    const component = this;
    return Action.extend({
      ownerSource: component,
      component,
      i18nPrefix: tag `${'component.i18nPrefix'}.editTriggerAction`,
      className: 'edit-token-action-btn',
      icon: 'browser-rename',
      title: computedT('title'),
      disabled: equal('component.mode', raw('edit')),
      execute() {
        set(component, 'mode', 'edit');
        return resolve();
      },
    }).create();
  }),

  tokenObserver: observer('token', function tokenObserver() {
    if (this.get('mode') === 'edit') {
      this.set('mode', 'view');
    }
  }),

  willDestroyElement() {
    try {
      this.cacheFor('editTriggerAction')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    async saveToken(tokenDiff) {
      const modifyTokenAction = this.tokenActions.createModifyTokenAction({
        token: this.token,
        tokenDiff,
      });
      try {
        const result = await modifyTokenAction.execute();
        if (get(result, 'status') === 'done') {
          safeExec(this, () => this.set('mode', 'view'));
        }
      } finally {
        modifyTokenAction.destroy();
      }
    },
  },
});
