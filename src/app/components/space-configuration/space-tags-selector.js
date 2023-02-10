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
import EmberObject, {
  computed,
  observer,
} from '@ember/object';
import { conditional, raw, array } from 'ember-awesome-macros';
import _ from 'lodash';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import computedT from 'onedata-gui-common/utils/computed-t';

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
   * @returns {Object<string, Array<SpaceTag>>}
   */
  availableTagsByCategory: computed('usedTagLabels', function availableTagsByCategory() {
    const availableSpaceTags = this.spaceManager.getAvailableSpaceTags();
    const result = [];
    for (const categoryName in availableSpaceTags) {
      result[categoryName] = availableSpaceTags[categoryName]
        .filter(label => !this.usedTagLabels.includes(label))
        .sort()
        .map(label => SpaceTag.create({ ownerSource: this, label }));
    }
    return result;
  }),

  tagCategories: computed(function tagCategories() {
    const availableSpaceTags = this.spaceManager.getAvailableSpaceTags();
    return Object.keys(availableSpaceTags ?? {});
  }),

  /**
   * @type {ComputedProperty<Array<SpaceTag>>}
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
          label.toLowerCase().includes(normalizedFilterValue)
        );
      } else {
        return availableCategoryTags;
      }
    }
  ),

  noTagsInOnezone: computed('tagCategories.[]', function noTagsInOnezone() {
    return _.isEmpty(this.tagCategories) ||
      _.isEmpty(_.flatten(Object.values(this.tagCategories)));
  }),

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

/**
 * Implements `Tag` type for use with space tags.
 * @type {EmberObject}
 */
export const SpaceTag = EmberObject.extend(I18n, OwnerInjector, {
  spaceManager: service(),
  i18n: service(),

  i18nPrefix: 'components.spaceConfiguration.spaceTagsSelector.spaceTag',

  /**
   * Implements `Tag.label` property.
   * @virtual
   * @type {string}
   */
  label: undefined,

  /**
   * Implements `Tag.className` optional property.
   * @type {ComputedProperty<string>}
   */
  className: conditional(
    'isSupportedTag',
    raw(''),
    raw('tag-item-danger'),
  ),

  /**
   * Implements `Tag.tip` optional property.
   * @type {ComputedProperty<SafeString>}
   */
  tip: conditional(
    'isSupportedTag',
    null,
    computedT('unsupported'),
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSupportedTag: array.includes('availableLabels', 'label'),

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  availableLabels: computed(function availableLabels() {
    return _.flatten(Object.values(
      this.spaceManager.getAvailableSpaceTags()
    ));
  }),
});
