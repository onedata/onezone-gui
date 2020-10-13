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
import { conditional, raw } from 'ember-awesome-macros';
import { observer } from '@ember/object';

export default Component.extend(I18n, {
  classNames: ['content-tokens-new'],

  tokenActions: service(),
  navigationState: service(),
  store: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew',

  /**
   * @type {Boolean}
   */
  hasSelectedTemplate: false,

  /**
   * @type {String}
   */
  lastSelectedTemplateName: undefined,

  /**
   * @type {Object}
   */
  lastSelectedTemplate: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  activeSlide: conditional(
    'hasSelectedTemplate',
    raw('form'),
    raw('templates')
  ),

  activeSlideObserver: observer('activeSlide', function activeSlideObserver() {
    const scrollableParent = this.$().parents('.ps')[0];
    if (scrollableParent) {
      scrollableParent.scroll({
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
        this.selectTemplate('custom', tokenTemplate);
      } catch (error) {
        console.error('Incorrect token template passed via aspect options:', error);
      }
    }
  },

  selectTemplate(templateName, template) {
    if (templateName && template) {
      this.setProperties({
        lastSelectedTemplateName: templateName,
        // Create a real (but unsaved) record to provide token-related computed properties
        lastSelectedTemplate: this.get('store').createRecord('token', template),
        hasSelectedTemplate: true,
      });
    }
  },

  actions: {
    templateSelected(templateName, template) {
      this.selectTemplate(templateName, template);
    },
    backToTemplates() {
      this.set('hasSelectedTemplate', false);
    },
    submit(rawToken) {
      const createTokenAction = this.get('tokenActions')
        .createCreateTokenAction({ rawToken });

      return createTokenAction.execute();
    },
  },
});
