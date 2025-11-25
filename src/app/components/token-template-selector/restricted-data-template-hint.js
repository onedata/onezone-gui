/**
 * Hint for restricted data access token template.
 *
 * @author Agnieszka Raczek
 * @copyright(C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import { computed } from '@ember/object';

export default class RestrictedDataTemplateHintComponent extends Component {
  /** @type {string} */
  get templateName() {
    return this.args.templateName;
  }

  @computed('templateName')
  get locale() {
    return new Locale(`components.tokenTemplateSelector.templates.${this.templateName}`);
  }
}
