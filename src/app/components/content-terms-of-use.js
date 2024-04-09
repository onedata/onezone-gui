/**
 * A component that shows terms of use content.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import computedT from 'onedata-gui-common/utils/computed-t';

export default Component.extend(I18n, {
  guiMessageManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTermsOfUse',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  header: computedT('termsOfUse'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  content: reads('guiMessageManager.termsOfUse'),
});
