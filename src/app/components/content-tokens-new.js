/**
 * A component for creating new tokens
 *
 * @module components/content-tokens-new
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import { array, conditional, raw } from 'ember-awesome-macros';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  classNames: ['content-tokens-new'],

  tokenActions: service(),
  navigationState: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew',

  /**
   * @type {ComputedProperty<String>}
   */
  urlStep: reads('navigationState.aspectOptions.step'),

  /**
   * @type {ComputedProperty<String>}
   */
  activeStep: conditional(
    array.includes(raw(['templates', 'form']), 'urlStep'),
    'urlStep',
    raw('templates')
  ),

  activeStepObserver: observer('activeStep', function activeStepObserver() {
    const colContent = $('.col-content')[0];
    if (colContent) {
      colContent.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
  }),

  actions: {
    generateTemplateUrl(tokenDefaults = {}) {
      const aspectOptions = Object.assign({}, tokenDefaults, { step: 'form' });
      return this.get('router').urlFor(
        'onedata.sidebar.content',
        'tokens',
        'new', {
          queryParams: {
            options: serializeAspectOptions(aspectOptions),
          },
        }
      );
    },
    submit(rawToken) {
      const createTokenAction = this.get('tokenActions')
        .createCreateTokenAction({ rawToken });

      return createTokenAction.execute();
    },
  },
});
