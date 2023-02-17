/**
 * A component that shows spaces attached to harvester
 *
 * @module components/content-harvesters-spaces
 * @author Michał Borzęcki, Agnieszka Warchoł
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { ResourceListItem } from 'onedata-gui-common/components/resources-list';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-harvesters-spaces'],

  harvesterActions: service(),
  tokenActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersSpaces',

  /**
   * @type {Models.Harvester}
   */
  harvester: undefined,

  /**
   * @type {boolean}
   */
  isAddYourSpaceModalOpened: false,

  /**
   * @type {boolean}
   */
  isAddingYourSpace: false,

  /**
   * @type {ComputedProperty<PromiseArray<Models.Space>>}
   */
  harvesterSpacesProxy: promise.array(computed(
    'harvester',
    function harvesterSpacesProxy() {
      const harvester = this.get('harvester');
      if (harvester) {
        return harvester.getRelation('spaceList')
          .then(spaceList => get(spaceList, 'list'));
      } else {
        return resolve([]);
      }
    })),

  /**
   * @type {ComputedProperty<Array<SpaceListItem>>}
   */
  spaceItems: computed('harvesterSpacesProxy.[]', function spaceItems() {
    const harvester = this.get('harvester');
    const spaces = this.get('harvesterSpacesProxy.content') || [];
    return spaces.map(space => SpaceListItem.create({
      ownerSource: this,
      parentHarvester: harvester,
      record: space,
    }));
  }),

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

  actions: {
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
});

const SpaceListItem = ResourceListItem.extend(OwnerInjector, {
  harvesterActions: service(),
  router: service(),
  guiUtils: service(),

  /**
   * @virtual
   */
  parentHarvester: undefined,

  /**
   * @override
   */
  link: computed('record', function link() {
    const {
      router,
      record,
      guiUtils,
    } = this.getProperties('router', 'record', 'guiUtils');
    return router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      guiUtils.getRoutableIdFor(record),
      'index'
    );
  }),

  actions: computed('parentHarvester', 'record', function actions() {
    const {
      harvesterActions,
      parentHarvester,
      record,
    } = this.getProperties('harvesterActions', 'parentHarvester', 'record');
    return [harvesterActions.createRemoveSpaceFromHarvesterAction({
      harvester: parentHarvester,
      space: record,
    })];
  }),

});
