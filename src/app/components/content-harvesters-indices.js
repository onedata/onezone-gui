/**
 * A component that shows harvester indices
 *
 * @module components/content-harvesters-indices
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { computed, observer, get, getProperties, set } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { Promise, reject } from 'rsvp';
import Messages from 'ember-cp-validations/validators/messages';
import { A } from '@ember/array';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  I18n,
  GlobalActions,
  createDataProxyMixin('guiPluginIndicesNames', { type: 'array' }),
  createDataProxyMixin('indices', { type: 'array' }), {
    classNames: ['content-harvesters-indices'],

    harvesterActions: service(),
    harvesterManager: service(),
    i18n: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentHarvestersIndices',

    /**
     * @virtual
     * @type {Model.Harvester}
     */
    harvester: undefined,

    /**
     * @type {boolean}
     */
    isCreating: false,

    /**
     * @type {Ember.ComputedProperty<EmberObject>}
     */
    createIndexData: undefined,

    /**
     * @type {Models.Index}
     */
    indexToRemove: null,

    /**
     * @type {boolean}
     */
    isRemovingIndex: false,

    /**
     * @type {boolean}
     */
    isCreateIndexFormVisible: false,

    /**
     * @type {EmberObject}
     * Now only `name` field is validated
     */
    createIndexFormErrors: undefined,

    /**
     * @type {EmberObject}
     */
    createIndexFormChangedFields: undefined,

    /**
     * @type {boolean}
     */
    isCreateIndexFormValid: false,

    /**
     * @type {Ember.ComputedProperty<EmberObject>}
     */
    validationMessages: computed(function validationMessages() {
      return Messages.create();
    }),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    newIndexNameInputId: computed('elementId', function newIndexNameInputId() {
      return this.get('elementId') + '-new-index-name';
    }),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    newIndexSchemaInputId: computed('elementId', function newIndexSchemaInputId() {
      return this.get('elementId') + '-new-index-schema';
    }),

    /**
     * @type {Ember.ComputedProperty<PromiseArray>}
     */
    dataProxy: computed(
      'guiPluginIndicesNamesProxy',
      'indicesProxy',
      function dataProxy() {
        const {
          guiPluginIndicesNamesProxy,
          indicesProxy,
        } = this.getProperties('guiPluginIndicesNamesProxy', 'indicesProxy');
        return PromiseArray.create({
          promise: Promise.all([
            guiPluginIndicesNamesProxy,
            indicesProxy,
          ]),
        });
      }
    ),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    createAction: computed('isCreateIndexFormVisible', function createAction() {
      return {
        action: () => this.set('isCreateIndexFormVisible', true),
        title: this.t('create'),
        class: 'create-index',
        icon: 'add-filled',
        disabled: this.get('isCreateIndexFormVisible'),
      };
    }),

    /**
     * @type {Ember.ComputedProperty<Array<Action>>}
     */
    globalActions: collect('createAction'),

    /**
     * @override 
     * @type {Ember.ComputedProperty<string>}
     */
    globalActionsTitle: computed(function globalActionsTitle() {
      return this.t('harvesterIndices');
    }),
    
    isCreateIndexFormVisibleObserver: observer(
      'isCreateIndexFormVisible',
      function isCreateIndexFormVisibleObserver() {
      if (this.get('isCreateIndexFormVisible')) {
        this.resetCreateIndexForm();
      }
    }),

    indicesProxyObserver: observer(
      'indicesProxy.length',
      function indicesProxyObserver() {
        const {
          indicesProxy,
          isCreateIndexFormVisible,
        } = this.getProperties('indicesProxy', 'isCreateIndexFormVisible');
        const {
          isFulfilled,
          length,
        } = getProperties(indicesProxy, 'isFulfilled', 'length');
        if (isFulfilled && !length && !isCreateIndexFormVisible) {
          this.set('isCreateIndexFormVisible', true);
        }
      }
    ),

    init() {
      this._super(...arguments);
      this.resetCreateIndexForm();
    },

    /**
     * @returns {Promise}
     */
    fetchGuiPluginIndicesNames() {
      const {
        harvesterManager,
        harvester,
      } = this.getProperties('harvesterManager', 'harvester');
      const guiPluginManifest =
        harvesterManager.getGuiPluginManifest(get(harvester, 'id'));
      return guiPluginManifest
        .then(() => get(guiPluginManifest, 'indices').mapBy('name'))
        .catch(() => []);
    },

    /**
     * @returns {Promise}
     */
    fetchIndices() {
      const harvester = this.get('harvester');
      return get(harvester, 'hasViewPrivilege') !== false ?
        get(harvester, 'indexList').then(list => list ? get(list, 'list') : A()) :
        reject({ id: 'forbidden' });
    },

    /**
     * @returns {undefined}
     */
    resetCreateIndexForm() {
      this.setProperties({
        createIndexData: EmberObject.create({
          name: '',
          schema: '',
        }),
        createIndexFormErrors: EmberObject.create(),
        createIndexFormChangedFields: EmberObject.create(),
      });
      this.validateCreateIndexForm();
    },

    /**
     * @returns {undefined}
     */
    validateCreateIndexForm() {
      const {
        createIndexData,
        createIndexFormErrors,
        createIndexFormChangedFields,
        validationMessages,
      } = this.getProperties(
        'createIndexData',
        'createIndexFormErrors',
        'createIndexFormChangedFields',
        'validationMessages'
      );
      let nameError = null;
      const name = get(createIndexData, 'name');
      if (!name) {
        nameError = validationMessages.getMessageFor('blank', {
          description: get(validationMessages, 'defaultDescription'),
        });
      }
      if (get(createIndexFormChangedFields, 'name')) {
        set(createIndexFormErrors, 'name', nameError);
      }
      this.set('isCreateIndexFormValid', !nameError);
    },

    actions: {
      changeNewIndexValue(fieldName, value) {
        this.set(`createIndexData.${fieldName}`, value);
        this.set(`createIndexFormChangedFields.${fieldName}`, true);
        this.validateCreateIndexForm();
      },
      focusOutNewIndexField(fieldName) {
        this.set(`createIndexFormChangedFields.${fieldName}`, true);
        this.validateCreateIndexForm();
      },
      createIndex() {
        const {
          harvesterActions,
          harvester,
          createIndexData,
        } = this.getProperties(
          'harvesterActions',
          'harvester',
          'createIndexData'
        );
        const indexRepresentation = getProperties(createIndexData, 'name', 'schema');
        set(indexRepresentation, 'guiPluginName', null);
        if (get(indexRepresentation, 'schema') === '') {
          delete indexRepresentation.schema;
        }
        return harvesterActions.createIndex(harvester, indexRepresentation)
          .then(() => safeExec(this, () => {
            this.set('isCreateIndexFormVisible', false);
          }));
      },
      removeIndex(removeData) {
        const {
          harvesterActions,
          indexToRemove,
        } = this.getProperties('harvesterActions', 'indexToRemove');
        this.set('isRemovingIndex', true);
        return harvesterActions.removeIndex(indexToRemove, removeData)
          .finally(() =>
            safeExec(this, 'setProperties', {
              isRemovingIndex: false,
              indexToRemove: null,
            })
          );
      },
    },
  }
);
