/**
 * Consumer caveat fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { promise } from 'ember-awesome-macros';
import { ModelTagsField, caveatCustomFieldCommonExtension, createCaveatGroup } from './common';

const ConsumerField = ModelTagsField.extend({
  ...caveatCustomFieldCommonExtension,

  recordManager: service(),
  userManager: service(),
  groupManager: service(),
  currentUser: service(),

  /**
   * Translations that are no context-aware for form element instance.
   * @type {string}
   */
  fieldUtilI18nPrefix: 'utils.tokenEditor.fields.caveats.consumerCaveatGroup.gathering',

  /**
   * @override
   */
  name: 'consumer',

  /**
   * @override
   */
  models: computed(function models() {
    return [{
      name: 'user',
      getRecords: () => this.usersProxy,
    }, {
      name: 'group',
      getRecords: () => this.groupsProxy,
    }, {
      name: 'provider',
      getRecords: () => this.providersProxy,
    }];
  }),

  /**
   * @override
   * @type {ComputedProperty<ModelSelectorEditorSettings>}
   */
  tagEditorSettings: computed(
    'models',
    'modelListLoadingLabel',
    function tagEditorSettings() {
      const base = this._super(...arguments);
      const { modelListLoadingLabel } = this;
      return {
        modelListLoadingLabel,
        ...base,
      };
    }
  ),

  // FIXME: definicja settings
  modelListLoadingInfo: computed(
    'currentUser.user.{spaceList.isFulfilled,groupList.isFulfilled}',
    function modelListLoadingInfo() {
      const { spaceList, groupList } = this.currentUser.user;
      const spaceCount = spaceList.content?.hasMany('list').ids()?.length ?? 0;
      const groupCount = groupList.content?.hasMany('list').ids()?.length ?? 0;
      return {
        spaceCount,
        groupCount,
      };
    }
  ),

  modelListLoadingLabel: computed(
    'modelListLoadingInfo',
    function modelListLoadingLabel() {
      if (!this.modelListLoadingInfo) {
        return;
      }
      const { spaceCount, groupCount } = this.modelListLoadingInfo;
      if (spaceCount < 100 && groupCount < 100) {
        return;
      }
      let entities;
      if (spaceCount > 1 && groupCount > 1) {
        entities = 'all';
      } else if (spaceCount > 1) {
        entities = 'spaces';
      } else {
        entities = 'groups';
      }

      return this.i18n.t(
        `${this.fieldUtilI18nPrefix}.${entities}`, {
          spaceCount,
          groupCount,
        }
      );
    }
  ),

  /**
   * @type {ComputedProperty<PromiseArray<Models.User>>}
   */
  usersProxy: computed(function usersProxy() {
    return this.userManager.getAllKnownUsers();
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Models.Group>>}
   */
  groupsProxy: computed(function groupsProxy() {
    return this.groupManager.getAllKnownGroups();
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Models.Provider>>}
   */
  providersProxy: promise.array(computed(function providersProxy() {
    return this.recordManager.getUserRecordList('provider')
      .then((providers) => get(providers, 'list'));
  })),

  /**
   * @override
   */
  willDestroy() {
    try {
      this.cacheFor('usersProxy')?.destroy();
      this.cacheFor('groupsProxy')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});

export const ConsumerCaveatGroup = createCaveatGroup('consumer', {}, [ConsumerField]);
