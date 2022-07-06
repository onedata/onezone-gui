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
import { conditional, raw, array } from 'ember-awesome-macros';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { next } from '@ember/runloop';

const possibleSlideIds = ['templates', 'form'];

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
   * @type {String}
   */
  lastSelectedTemplateName: 'custom',

  /**
   * @type {Object}
   */
  lastSelectedTemplate: Object.freeze({}),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  activeSlideFromUrl: reads('navigationState.aspectOptions.activeSlide'),

  /**
   * @type {ComputedProperty<String>}
   */
  activeSlide: conditional(
    array.includes(raw(possibleSlideIds), 'activeSlideFromUrl'),
    'activeSlideFromUrl',
    raw('templates')
  ),

  activeSlideObserver: observer('activeSlide', function activeSlideObserver() {
    const element = this.get('element');
    const scrollableParent = element && element.closest('.ps');
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
      atob(this.get('navigationState.aspectOptions.tokenTemplate') || '');
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
      });
      // `next` fixes scrool-top animation and double transition error, when token
      // template is given via url (see `init` and `loadTokenTemplateFromUrl`)
      next(() => {
        if (this.get('activeSlide') !== 'form') {
          this.get('navigationState').changeRouteAspectOptions({
            activeSlide: 'form',
          });
        }
      });
    }
  },

  actions: {
    templateSelected(templateName, template) {
      this.selectTemplate(templateName, template);
    },
    backToTemplates() {
      this.get('navigationState').changeRouteAspectOptions({
        activeSlide: 'templates',
        tokenTemplate: null,
      });
    },
    submit(rawToken) {
      const createTokenAction = this.get('tokenActions')
        .createCreateTokenAction({ rawToken });

      return createTokenAction.execute();
    },
  },
});
