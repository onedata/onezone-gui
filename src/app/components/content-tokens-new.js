import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { getProperties } from '@ember/object';
import moment from 'moment';

// FIXME: change image in content-info
export default Component.extend(I18n, {
  classNames: ['content-tokens-new'],

  clientTokenActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew',

  actions: {
    create({ values }) {
      const {
        clientTokenActions,
      } = this.getProperties('clientTokenActions');

      const {
        name,
        validUntilEnabled,
        validUntil,
      } = getProperties(values, 'name', 'validUntilEnabled' ,'validUntil');

      const tokenPrototype = {
        name,
        caveats: [],
      };
      if (validUntilEnabled) {
        tokenPrototype.caveats.push({
          type: 'time',
          validUntil: moment(validUntil).unix(),
        });
      }

      return clientTokenActions.createToken(tokenPrototype);
    },
  },
});
