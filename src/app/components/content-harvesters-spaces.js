/**
 * A component that shows spaces attached to harvester
 *
 * @module components/content-harvesters-spaces
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import computedT from 'onedata-gui-common/utils/computed-t';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  I18n,
  GlobalActions,
  createDataProxyMixin('spaces', { type: 'array' }), {
    classNames: ['content-harvesters-spaces'],

    harvesterActions: service(),
    tokenActions: service(),
    i18n: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentHarvestersSpaces',

    /**
     * @virtual
     * @type {Model.Harvester}
     */
    harvester: undefined,

    /**
     * @type {Model.Space|null}
     */
    spaceToRemove: null,

    /**
     * @type {boolean}
     */
    isRemovingSpace: false,

    /**
     * @type {boolean}
     */
    isAddYourSpaceModalOpened: false,

    /**
     * @type {boolean}
     */
    isAddingYourSpace: false,

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    removeSpaceAction: computed(function removeSpaceAction() {
      return {
        action: space => this.set('spaceToRemove', space),
        title: this.t('removeThisSpace'),
        class: 'remove-space',
        icon: 'close',
      };
    }),

    /**
     * @type {Ember.ComputedProperty<Array<Action>>}
     */
    spaceActions: collect('removeSpaceAction'),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    addYourSpaceAction: computed(function addYourSpaceAction() {
      return {
        action: () => this.set('isAddYourSpaceModalOpened', true),
        title: this.t('addYourSpace'),
        class: 'add-your-space-action',
        icon: 'space-add',
      };
    }),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    inviteSpaceUsingTokenAction: computed(
      'harvester',
      function inviteSpaceUsingTokenAction() {
        const {
          harvester,
          tokenActions,
        } = this.getProperties('harvester', 'tokenActions');

        return tokenActions.createGenerateInviteTokenAction({
          inviteType: 'spaceJoinHarvester',
          targetRecord: harvester,
        });
      }
    ),

    /**
     * @override 
     * @type {Ember.ComputedProperty<Array<Action>>}
     */
    globalActions: collect(
      'addYourSpaceAction',
      'inviteSpaceUsingTokenAction'
    ),

    /**
     * @override 
     * @type {Ember.ComputedProperty<string>}
     */
    globalActionsTitle: computedT('harvesterSpaces'),

    /**
     * @returns {Promise}
     */
    fetchSpaces() {
      const harvester = this.get('harvester');
      return get(harvester, 'hasViewPrivilege') !== false ?
        get(harvester, 'spaceList').then(sl => sl ? get(sl, 'list') : A()) :
        reject({ id: 'forbidden' });
    },

    actions: {
      removeSpace() {
        this.set('isRemovingSpace', true);
        const {
          spaceToRemove,
          harvester,
          harvesterActions,
        } = this.getProperties('spaceToRemove', 'harvester', 'harvesterActions');
        return harvesterActions.removeSpaceFromHarvester(harvester, spaceToRemove)
          .finally(() =>
            safeExec(this, 'setProperties', {
              isRemovingSpace: false,
              spaceToRemove: null,
            })
          );
      },
      addYourSpace(space) {
        this.set('isAddingYourSpace', true);
        const {
          harvester,
          harvesterActions,
        } = this.getProperties('harvester', 'harvesterActions');
        return harvesterActions.addSpaceToHarvester(harvester, space).finally(() =>
          safeExec(this, 'setProperties', {
            isAddingYourSpace: false,
            isAddYourSpaceModalOpened: false,
          })
        );
      },
      inviteSpaceUsingToken() {
        return this.get('inviteSpaceUsingTokenAction').execute();
      },
    },
  }
);
