import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject } from '@ember/service';

export default Component.extend(I18n, {
  spaceActions: inject(),

  i18nPrefix: 'components.contentSpacesNew',

  spaceName: undefined,

  actions: {
    createSpace() {
      const spaceName = this.get('spaceName');
      return this.get('spaceActions').createSpace({ name: spaceName });
    },
  },
});
