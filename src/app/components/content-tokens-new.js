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
import { array, conditional, raw } from 'ember-awesome-macros';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  classNames: ['content-tokens-new'],

  tokenActions: service(),
  navigationState: service(),
  router: service(),
  store: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew',

  /**
   * @type {Object}
   */
  tokenTemplate: undefined,

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

  init() {
    this._super(...arguments);
    this.loadTokenTemplateFromUrl();
  },

  loadTokenTemplateFromUrl() {
    const stringifiedTokenTemplate =
      decodeURIComponent(this.get('navigationState.aspectOptions.tokenTemplate') || '');
    if (stringifiedTokenTemplate) {
      try {
        const tokenTemplate = JSON.parse(stringifiedTokenTemplate);
        // Create a real (but unsaved) record to provide token-related computed properties
        const token = this.get('store').createRecord('token', tokenTemplate);
        this.set('tokenTemplate', token);
      } catch (error) {
        console.error('Incorrect token template passed via aspect options:', error);
      }
    }
  },

  actions: {
    templateSelected() {

    },
    submit(rawToken) {
      const createTokenAction = this.get('tokenActions')
        .createCreateTokenAction({ rawToken });

      return createTokenAction.execute();
    },
  },
});
