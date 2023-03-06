/**
 * Shows loading state of lambda.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import recordIcon from 'onedata-gui-common/utils/record-icon';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.loadingView',

  /**
   * @virtual
   * @type {PromiseProxy}
   */
  loadingProxy: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onBackSlide: undefined,

  /**
   * @type {string}
   */
  backResourceIcon: recordIcon('atmLambda'),

  /**
   * @type {ComputedProperty<LoadingCarouselViewHeaderTexts>}
   */
  headerTexts: computed(function headerText() {
    return {
      loading: this.t('header.loading'),
      notFound: this.t('header.notFound'),
      forbidden: this.t('header.forbidden'),
      otherError: this.t('header.otherError'),
    };
  }),
});
