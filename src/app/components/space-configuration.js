// FIXME: jsdoc

import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * @typedef {'view'|'edit'} SpaceConfigDescriptionEditorMode
 */

export default Component.extend(I18n, {
  classNames: ['space-configuration', 'fill-flex-using-column', 'fill-flex-limited'],

  /**
   * @override
   */
  i18nPrefix: 'components.spaceConfiguration',

  /**
   * @virtual
   * @type {Model.Space}
   */
  space: undefined,

  //#region state

  /**
   * @type {SpaceConfigDescriptionEditorMode}
   */
  descriptionEditorMode: 'view',

  //#endregion

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  spaceTags: computed('space.tags', function spaceTags() {
    return get(this.space ?? {}, 'tags')?.map(tag => ({ label: tag }));
  }),

  isAdvertised: reads('space.advertisedInMarketplace'),

  /**
   * @param {string} propertyName
   * @param {any} value
   * @returns {Promise<void>}
   */
  async saveSpaceValue(propertyName, value) {
    if (get(this.space, propertyName) === value) {
      return;
    }
    set(this.space, propertyName, value);
    await this.space.save();
  },

  actions: {
    async saveValue(fieldId, value) {
      switch (fieldId) {
        case 'name':
        case 'organizationName':
          await this.saveSpaceValue(fieldId, value);
          break;
        case 'tags': {
          const tagsRawValue = value?.map(({ label }) => label) || [];
          await this.saveSpaceValue('tags', tagsRawValue);
          break;
        }
        case 'advertised': {
          // FIXME: implement advertised change
          throw new Error('advertised state change not implemented');
        }
        default:
          break;
      }
    },
  },
});
