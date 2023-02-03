/**
 * Tags selector presenting available, not-already-added tags for space with category
 * switch.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import {
  computed,
  observer,
} from '@ember/object';
import { getBy } from 'ember-awesome-macros';
import _ from 'lodash';

export default Component.extend(I18n, {
  classNames: ['space-tags-selector-editor'],

  i18n: service(),
  spaceManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceConfiguration.spaceTagsSelector',

  //#region state

  /**
   * @type {string}
   */
  selectedCategory: undefined,

  /**
   * @type {string}
   */
  tagsFilterValue: '',

  //#endregion

  /**
   * This component does not have any additional settings. `settings` field is
   * defined to provide editor API compatible with the one expected by the
   * tags input.
   * @virtual optional
   * @type {Object}
   */
  settings: undefined,

  /**
   * @virtual
   * @type {Array<Tag>}
   */
  selectedTags: Object.freeze([]),

  /**
   * @virtual
   * @type {(tagsToAdd: Array<Tag>) => void}
   */
  onTagsAdded: undefined,

  /**
   * @type {Object}
   */
  popoverApi: undefined,

  /**
   * Maps: categoryName -> Array of available tags objects for tags input.
   * @returns {Object<string, Array<Tag>>}
   */
  availableTagsByCategory: computed('usedTagLabels', function availableTagsByCategory() {
    const availableSpaceTags = this.spaceManager.getAvailableSpaceTags();
    const result = [];
    for (const categoryName in availableSpaceTags) {
      result[categoryName] = availableSpaceTags[categoryName]
        .filter(label => !this.usedTagLabels.includes(label))
        .sort()
        .map(label => ({ label }));
    }
    return result;
  }),

  tagCategories: computed(function tagCategories() {
    const availableSpaceTags = this.spaceManager.getAvailableSpaceTags();
    return Object.keys(availableSpaceTags);
  }),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  tagsToRender: computed(
    'availableTagsByCategory',
    'selectedCategory',
    'tagsFilterValue',
    function tagsToRender() {
      const availableCategoryTags =
        this.availableTagsByCategory[this.selectedCategory] ?? [];
      const normalizedFilterValue = this.tagsFilterValue?.trim().toLowerCase();
      if (normalizedFilterValue) {
        return availableCategoryTags.filter(({ label }) =>
          label.includes(normalizedFilterValue)
        );
      } else {
        return availableCategoryTags;
      }
    }
  ),

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  usedTagLabels: computed('selectedTags.@each.label', function usedTagLabels() {
    return this.selectedTags.map(tag => tag.label);
  }),

  selectedTagsObserver: observer(
    'selectedTags.[]',
    function selectedTagsObserver() {
      this.repositionPopover();
    }
  ),

  init() {
    this._super(...arguments);
    const nonEmptyCategory = this.tagCategories.find(category =>
      !_.isEmpty(this.availableTagsByCategory[category])
    );
    this.set('selectedCategory', nonEmptyCategory || this.tagCategories[0]);
  },

  repositionPopover() {
    this.popoverApi.reposition();
  },

  actions: {
    tagSelected(tag) {
      this.onTagsAdded([tag]);
    },
  },
});
