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

export default Component.extend(I18n, GlobalActions, {
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
  validationMassages: computed(function validationMassages() {
    return Messages.create();
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<string>>}
   */
  guiPluginIndicesNamesProxy: computed(
    'harvester',
    function guiPluginIndicesNamesProxy() {
      const {
        harvesterManager,
        harvester,
      } = this.getProperties('harvesterManager', 'harvester');
      const guiPluginManifest =
        harvesterManager.getGuiPluginManifest(get(harvester, 'id'));
      return PromiseArray.create({
        promise: guiPluginManifest
          .then(() => get(guiPluginManifest, 'indices').mapBy('name'))
          .catch(() => []),
      });
    }
  ),

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
   * @type {Ember.ComputedProperty<PromiseArray<Model.Index>>}
   */
  indicesProxy: computed('harvester.hasViewPrivilege', function spacesProxy() {
    const harvester = this.get('harvester');
    return PromiseArray.create({
      promise: get(harvester, 'hasViewPrivilege') !== false ?
        get(harvester, 'indexList').then(list => list ? get(list, 'list') : A()) :
        reject({ id: 'forbidden' }),
    });
  }),

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
    const isCreateIndexFormVisible = this.get('isCreateIndexFormVisible');
    if (isCreateIndexFormVisible) {
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
      indicesProxy.forEach(idx => idx.getIndexProgress());
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
      validationMassages,
    } = this.getProperties(
      'createIndexData',
      'createIndexFormErrors',
      'createIndexFormChangedFields',
      'validationMassages'
    );
    let nameError = null;
    const name = get(createIndexData, 'name');
    if (!name) {
      nameError = validationMassages.getMessageFor('blank', {
        description: get(validationMassages, 'defaultDescription'),
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
      if (get(indexRepresentation, 'schema') === '') {
        delete indexRepresentation.schema;
      }
      set(indexRepresentation, 'guiPluginName', '');
      return harvesterActions.createIndex(harvester, indexRepresentation)
        .then(() => safeExec(this, () => {
          this.set('isCreateIndexFormVisible', false);
        }));
    },
    removeIndex() {
      const {
        harvesterActions,
        indexToRemove,
      } = this.getProperties('harvesterActions', 'indexToRemove');
      this.set('isRemovingIndex', true);
      return harvesterActions.removeIndex(indexToRemove)
        .finally(() =>
          safeExec(this, 'setProperties', {
            isRemovingIndex: false,
            indexToRemove: null,
          })
        );
    },
  },
});
