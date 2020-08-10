/**
 * Harvester configuration section responsible for managing indices connected
 * to gui plugin.
 *
 * @module components/harvester-configuration/gui-indices
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import EmberObject, { get, set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import Messages from 'ember-cp-validations/validators/messages';
import { hash, Promise, reject } from 'rsvp';
import { A } from '@ember/array';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

function catchPromiseError(promise, model) {
  return promise.then(result => ({
    success: true,
    result,
    model,
  })).catch(error => ({
    success: false,
    error,
    model,
  }));
}

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-gui-indices'],

  i18n: service(),
  harvesterManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin.guiIndices',

  /**
   * @virtual
   * @type {string}
   */
  mode: 'view',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @virtual
   * @type {utils.harvesterConfiguration.GuiPluginManifest}
   */
  manifestProxy: undefined,

  /**
   * @type {boolean}
   */
  isSaving: false,

  /**
   * @type {EmberObject}
   * Contains form values of `assign method` dropdown inputs in mapping:
   * guiPluginIndexName -> method (one of 'create', 'reuse', 'unassigned)
   */
  selectedAssignMethods: Object.freeze({}),

  /**
   * @type {EmberObject}
   * Contains form values of `reuse index` dropdown inputs in mapping:
   * guiPluginIndexName -> harvester index
   */
  selectedIndices: Object.freeze({}),

  /**
   * @type {EmberObject}
   * Contains form values of `create index` text inputs in mapping:
   * guiPluginIndexName -> name of new index
   */
  createIndicesNames: Object.freeze({}),

  /**
   * @type {EmberObject}
   * Contains errors related to indices assignment inputs in mapping:
   * guiPluginIndexName -> error
   */
  guiIndicesErrors: Object.freeze({}),

  /**
   * @type {Array<string>}
   */
  assignIndexMethods: Object.freeze([
    'create',
    'reuse',
    'unassigned',
  ]),

  /**
   * @type {Ember.ComputedProperty<Ember.A>}
   */
  expandedIndices: computed(function expandedIndices() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<ember-cp-validations.validators.Messages>}
   */
  validationMessages: computed(function validationMessages() {
    return Messages.create();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  guiPluginIndices: reads('manifestProxy.indices'),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Model.Index>>}
   */
  harvesterIndicesProxy: computed(
    'harvester.hasViewPrivilege',
    function harvesterIndices() {
      const harvester = this.get('harvester');
      return PromiseArray.create({
        promise: get(harvester, 'hasViewPrivilege') !== false ?
          get(harvester, 'indexList').then(list => list ? get(list, 'list') : A()) :
        reject({ id: 'forbidden' }),
      });
    }
  ),

  /**
   * Contains mapping: guiPluginIndexName (from manifest) -> index (from harvester)
   * @type {Ember.ComputedProperty<Object>}
   */
  indicesMapping: computed(
    'guiPluginIndices.@each.name',
    'harvesterIndicesProxy.content.@each.guiPluginName',
    function indicesMapping() {
      const {
        guiPluginIndices,
        harvesterIndicesProxy,
      } = this.getProperties('guiPluginIndices', 'harvesterIndicesProxy');
      if (get(harvesterIndicesProxy, 'isFulfilled') &&
        get(guiPluginIndices, 'length') > 0) {
        return guiPluginIndices.reduce((mapping, index) => {
          const name = get(index, 'name');
          set(mapping, name, harvesterIndicesProxy.findBy('guiPluginName', name));
          return mapping;
        }, {});
      } else {
        return {};
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isValid: computed('guiIndicesErrors', 'guiPluginIndices', function isValid() {
    const {
      guiIndicesErrors,
      guiPluginIndices,
    } = this.getProperties('guiIndicesErrors', 'guiPluginIndices');
    let valid = true;
    guiPluginIndices.forEach(guiIndex => {
      const guiIndexName = get(guiIndex, 'name');
      valid = valid && !get(guiIndicesErrors, guiIndexName);
    });
    return valid;
  }),

  guiPluginIndicesObserver: observer(
    'guiPluginIndices',
    function guiPluginIndicesObserver() {
      this.setProperties({
        selectedAssignMethods: this.generateDataObjectForGuiIndices(() =>
          'create'),
        selectedIndices: this.generateDataObjectForGuiIndices(() => undefined),
        createIndicesNames: this.generateDataObjectForGuiIndices(name => name),
        guiIndicesErrors: this.generateDataObjectForGuiIndices(() => undefined),
      });
    }
  ),

  harvesterIndicesObserver: observer('harvesterIndicesProxy.[]', function () {
    const {
      harvesterIndicesProxy,
      guiPluginIndices,
      selectedIndices,
    } = this.getProperties(
      'harvesterIndicesProxy',
      'selectedIndices',
      'guiPluginIndices'
    );
    guiPluginIndices.forEach(guiIndex => {
      const guiIndexName = get(guiIndex, 'name');
      const selectedIndex = get(selectedIndices, guiIndexName);
      if (selectedIndex && !harvesterIndicesProxy.includes(selectedIndex)) {
        set(selectedIndices, guiIndexName, undefined);
      }
    });
  }),

  modeObserver: observer('mode', function modeObserver() {
    if (this.get('mode') === 'edit') {
      const {
        guiPluginIndices,
        selectedAssignMethods,
        selectedIndices,
        indicesMapping,
      } = this.getProperties(
        'selectedIndices',
        'selectedAssignMethods',
        'guiPluginIndices',
        'indicesMapping'
      );
      guiPluginIndices.forEach(guiIndex => {
        const guiIndexName = get(guiIndex, 'name');
        const assignedIndex = get(indicesMapping, guiIndexName);
        if (assignedIndex) {
          set(selectedAssignMethods, guiIndexName, 'reuse');
          set(selectedIndices, guiIndexName, assignedIndex);
        }
      });
      this.validateGuiIndices();
    }
  }),

  init() {
    this._super(...arguments);
    this.guiPluginIndicesObserver();
    this.get('harvesterIndicesProxy').then(() => {
      this.modeObserver();
    });
  },

  /**
   * Creates and object with keys corresponding to gui plugin indices names
   * and values created using passed initialValueFactory function
   * @param {Function} initialValueFactory
   * @returns {EmberObject}
   */
  generateDataObjectForGuiIndices(initialValueFactory) {
    const guiPluginIndices = this.get('guiPluginIndices');
    const objectBody = guiPluginIndices.reduce((obj, index) => {
      if (index) {
        const name = get(index, 'name');
        if (typeof name === 'string') {
          set(obj, name, initialValueFactory(name));
        }
      }
      return obj;
    }, {});
    return EmberObject.create(objectBody);
  },

  getErrorMessage(type, customMessage = false) {
    if (customMessage) {
      return this.t(`validationErrors.${type}`);
    } else {
      const messages = this.get('validationMessages');
      return messages.getMessageFor(type, {
        description: get(messages, 'defaultDescription'),
      });
    }
  },

  validateGuiIndices() {
    const {
      guiPluginIndices,
      selectedAssignMethods,
      selectedIndices,
      createIndicesNames,
      harvesterIndicesProxy,
    } = this.getProperties(
      'guiPluginIndices',
      'selectedAssignMethods',
      'selectedIndices',
      'createIndicesNames',
      'harvesterIndicesProxy'
    );

    const errors = this.generateDataObjectForGuiIndices(() => undefined);
    const existingNames = harvesterIndicesProxy.mapBy('name');
    const createNames = [];
    const alreadySelected = [];
    guiPluginIndices.forEach(guiIndex => {
      const guiIndexName = get(guiIndex, 'name');
      switch (get(selectedAssignMethods, guiIndexName)) {
        case 'create': {
          createNames.push(get(createIndicesNames, guiIndexName).trim());
          break;
        }
        case 'reuse': {
          alreadySelected.push(get(selectedIndices, guiIndexName));
          break;
        }
      }
    });

    guiPluginIndices.forEach(guiIndex => {
      const guiIndexName = get(guiIndex, 'name');
      const assignMethod = get(selectedAssignMethods, guiIndexName);
      let value;
      switch (assignMethod) {
        case 'create': {
          value = get(createIndicesNames, guiIndexName).trim();
          if (existingNames.includes(value)) {
            set(
              errors,
              guiIndexName,
              this.getErrorMessage('nameUsedByExistingIndex', true)
            );
            return;
          } else if (createNames.indexOf(value) !== createNames.lastIndexOf(value)) {
            set(
              errors,
              guiIndexName,
              this.getErrorMessage('nameUsedToCreateAnotherIndex', true)
            );
            return;
          }
          break;
        }
        case 'reuse': {
          value = get(selectedIndices, guiIndexName);
          if (alreadySelected.indexOf(value) !==
            alreadySelected.lastIndexOf(value)) {
            set(
              errors,
              guiIndexName,
              this.getErrorMessage('isAlreadyAssigned', true)
            );
            return;
          }
          break;
        }
        case 'unassigned':
          // whatever value that will pass "emptiness" test
          value = true;
          break;
      }
      if (!value) {
        set(errors, guiIndexName, this.getErrorMessage('blank'));
        return;
      }
    });

    this.set('guiIndicesErrors', errors);
    return errors;
  },

  /**
   * @returns {Object} object in format:
   * ```
   * {
   *   indicesToCreate,
       indicesToUpdate,
   * }
   * ```
   * where each property is an array of indices (possibly empty)
   */
  getIndicesToSave() {
    const {
      guiPluginIndices,
      selectedAssignMethods,
      selectedIndices,
      createIndicesNames,
      harvesterIndicesProxy,
    } = this.getProperties(
      'guiPluginIndices',
      'selectedAssignMethods',
      'selectedIndices',
      'createIndicesNames',
      'harvesterIndicesProxy'
    );
    const indicesToCreate = A();
    const indicesToUpdate = A();
    guiPluginIndices.forEach(guiIndex => {
      const guiIndexName = get(guiIndex, 'name');
      const assignMethod = get(selectedAssignMethods, guiIndexName);
      switch (assignMethod) {
        case 'create': {
          indicesToCreate.pushObject(Object.assign({}, guiIndex, {
            name: get(createIndicesNames, guiIndexName),
            guiPluginName: guiIndexName,
          }));
        }
        // fallthrough to remove old assign to harvester index, which could be
        // used for gui index we have just created 
        /* fallthrough */
        case 'unassigned':
          harvesterIndicesProxy.forEach(index => {
            if (get(index, 'guiPluginName') === guiIndexName) {
              set(index, 'guiPluginName', null);
              indicesToUpdate.addObject(index);
            }
          });
          break;
        case 'reuse': {
          const selectedIndex = get(selectedIndices, guiIndexName);
          harvesterIndicesProxy.without(selectedIndex).forEach(index => {
            if (get(index, 'guiPluginName') === guiIndexName) {
              set(index, 'guiPluginName', null);
              indicesToUpdate.addObject(index);
            }
          });
          if (get(selectedIndex, 'guiPluginName') !== guiIndexName) {
            set(selectedIndex, 'guiPluginName', guiIndexName);
            indicesToUpdate.addObject(selectedIndex);
          }
          break;
        }
      }
    });
    return {
      indicesToCreate,
      indicesToUpdate,
    };
  },

  actions: {
    edit() {
      this.set('mode', 'edit');
    },
    cancel() {
      this.set('mode', 'view');
    },
    save() {
      const {
        harvester,
        harvesterManager,
        selectedAssignMethods,
        selectedIndices,
        globalNotify,
      } = this.getProperties(
        'harvester',
        'harvesterManager',
        'selectedAssignMethods',
        'selectedIndices',
        'globalNotify'
      );
      this.set('isSaving', true);
      const {
        indicesToCreate,
        indicesToUpdate,
      } = this.getIndicesToSave();
      const harvesterEntityId = get(harvester, 'entityId');
      const createPromises = Promise.all(indicesToCreate.map(index =>
        catchPromiseError(harvesterManager.createIndex(
          harvesterEntityId,
          index,
          false
        ), index)
      ));
      const updatePromises = Promise.all(indicesToUpdate.map(index =>
        catchPromiseError(index.save(), index)
      ));
      return hash({
        createPromises,
        updatePromises,
      }).then(({ createPromises, updatePromises }) => {
        let listReloadError;
        return harvesterManager.reloadIndexList(harvesterEntityId)
          .catch(error => listReloadError = error)
          .then(() => {
            const createErrors = createPromises.filterBy('success', false);
            const updateErrors = updatePromises.filterBy('success', false);
            const errorsToShow = [];
            if (listReloadError) {
              errorsToShow.push({
                error: this.t('listReloadError'),
                details: listReloadError,
              });
            }
            createErrors.forEach(error => {
              errorsToShow.push({
                error: this.t('createError'),
                indexName: get(error, 'model.name'),
                details: get(error, 'error'),
              });
            });
            updateErrors.forEach(error => {
              errorsToShow.push({
                error: this.t('updateError'),
                indexName: get(error, 'model.name'),
                details: get(error, 'error'),
              });
            });
            updateErrors.forEach(({ model }) => model.rollbackAttributes());
            safeExec(this, () => {
              if (get(createErrors, 'length') + get(updateErrors, 'length') ===
                0) {
                this.set('mode', 'view');
              } else {
                const indicesMapping = this.get('indicesMapping');
                indicesToCreate.forEach(({ guiPluginName }) => {
                  const createError = createErrors
                    .find(er => get(er, 'model.guiPluginName') ===
                      guiPluginName);
                  if (!createError) {
                    set(selectedAssignMethods, guiPluginName, 'reuse');
                    set(selectedIndices, guiPluginName, get(
                      indicesMapping, guiPluginName));
                  }
                });
              }
              this.set('isSaving', false);
            });
            if (get(errorsToShow, 'length')) {
              globalNotify.backendError(this.t('indicesUpdating'), errorsToShow);
            } else {
              globalNotify.success(this.t('indicesUpdateSuccess'));
            }
          });
      });
    },
    changeAssignMethod(guiIndexName, assignMethod) {
      this.set(`selectedAssignMethods.${guiIndexName}`, assignMethod);
      this.validateGuiIndices();
    },
    changeAssignValue(guiIndexName, value) {
      if (this.get(`selectedAssignMethods.${guiIndexName}`) === 'create') {
        this.set(`createIndicesNames.${guiIndexName}`, value);
      } else {
        this.set(`selectedIndices.${guiIndexName}`, value);
      }
      this.validateGuiIndices();
    },
    indicesRowHeaderClick(index) {
      const expandedIndices = this.get('expandedIndices');
      if (expandedIndices.includes(index)) {
        expandedIndices.removeObject(index);
      } else {
        expandedIndices.addObject(index);
      }
    },
  },
});
