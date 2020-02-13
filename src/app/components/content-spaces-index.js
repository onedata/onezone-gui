/**
 * Default content for single space - overview of space aspects
 *
 * @module components/content-spaces-index
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { get, computed, set } from '@ember/object';
import { reads, gt } from '@ember/object/computed';
import { reject } from 'rsvp';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { next } from '@ember/runloop';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { collect } from 'ember-awesome-macros';

export default Component.extend(
  I18n,
  UserProxyMixin,
  GlobalActions,
  ProvidersColors, {
    classNames: ['content-spaces-index'],

    currentUser: service(),
    globalNotify: service(),
    spaceActions: service(),
    router: service(),
    guiUtils: service(),
    media: service(),
    i18n: service(),

    /**
     * @override 
     */
    i18nPrefix: 'components.contentSpacesIndex.',

    /**
     * @virtual
     * @type {models/Space}
     */
    space: undefined,

    /**
     * @type {string}
     */
    leaveSpaceModalTriggers: '',

    /**
     * @type {boolean}
     */
    showResourceMembershipTile: true,

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    globalActionsTitle: computed(function () {
      return this.t('space');
    }),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    spaceId: reads('space.entityId'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isSupported: gt('space.providerList.list.length', 0),

    /**
     * @type {Ember.ComputedProperty<AspectAction>}
     */
    openLeaveModalAction: computed(function () {
      return {
        action: () => {},
        title: this.t('leave'),
        class: 'btn-leave-space',
        buttonStyle: 'danger',
        icon: 'leave-space',
      };
    }),

    /**
     * @type {Ember.ComputedProperty<Array<AspectAction>>}
     */
    globalActions: collect('openLeaveModalAction'),

    /**
     * @type {Ember.ComputedProperty<PromiseArray<models/Provider>>}
     */
    providersProxy: reads('space.providerList.list'),

    /**
     * @type {Ember.ComputedProperty<Provider>}
     */
    dataProviderProxy: computed('space.providerList.list.[]',
      function dataProviderProxy() {
        const promise = this.get('space.providerList')
          .then(providerList =>
            get(providerList, 'list').then(list =>
              list.findBy('online')
            )
          );
        return PromiseObject.create({ promise });
      }),

    dataTileQueryParams: computed(
      'dataProviderProxy.content.entityId',
      function dataTileQueryParams() {
        const oneproviderId = this.get('dataProviderProxy.content.entityId');
        return {
          options: `oneproviderId.${oneproviderId}`,
        };
      }
    ),

    init() {
      this._super(...arguments);
      next(() => {
        this.set('leaveSpaceModalTriggers',
          '.btn-leave-space.btn;a.btn-leave-space:modal');
      });
    },

    /**
     * Shows global info about save error.
     * @param {object} error 
     * @returns {undefined}
     */
    _saveErrorHandler(error) {
      const globalNotify = this.get('globalNotify');
      globalNotify.backendError(this.t('saving'), error);
    },

    /**
     * Saves the space
     * @returns {Promise}
     */
    _saveSpace() {
      const space = this.get('space');
      return space.save().catch(error => {
        this._saveErrorHandler(error);
        throw error;
      });
    },

    actions: {
      leave() {
        return this.get('spaceActions').leaveSpace(this.get('space'));
      },
      saveSpaceName(name) {
        const space = this.get('space');
        if (!name || !name.length) {
          return reject();
        }
        set(space, 'name', name);
        return this._saveSpace();
      },
    },
  });
