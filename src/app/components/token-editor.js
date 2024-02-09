/**
 * Token creation form.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import EmberObject, {
  computed,
  get,
  set,
  getProperties,
  observer,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { resolve } from 'rsvp';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import {
  creatorDataToToken,
  editorDataToDiffObject,
  tokenToEditorDefaultData,
  generateTokenName,
} from 'onezone-gui/utils/token-editor-utils';
import {
  conditional,
  equal,
  raw,
  and,
  or,
  not,
  array,
  promise,
  tag,
  isEmpty,
  notEqual,
} from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import computedT from 'onedata-gui-common/utils/computed-t';
import { BasicGroup } from 'onezone-gui/utils/token-editor/fields/basic-group';
import { CaveatsGroup } from 'onezone-gui/utils/token-editor/fields/caveats-group';
import { cloneFormValue } from 'onedata-gui-common/utils/form-component/values-container';

export default Component.extend(I18n, {
  classNames: ['token-editor'],
  classNameBindings: ['modeClass'],

  i18n: service(),
  guiContext: service(),
  recordManager: service(),
  onedataConnection: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tokenEditor',

  /**
   * One of: create, view, edit
   * @virtual
   * @type {String}
   */
  mode: 'create',

  /**
   * @virtual optional
   * @type {Models.Token}
   */
  token: undefined,

  /**
   * @type {Function}
   * @param {EmberObject} formValues
   * @param {boolean} isValid
   * @returns {any}
   */
  onChange: notImplementedIgnore,

  /**
   * @type {Function}
   * @param {Object} tokenRawModel
   * @returns {Promise}
   */
  onSubmit: notImplementedReject,

  /**
   * @type {Function}
   * @returns {any}
   */
  onCancel: notImplementedIgnore,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {Boolean}
   */
  areAllCaveatsExpanded: false,

  /**
   * @type {boolean}
   */
  areServiceCaveatWarningDetailsVisible: false,

  /**
   * @type {boolean}
   */
  areDataAccessCaveatWarningDetailsVisible: false,

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `${'mode'}-mode`,

  /**
   * @type {ComputedProperty<PromiseObject<EmberObject>>}
   */
  tokenDataSource: promise.object(computed(
    'token.{name,revoked}',
    function tokenDataSource() {
      return tokenToEditorDefaultData(this.get('token'), this.getRecord.bind(this));
    }
  )),

  /**
   * @type {ComputedProperty<boolean>}
   */
  disableCaveatsCollapse: notEqual('mode', raw('create')),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;

    const formContext = EmberObject.extend({
      editorMode: reads('component.mode'),
      loadedToken: reads('component.token'),
      areAllCaveatsExpanded: reads('component.areAllCaveatsExpanded'),
    }).create({ component });

    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
        ownerSource: reads('component'),
        isEnabled: not('component.isSubmitting'),
        onValueChange() {
          this._super(...arguments);
          scheduleOnce('afterRender', component, 'notifyAboutChange');
        },
      })
      .create({
        component,
        fields: [
          BasicGroup,
          CaveatsGroup,
        ].map((FieldClass) => FieldClass.create({ context: formContext })),
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  basicGroup: computed('fields', function fields() {
    return this.fields.getFieldByPath('basic');
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  caveatsGroup: computed('fields', function fields() {
    return this.fields.getFieldByPath('caveats');
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasVisibleCaveats: array.isAny('caveatsGroup.fields', raw('hasVisibleCaveats')),

  /**
   * @type {ComputedProperty<String>}
   */
  submitBtnText: conditional(
    equal('mode', raw('create')),
    computedT('createToken'),
    computedT('saveToken')
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasNoDataAccessCaveat: and(
    // interface caveat is disabled or enabled with selection != oneclient
    or(
      not('fields.valuesSource.caveats.endpointCaveats.interfaceCaveat.interfaceEnabled'),
      notEqual(
        'fields.valuesSource.caveats.endpointCaveats.interfaceCaveat.interface',
        raw('oneclient')
      )
    ),
    // readonly caveat is disabled
    not('fields.valuesSource.caveats.dataAccessCaveats.readonlyCaveat.readonlyEnabled'),
    // path caveat is disabled or enabled with no entries
    or(
      not('fields.valuesSource.caveats.dataAccessCaveats.pathCaveat.pathEnabled'),
      isEmpty(
        'fields.valuesSource.caveats.dataAccessCaveats.pathCaveat.path.__fieldsValueNames'
      )
    ),
    // objectid caveat is disabled or enabled with no entries
    or(
      not('fields.valuesSource.caveats.dataAccessCaveats.objectIdCaveat.objectIdEnabled'),
      isEmpty(
        'fields.valuesSource.caveats.dataAccessCaveats.objectIdCaveat.objectId.__fieldsValueNames'
      )
    )
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isServiceCaveatWarningVisible: and(
    // type: access token
    equal('fields.valuesSource.basic.type', raw('access')),
    // service caveat is disabled or is enabled and empty, or is enabled with
    // Onezone service selected
    or(
      not('fields.valuesSource.caveats.endpointCaveats,serviceCaveat.serviceEnabled'),
      isEmpty('fields.valuesSource.caveats.endpointCaveats.serviceCaveat.service'),
      array.find(
        'fields.valuesSource.caveats.endpointCaveats.serviceCaveat.service',
        option => get(option, 'record.serviceType') === 'onezone'
      )
    ),
    'hasNoDataAccessCaveat'
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isDataAccessCaveatWarningVisible: and(
    equal('fields.valuesSource.basic.type', raw('access')),
    not('hasNoDataAccessCaveat')
  ),

  modeObserver: observer('mode', function modeObserver() {
    if (['view', 'edit'].includes(this.mode)) {
      this.fields.changeMode('view');
    } else {
      this.fields.changeMode('edit');
    }

    if (this.mode === 'edit') {
      [
        this.fields.getFieldByPath('basic.name'),
        this.fields.getFieldByPath('basic.revoked'),
      ].forEach(field => field.changeMode('edit'));
    }
  }),

  tokenDataSourceObserver: observer(
    'tokenDataSource.content',
    'mode',
    function tokenDataSourceObserver() {
      if (
        this.tokenDataSource.content && (
          this.mode !== 'edit' ||
          this.fields.valuesSource?.basic?.tokenString !==
          this.tokenDataSource.content.basic.tokenString
        )
      ) {
        set(this.fields, 'valuesSource', cloneFormValue(this.tokenDataSource.content));
        this.fields.markAsNotModified();
      }
    }
  ),

  autoNameGenerator: observer(
    'mode',
    'fields.valuesSource.basic.{type,inviteDetails.inviteType,inviteDetails.inviteTargetDetails.target.name}',
    function autoNameGenerator() {
      const nameField = this.fields.getFieldByPath('basic.name');
      const nameFromData = this.get('tokenDataSource.basic.name');
      if (this.mode !== 'create' || nameFromData || get(nameField, 'isModified')) {
        return;
      }

      const type = this.get('fields.valuesSource.basic.type');
      const inviteType = this.get('fields.valuesSource.basic.inviteDetails.inviteType');
      const inviteTargetName =
        this.get('fields.valuesSource.basic.inviteDetails.inviteTargetDetails.target.name');
      this.set(
        'fields.valuesSource.basic.name',
        generateTokenName(type, inviteType, inviteTargetName)
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.get('tokenDataSource').then(() => safeExec(this, () => {
      this.tokenDataSourceObserver();
      this.modeObserver();
      this.autoNameGenerator();
    }));
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('fields').destroy();
  },

  notifyAboutChange() {
    safeExec(this, () => {
      const {
        fields,
        onChange,
      } = this.getProperties('fields', 'onChange');

      const {
        isValid,
        invalidFields,
      } = getProperties(fields, 'isValid', 'invalidFields');

      onChange({
        values: fields.dumpValue(),
        isValid,
        invalidFields: invalidFields.mapBy('valuePath'),
      });
    });
  },

  /**
   * @param {String} modelName one of user, space, group, provider, onezone, cluster
   * @param {String} entityId entityId or 'onezone' (only for cluster and onezone model)
   * @returns {Promise<GraphSingleModel>}
   */
  getRecord(modelName, entityId) {
    let normalizedEntityId = entityId;

    if (normalizedEntityId === 'onezone') {
      if (modelName === 'onezone') {
        return resolve(this.get('onedataConnection.onezoneRecord'));
      } else if (modelName === 'cluster') {
        normalizedEntityId = this.get('guiContext.clusterId');
      }
    }

    return this.recordManager.getRecordById(modelName, normalizedEntityId);
  },

  actions: {
    toggleCaveatsGroup() {
      this.toggleProperty('areAllCaveatsExpanded');
    },
    submit() {
      const {
        fields,
        onSubmit,
        recordManager,
        mode,
        token,
      } = this.getProperties('fields', 'onSubmit', 'recordManager', 'mode', 'token');

      if (get(fields, 'isValid')) {
        this.set('isSubmitting', true);
        let submitPromise;
        const formValues = fields.dumpValue();
        if (mode === 'create') {
          submitPromise = onSubmit(creatorDataToToken(
            formValues,
            recordManager.getCurrentUserRecord()
          ));
        } else {
          submitPromise = onSubmit(editorDataToDiffObject(formValues, token));
        }
        return submitPromise
          .finally(() => safeExec(this, () => this.set('isSubmitting', false)));
      }
    },
  },
});
