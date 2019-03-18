import Component from '@ember/component';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import EmberObject, { get, set, computed, observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
// import { Promise } from 'rsvp';
import Messages from 'ember-cp-validations/validators/messages';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-gui-plugin'],

  i18n: service(),
  harvesterManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin',

  /**
   * @virtual
   * @type {string}
   */
  mode: 'edit',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @type {PromiseObject}
   */
  manifestProxy: undefined,

  validationMassages: computed(function validationMassages() {
    return Messages.create();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  guiPluginIndices: computed(
    'manifestProxy.isFulfilled',
    function guiPluginIndices() {
      const indices = this.get('manifestProxy.onedata.indices');
      if (Array.isArray(indices)) {
        return indices.filter(index =>
          index && typeof get(index, 'name') === 'string'
        );
      } else {
        return [];
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Model.Index>>}
   */
  harvesterIndicesProxy: computed('harvester', function harvesterIndices() {
    // FIXME use backend
    return PromiseArray.create({
      promise: get(this.get('harvester'), 'indexList')
        .then(indexList => get(indexList, 'list')),
    });
    // return PromiseArray.create({
    //   promise: Promise.resolve([{
    //     id: '1',
    //     name: 'study1',
    //     guiIndex: 'study',
    //   }, {
    //     id: '1',
    //     name: 'do1',
    //     guiIndex: 'dta_object',
    //   }]),
    // });
  }),

  indicesMapping: computed(
    'guiPluginIndices.@each.name',
    'harvesterIndicesProxy.content.@each.guiIndex',
    function indicesMapping() {
      const {
        guiPluginIndices,
        harvesterIndicesProxy,
      } = this.getProperties('guiPluginIndices', 'harvesterIndicesProxy');
      if (get(harvesterIndicesProxy, 'isFulfilled') &&
        get(guiPluginIndices, 'length') > 0) {
        return guiPluginIndices.reduce((mapping, index) => {
          const name = get(index, 'name');
          set(mapping, name, harvesterIndicesProxy.findBy('guiIndex', name));
          return mapping;
        }, {});
      } else {
        return {};
      }
    }
  ),

  /**
   * @type {Array<string>}
   */
  assignIndexMethods: Object.freeze([
    'create',
    'choose',
    'unassigned',
  ]),

  guiPluginIndicesObsever: observer(
    'guiPluginIndices',
    function guiPluginIndicesObsever() {
      this.setProperties({
        selectedAssignMethods: this.generateDataObjectForGuiIndices(() => 'create'),
        selectedIndices: this.generateDataObjectForGuiIndices(() => undefined),
        createIndicesNames: this.generateDataObjectForGuiIndices(name => name),
        guiIndicesErrors: this.generateDataObjectForGuiIndices(() => undefined),
      });
    }
  ),

  /**
   * @type {EmberObject}
   */
  selectedAssignMethods: undefined,

  /**
   * @type {EmberObject}
   */
  selectedIndices: undefined,

  /**
   * @type {EmberObject}
   */
  createIndicesNames: undefined,

  /**
   * @type {EmberObject}
   */
  guiIndicesErrors: undefined,

  init() {
    this._super(...arguments);
    this.loadManifest();
    this.guiPluginIndicesObsever();
  },

  generateDataObjectForGuiIndices(intialValue) {
    const guiPluginIndices = this.get('guiPluginIndices');
    const objectBody = guiPluginIndices.reduce((obj, index) => {
      if (index) {
        const name = get(index, 'name');
        if (typeof name === 'string') {
          set(obj, name, intialValue(name));
        }
      }
      return obj;
    }, {});
    return EmberObject.create(objectBody);
  },

  /**
   * @returns {PromiseObject}
   */
  loadManifest() {
    const {
      harvesterManager,
      harvester,
    } = this.getProperties('harvesterManager', 'harvester');
    const proxy = PromiseObject.create({
      promise: harvesterManager.getGuiPluginManifest(get(harvester, 'id'))
        .catch(error => {
          if (get(error, 'status') === 404) {
            return null;
          } else {
            throw error;
          }
        }),
    });
    this.set('manifestProxy', proxy);
    return proxy;
  },

  getErrorMessage(type, customMessage = false) {
    const messages = this.get('validationMassages');
    if (customMessage) {
      return this.t(`validationErrors.${type}`);
    } else {
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
        case 'choose': {
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
        case 'choose': {
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
    console.log(errors);
    return errors;
  },

  actions: {
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
  },
});
