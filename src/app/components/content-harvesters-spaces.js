/**
 * A component that shows spaces attached to harvester
 *
 * @author Michał Borzęcki, Agnieszka Warchoł, Jakub Liput
 * @copyright (C) 2019-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { ResourceListItem } from 'onedata-gui-common/components/resources-list';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import AddYourSpaceAction from 'onezone-gui/utils/add-your-space-action';
import {
  destroyDestroyableComputedValues,
  destroyableComputed,
  initDestroyableCache,
} from 'onedata-gui-common/utils/destroyable-computed';
import { getNameWithConflictLabel } from 'onedata-gui-common/components/name-conflict';

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
   * @type {string}
   */
  searchString: '',

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
   * @type {ComputedProperty<Array<SpaceListItem>>}
   */
  filteredSpaceItems: computed(
    'spaceItems.[]',
    'searchString',
    function filteredSpaceItems() {
      return this.spaceItems.filter(item => {
        const searchableName = getNameWithConflictLabel(
          item.record.name,
          item.record.conflictLabel
        );
        return searchableName.toLowerCase().includes(this.searchString.toLowerCase());
      });
    }
  ),

  addYourSpaceAction: destroyableComputed('harvester', function addYourSpaceAction() {
    return AddYourSpaceAction.create({
      ownerSource: this,
      context: {
        onSpaceAdd: (selectedSpace) => this.addYourSpace(selectedSpace),
        relatedRecord: this.harvester,
        relation: 'sourceFor',
      },
    });
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

  /** @override */
  init() {
    initDestroyableCache(this);
    this._super(...arguments);
  },

  /** @override */
  willDestroy() {
    try {
      destroyDestroyableComputedValues(this);
    } finally {
      this._super(...arguments);
    }
  },

  async addYourSpace(space) {
    await this.harvesterActions.addSpaceToHarvester(this.harvester, space);
  },

  actions: {
    openAddYourSpaceModal() {
      this.addYourSpaceAction.executeCallback();
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
