/**
 * Default content for single space - overview of space aspects
 *
 * @module components/content-spaces-index
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { get, computed, set } from '@ember/object';
import { reads, gt } from '@ember/object/computed';
import { reject } from 'rsvp';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';
import { promise } from 'ember-awesome-macros';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import ChooseDefaultOneprovider from 'onezone-gui/mixins/choose-default-oneprovider';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

export default Component.extend(
  I18n,
  GlobalActions,
  ProvidersColors,
  ChooseDefaultOneprovider, {
    classNames: ['content-spaces-index'],

    globalNotify: service(),
    router: service(),
    guiUtils: service(),
    i18n: service(),
    apiSamplesActions: service(),

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
     * @type {boolean}
     */
    showResourceMembershipTile: true,

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    spaceId: reads('space.entityId'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isSupported: gt('space.providerList.list.length', 0),

    /**
     * @type {Ember.ComputedProperty<PromiseArray<models/Provider>>}
     */
    providersProxy: reads('space.providerList.list'),

    /**
     * @type {Ember.ComputedProperty <boolean>}
     */
    hasAddSupportPrivilege: reads('space.privileges.addSupport'),

    /**
     * @type {Ember.ComputedProperty<string|null>}
     */
    noAddSupportPrivilegeTooltipText: computed('hasAddSupportPrivilege',
      function noAddSupportPrivilegeTooltipText() {
        const {
          i18n,
          hasAddSupportPrivilege,
        } = this.getProperties('i18n', 'hasAddSupportPrivilege');
        return !hasAddSupportPrivilege ? insufficientPrivilegesMessage({
          i18n,
          modelName: 'space',
          privilegeFlag: 'space_add_support',
        }) : null;
      }),

    /**
     * @type {ComputedProperty<Models.Provider>}
     */
    dataProviderProxy: promise.object(computed('space.providerList.list.[]',
      function dataProviderProxy() {
        return this.get('space.providerList')
          .then(providerList => get(providerList, 'list'))
          .then(providers => {
            return this.chooseDefaultOneprovider(providers);
          });
      }
    )),

    oneproviderHrefProxy: promise.object(
      computed(
        'dataProviderProxy.versionProxy.content',
        function oneproviderHrefProxy() {
          const {
            guiUtils,
            router,
            space,
            spaceId,
            dataProviderProxy,
          } = this.getProperties(
            'guiUtils',
            'router',
            'space',
            'spaceId',
            'dataProviderProxy'
          );
          return dataProviderProxy.then(dataProvider => {
            const oneproviderId = guiUtils.getRoutableIdFor(dataProvider);
            return get(dataProvider, 'versionProxy').then(version => {
              if (isStandaloneGuiOneprovider(version)) {
                return router.urlFor(
                  'provider-redirect',
                  oneproviderId, {
                    queryParams: { space_id: spaceId },
                  }
                );
              } else {
                return router.urlFor(
                  'onedata.sidebar.content.aspect',
                  'spaces',
                  guiUtils.getRoutableIdFor(space),
                  'data', {
                    queryParams: {
                      options: serializeAspectOptions({ oneproviderId }),
                    },
                  }
                );
              }
            });
          });
        }
      )
    ),

    /**
     * @type {Ember.ComputedProperty<Array<Action>>}
     */
    globalActions: computed('openApiSamplesModalAction', function globalActions() {
      return [this.openApiSamplesModalAction];
    }),

    /**
     * @type {Ember.ComputedProperty<AspectAction>}
     */
    openApiSamplesModalAction: computed(function openApiSamplesModalAction() {
      return this.apiSamplesActions.createShowApiSamplesAction({
        record: this.space,
        apiSubject: 'space',
      });
    }),

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
