import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['space-configuration'],

  /**
   * @override
   */
  i18nPrefix: 'components.spaceConfiguration',

  /**
   * @virtual
   * @type {Model.Space}
   */
  space: undefined,

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  spaceTags: computed('space.tags', function spaceTags() {
    return get(this.space ?? {}, 'tags')?.map(tag => ({ label: tag }));
  }),

  /**
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async saveSpaceValue(key, value) {
    if (get(this.space, key) === value) {
      return;
    }
    set(this.space, key, value);
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
        default:
          break;
      }
    },
  },
});
