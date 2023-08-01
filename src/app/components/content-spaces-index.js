/**
 * Default content for single space - overview of space aspects
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, { get, computed, set, getProperties, observer } from '@ember/object';
import { reads, gt } from '@ember/object/computed';
import { reject } from 'rsvp';
import ProvidersColors from 'onedata-gui-common/mixins/components/providers-colors';
import { promise } from 'ember-awesome-macros';
import isStandaloneGuiOneprovider from 'onedata-gui-common/utils/is-standalone-gui-oneprovider';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import ChooseDefaultOneprovider from 'onezone-gui/mixins/choose-default-oneprovider';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import _ from 'lodash';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import globals from 'onedata-gui-common/utils/globals';

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
    spaceManager: service(),

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
     * @type {SpaceMarketplaceTileDisplayModel}
     */
    spaceMarketplaceTileDisplayModel: undefined,

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
            return this.chooseDefaultOneprovider({ providers });
          });
      }
    )),

    oneproviderHrefProxy: promise.object(
      computed(
        'dataProviderProxy.version',
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
            const version = get(dataProvider, 'version');
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
    openApiSamplesModalAction: computed('space', function openApiSamplesModalAction() {
      return this.apiSamplesActions.createShowApiSamplesAction({
        record: this.space,
        apiSubject: 'space',
      });
    }),

    isDetailsTileShown: computed(
      'space.privileges.{view,update}',
      'space.{organizationName,description,tags}',
      function isDetailsTileShown() {
        const {
          organizationName,
          description,
          tags,
          privileges,
        } = getProperties(
          this.space,
          'organizationName',
          'description',
          'tags',
          'privileges',
        );
        const hasAnyDetail = Boolean(organizationName) ||
          Boolean(description) ||
          !_.isEmpty(tags);
        return privileges.view && (
          hasAnyDetail || privileges.update
        );
      }
    ),

    isMarketplaceTileShown: reads('spaceMarketplaceTileDisplayModel.isTileShown'),

    init() {
      this._super(...arguments);
      this.set(
        'spaceMarketplaceTileDisplayModel',
        SpaceMarketplaceTileDisplayModel.extend({
          space: reads('ownerSource.space'),
        }).create({
          ownerSource: this,
        })
      );
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
      saveSpaceName(name) {
        const space = this.get('space');
        if (!name || !name.length) {
          return reject();
        }
        set(space, 'name', name);
        return this._saveSpace();
      },
      dismissMarketplaceTile() {
        this.spaceMarketplaceTileDisplayModel.dismiss();
      },
    },
  }
);

const SpaceMarketplaceTileDisplayModel = EmberObject.extend(OwnerInjector, {
  spaceManager: service(),

  /**
   * @type {Models.Space}
   */
  space: undefined,

  //#region configuration

  dismissedPersistenceKey: 'spaceMarketplaceTile.dismissedSpaces',

  //#endregion

  //#region state

  isDismissed: false,

  //#endregion

  spaceId: reads('space.entityId'),

  isTileShown: computed(
    'isDismissed',
    'space.privileges.{view,update}',
    'space.advertisedInMarketplace',
    'spaceManager.marketplaceConfig.enabled',
    function isTileShown() {
      const {
        advertisedInMarketplace,
        privileges,
      } = getProperties(
        this.space,
        'advertisedInMarketplace',
        'privileges',
      );
      return this.spaceManager.marketplaceConfig.enabled && privileges.view &&
        (advertisedInMarketplace || privileges.update && !this.isDismissed);
    }
  ),

  spaceObserver: observer('space', function spaceObserver() {
    this.loadIsDismissed();
  }),

  init() {
    this._super(...arguments);
    this.spaceObserver();
  },

  dismiss() {
    this.set('isDismissed', true);
    this.saveIsDismissed();
  },

  loadIsDismissed() {
    this.set('isDismissed', this.readDismissedListValue());
  },

  saveIsDismissed() {
    globals.localStorage.setItem(
      this.dismissedPersistenceKey,
      this.createDismissedListValue()
    );
  },

  /**
   * Basing on current localStorage state of dismiss for spaces, create new stringified
   * array with state of the current space. This string can be saved into localStorage.
   * @returns {string}
   */
  createDismissedListValue() {
    const currentSpacesIds = this.readDismissedSpacesArray();
    return _.uniq([...currentSpacesIds, this.spaceId]).join(',');
  },

  /**
   * Get boolean value from localStorage if tile is dismissed for the current space.
   * @returns {boolean}
   */
  readDismissedListValue() {
    try {
      const spacesIds = this.readDismissedSpacesArray();
      return spacesIds.includes(this.spaceId);
    } catch {
      return false;
    }
  },

  readDismissedSpacesArray() {
    const raw = globals.localStorage.getItem(this.dismissedPersistenceKey);
    return raw ? raw.split(',') : [];
  },
});
