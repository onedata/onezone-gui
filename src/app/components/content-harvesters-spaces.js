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
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-harvesters-spaces'],

  harvesterActions: service(),
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
  isInviteUsingTokenModalOpened: false,

  /**
   * @type {boolean}
   */
  addYourSpaceModalVisible: false,

  /**
   * @type {boolean}
   */
  isAddingYourSpace: false,

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Model.Space>>}
   */
  spacesProxy: computed('harvester', function spacesProxy() {
    const harvester = this.get('harvester');
    return PromiseArray.create({
      promise: get(harvester, 'spaceList').then(sl => get(sl, 'list')),
    });
  }),

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
      action: () => this.set('addYourSpaceModalVisible', true),
      title: this.t('addYourSpace'),
      class: 'add-your-space-action',
      icon: 'group-invite',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  inviteSpaceUsingTokenAction: computed(function inviteSpaceUsingTokenAction() {
    return {
      action: () => this.set('isInviteUsingTokenModalOpened', true),
      title: this.t('inviteSpaceUsingToken'),
      class: 'invite-space-using-token-action',
      icon: 'join-plug',
    };
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: collect('addYourSpaceAction', 'inviteSpaceUsingTokenAction'),

  /**
   * @override 
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function globalActionsTitle() {
    return this.t('harvesterSpaces');
  }),

  actions: {
    removeSpace() {
      this.set('isRemovingSpace', true);
      const {
        spaceToRemove,
        harvester,
        harvesterActions,
      } = this.getProperties('spaceToRemove', 'harvester', 'harvesterActions');
      harvesterActions.removeSpaceFromHarvester(harvester, spaceToRemove)
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
      harvesterActions.addSpaceToHarvester(harvester, space).finally(() =>
        safeExec(this, 'setProperties', {
          isAddingYourSpace: false,
          addYourSpaceModalVisible: false,
        })
      );
    },
  },
});
