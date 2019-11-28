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
import { computed, get, observer, getProperties } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { Promise } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';

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
   * @virtual
   * @type {Models.Token}
   */
  token: undefined,

  /**
   * @type {Ember.ComputedProperty<SafeString>}
   */
  targetLabel: computed('token.subtype', function targetLabel() {
    const tokenSubtype = this.get('token.subtype');
    return tokenSubtype &&
      this.t(`targetLabels.${tokenTypeToTargetLabelI18nKey[tokenSubtype]}`);
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
          default:
            return null;
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
    return new Promise(resolve => {
      scheduleOnce('afterRender', this, () => {
        const token = this.get('token');
        const proxy = token ?
          token.updateTokenTargetProxy() : Promise.resolve(null);

        proxy.then(target => {
          if (target) {
            const {
              isDeleted,
              isForbidden,
            } = getProperties(target, 'isDeleted', 'isForbidden');
            if (isDeleted) {
              return Promise.reject({ id: 'notFound' });
            } else if (isForbidden) {
              return Promise.reject({ id: 'forbidden' });
            }
          }
          resolve(target);
        }).catch(error => {
          const errorId = error && error.id;
          resolve({
            hasErrorPossibleToRender: Boolean(
              targetFetchErrorsPossibleToRender[errorId]
            ),
            error,
          });
        });
      });
    });
  },

  tokenObserver: observer('token', function tokenObserver() {
    this.updateTokenTargetProxy();
  }),
});
