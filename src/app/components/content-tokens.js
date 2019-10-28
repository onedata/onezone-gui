/**
 * A content page for single selected token.
 *
 * @module components/content-tokens
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

const tokenTypeToTargetLabelI18nKey = {
  userJoinGroup: 'targetGroup',
  groupJoinGroup: 'targetGroup',
  userJoinSpace: 'targetSpace',
  groupJoinSpace: 'targetSpace',
  supportSpace: 'spaceToBeSupported',
  registerOneprovider: 'adminUser',
  userJoinCluster: 'targetCluster',
  groupJoinCluster: 'targetCluster',
  userJoinHarvester: 'targetHarvester',
  groupJoinHarvester: 'targetHarvester',
  spaceJoinHarvester: 'targetHarvester',
};

const targetFetchErrorsPossibleToRender = {
  forbidden: { icon: 'no-view' },
  notFound: { icon: 'x' },
};

export default Component.extend(I18n, createDataProxyMixin('tokenTarget'), {
  classNames: ['content-tokens'],

  i18n: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokens',

  /**
   * @type {Ember.ComputedProperty<SafeString>}
   */
  targetLabel: computed('token.subtype', function targetLabel() {
    const type = this.get('token.subtype');

    return type && this.t(`targetLabels.${tokenTypeToTargetLabelI18nKey[type]}`);
  }),

  /**
   * @type {Ember.ComputedProperty<string|null>}
   */
  targetIcon: computed('tokenTarget', function targetIcon() {
    const tokenTarget = this.get('tokenTarget');

    if (tokenTarget) {
      if (get(tokenTarget, 'error')) {
        const errorId = get(tokenTarget, 'error.id');
        return (targetFetchErrorsPossibleToRender[errorId] || {}).icon || null;
      } else {
        const modelName = tokenTarget.constructor.modelName;
        switch (modelName) {
          case 'group':
          case 'space':
          case 'user':
          case 'cluster':
            return modelName;
          case 'harvester':
            return 'light-bulb';
        }
      }
    } else {
      return null;
    }
  }),

  /**
   * @override
   */
  fetchTokenTarget() {
    const proxy = this.get('token.tokenTargetProxy') || resolve(null);
    return proxy.catch(error => {
      const errorId = error && error.id;
      return {
        hasErrorPossibleToRender: Boolean(targetFetchErrorsPossibleToRender[errorId]),
        error,
      };
    });
  },
});
