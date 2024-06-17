/**
 * Manages harvesters of specified space
 *
 * @author Michał Borzęcki, Agnieszka Warchoł
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { ResourceListItem } from 'onedata-gui-common/components/resources-list';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { promise } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/i18n';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

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
   * Values are computed objects that should be destroyed on recompute or parent destroy.
   * @type {Object}
   */
  destroyCache: undefined,

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
    this.destroyCache.harvesterItems?.forEach(obj => obj.destroy());
    const harvesters = this.get('spaceHarvestersProxy.content') || [];
    const space = this.get('space');
    const items = harvesters.map(harvester => HarvesterListItem.create({
      ownerSource: this,
      parentSpace: space,
      record: harvester,
    }));
    this.destroyCache.harvesterItems = items;
    return items;
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  addHarvesterAction: computed('space', function addHarvesterAction() {
    this.destroyCache.addHarvesterAction?.destroy();
    const action = this.spaceActions.createAddHarvesterToSpaceAction({
      space: this.space,
    });
    return this.destroyCache.addHarvesterAction = action;
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  inviteHarvesterUsingTokenAction: computed(
    'space',
    function inviteHarvesterUsingTokenAction() {
      this.destroyCache.inviteHarvesterUsingTokenAction?.destroy();
      const action = this.tokenActions.createGenerateInviteTokenAction({
        inviteType: 'harvesterJoinSpace',
        targetRecord: this.space,
      });
      return this.destroyCache.inviteHarvesterUsingTokenAction = action;
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect('addHarvesterAction', 'inviteHarvesterUsingTokenAction'),

  init() {
    this._super(...arguments);
    this.set('destroyCache', {});
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.destroyCache.addHarvesterAction?.destroy();
      this.destroyCache.inviteHarvesterUsingTokenAction?.destroy();
      this.destroyCache.harvesterItems?.forEach(obj => obj.destroy());
    } finally {
      this._super(...arguments);
    }
  },
});

const HarvesterListItem = ResourceListItem.extend(OwnerInjector, {
  spaceActions: service(),
  router: service(),
  guiUtils: service(),

  /**
   * @virtual
   */
  parentSpace: undefined,

  destroyCache: undefined,

  init() {
    this.set('destroyCache', {});
    this._super(...arguments);
  },

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
      'harvesters',
      guiUtils.getRoutableIdFor(record),
      'plugin'
    );
  }),

  /**
   * @override
   */
  actions: computed('parentSpace', 'record', function actions() {
    this.destroyCache.removeHarvesterFromSpaceAction?.destroy?.();
    const action = this.spaceActions.createRemoveHarvesterFromSpaceAction({
      space: this.parentSpace,
      harvester: this.record,
    });
    this.destroyCache.removeHarvesterFromSpaceAction = action;
    return [action];
  }),

  /**
   * @override
   */
  willDestroy() {
    try {
      Object.values(this.destroyCache).forEach(obj => obj.destroy());
    } finally {
      this._super(...arguments);
    }
  },
});
