/**
 * Hint for token template.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import { computed } from '@ember/object';

export default class TemplateHintComponent extends Component {
  @computed('args.templateName')
  get locale() {
    return new Locale(
      `components.tokenTemplateSelector.templates.${this.args.templateName}`
    );
  }
}
