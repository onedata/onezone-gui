/**
 * Hint for oneclient token template.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TemplateHint from './template-hint';
import { inject as service } from '@ember/service';

export default class OneclientTemplateHintComponent extends TemplateHint {
  @service homepageUrl;

  /** @type {string} */
  get oneclientLink() {
    return this.homepageUrl.generateDocumentationUrl({ topic: 'oneclient' });
  }
}
