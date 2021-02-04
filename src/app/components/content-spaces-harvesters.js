/**
 * Manages harvesters of specified space
 *
 * @module components/content-spaces-harvesters
 * @author Michał Borzęcki, Agnieszka Warchoł
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { ResourceListItem } from 'onedata-gui-common/components/resources-list';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { promise } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import recordIcon from 'onedata-gui-common/utils/record-icon';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-spaces-harvesters'],

  spaceActions: service(),
  tokenActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesHarvesters',

  /**
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * @type {ComputedProperty<PromiseArray<Models.Harvester>>}
   */
  spaceHarvestersProxy: promise.array(computed('space', function spaceHarvestersProxy() {
    const space = this.get('space');
    if (space) {
      return space.getRelation('harvesterList')
        .then(harvesterList => get(harvesterList, 'list'));
    } else {
      return resolve([]);
    }
  })),

  /**
   * @type {ComputedProperty<Array<HarvesterListItem>>}
   */
  harvesterItems: computed('spaceHarvestersProxy.[]', function harvesterItems() {
    const harvesters = this.get('spaceHarvestersProxy.content') || [];
    const space = this.get('space');
    return harvesters.map(harvester => HarvesterListItem.create({
      ownerSource: this,
      parentSpace: space,
      harvester,
    }));
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  addHarvesterAction: computed('space', function addHarvesterAction() {
    const {
      space,
      spaceActions,
    } = this.getProperties('space', 'spaceActions');

    return spaceActions.createAddHarvesterToSpaceAction({ space });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  inviteHarvesterUsingTokenAction: computed(
    'space',
    function inviteHarvesterUsingTokenAction() {
      const {
        space,
        tokenActions,
      } = this.getProperties('space', 'tokenActions');

      return tokenActions.createGenerateInviteTokenAction({
        inviteType: 'harvesterJoinSpace',
        targetRecord: space,
      });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect('addHarvesterAction', 'inviteHarvesterUsingTokenAction'),
});

const HarvesterListItem = ResourceListItem.extend(OwnerInjector, {
  spaceActions: service(),
  router: service(),
  guiUtils: service(),

  /**
   * @virtual
   */
  harvester: undefined,

  /**
   * @virtual
   */
  parentSpace: undefined,

  /**
   * @override
   */
  label: reads('harvester.name'),

  /**
   * @override
   */
  conflictingLabelSource: reads('harvester'),

  /**
   * @override
   */
  icon: recordIcon('harvester'),

  /**
   * @override
   */
  link: computed('harvester', function link() {
    const {
      router,
      harvester,
      guiUtils,
    } = this.getProperties('router', 'harvester', 'guiUtils');
    return router.urlFor(
      'onedata.sidebar.content.aspect',
      'harvesters',
      guiUtils.getRoutableIdFor(harvester),
      'plugin'
    );
  }),

  /**
   * @override
   */
  actions: computed('parentSpace', 'harvester', function actions() {
    const {
      spaceActions,
      parentSpace,
      harvester,
    } = this.getProperties('spaceActions', 'parentSpace', 'harvester');
    return [spaceActions.createRemoveHarvesterFromSpaceAction({
      space: parentSpace,
      harvester,
    })];
  }),
});
