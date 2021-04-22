import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { conditional } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: ['lambda-functions-list-entry'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesFunctions.lambdaFunctionsListEntry',

  /**
   * @virtual
   * @type {Models.LambdaFunction}
   */
  lambdaFunction: undefined,

  /**
   * @type {Boolean}
   */
  isExpanded: false,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  toggleDetailsText: conditional(
    'isExpanded',
    computedT('hideDetails'),
    computedT('showDetails'),
  ),

  actions: {
    toggleDetails() {
      this.toggleProperty('isExpanded');
    },
  },
});
