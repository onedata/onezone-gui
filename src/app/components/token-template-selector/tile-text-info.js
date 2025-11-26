/**
 * Component displaying textual information about token template
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import { computed } from '@ember/object';
import { dasherize } from '@ember/string';

export default class TileTextInfoComponent extends Component {
  /** @type {string} */
  @computed('args.templateName')
  get templateName() {
    return this.args.templateName;
  }

  @computed('templateName')
  get locale() {
    return new Locale(`components.tokenTemplateSelector.templates.${this.templateName}`);
  }

  /** @type {string} */
  @computed('templateName')
  get tokenTemplateInfoTriggerId() {
    return `token-template-info-${this.templateName}`;
  }

  /** @type {string} */
  @computed('templateName')
  get hintComponentPath() {
    const formattedTemplateName = dasherize(this.templateName);
    return `token-template-selector/${formattedTemplateName}-template-hint`;
  }
}
