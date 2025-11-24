/**
 * Component displaying textual information about token template
 *
 * @author Agnieszka Raczek
 * @copyright(C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import { computed } from '@ember/object';

export default class TileTextInfoComponent extends Component {
  /**
   * @override
   */
  constructor() {
    super(...arguments);

    /** @type {String} */
    this.templateName = this.args.templateName;
  }

  @computed('templateName')
  get locale() {
    return new Locale(`components.tokenTemplateSelector.templates.${this.templateName}`);
  }

  @computed('templateName')
  get tokenTemplateInfoTriggerId() {
    return `token-template-info-${this.templateName}`;
  }

  @computed()
  get isLink1Present() {
    return typeof this.locale.t('link1') === 'object';
  }

  @computed()
  get isLink2Present() {
    return typeof this.locale.t('link2') === 'object';
  }

  @computed()
  get tooltipText() {
    const link1 = this.locale.t('link1') ? '<a href="' + this.t('link1') + '">' +
      this.t('linkName1') + '</a>' : '';
    const link2 = this.locale.t('link2') ? '<a href="' + this.t('link2') + '">' +
      this.t('linkName2') + '</a>' : '';
    return this.t('tooltip', { link1, link2 });
  }
}
