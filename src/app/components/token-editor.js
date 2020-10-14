/**
 * Token creation form.
 *
 * @module components/token-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import EmberObject, { computed, get, getProperties, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { Promise, resolve } from 'rsvp';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import SiblingLoadingField from 'onedata-gui-common/utils/form-component/sibling-loading-field';
import PrivilegesField from 'onedata-gui-common/utils/form-component/privileges-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import {
  Tag as RecordTag,
  removeExcessiveTags,
} from 'onedata-gui-common/components/tags-input/model-selector-editor';
import { groupedFlags as groupFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { groupedFlags as spaceFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { groupedFlags as harvesterFlags } from 'onedata-gui-websocket-client/utils/harvester-privileges-flags';
import { groupedFlags as clusterFlags } from 'onedata-gui-websocket-client/utils/cluster-privileges-flags';
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
  bool,
  and,
  or,
  not,
  hash,
  array,
  getBy,
  promise,
  tag,
  isEmpty,
  notEmpty,
  notEqual,
  number,
} from 'ember-awesome-macros';
import moment from 'moment';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import computedT from 'onedata-gui-common/utils/computed-t';
import RecordOptionsArrayProxy from 'onedata-gui-common/utils/record-options-array-proxy';
import ArrayProxy from '@ember/array/proxy';
import recordIcon from 'onedata-gui-common/utils/record-icon';

const tokenInviteTypeOptions = [{
  value: 'userJoinGroup',
  icon: 'group',
  targetModelName: 'group',
}, {
  value: 'groupJoinGroup',
  icon: 'group',
  targetModelName: 'group',
}, {
  value: 'userJoinSpace',
  icon: 'space',
  targetModelName: 'space',
}, {
  value: 'groupJoinSpace',
  icon: 'space',
  targetModelName: 'space',
}, {
  value: 'harvesterJoinSpace',
  icon: 'space',
  targetModelName: 'space',
  noPrivileges: true,
}, {
  value: 'userJoinCluster',
  icon: 'cluster',
  targetModelName: 'cluster',
}, {
  value: 'groupJoinCluster',
  icon: 'cluster',
  targetModelName: 'cluster',
}, {
  value: 'userJoinHarvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
}, {
  value: 'groupJoinHarvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
}, {
  value: 'spaceJoinHarvester',
  icon: 'light-bulb',
  targetModelName: 'harvester',
  noPrivileges: true,
}, {
  value: 'supportSpace',
  icon: 'space',
  targetModelName: 'space',
  noPrivileges: true,
}, {
  value: 'registerOneprovider',
  icon: 'provider',
  noPrivileges: true,
}];

const privilegesForModels = {
  space: spaceFlags,
  group: groupFlags,
  harvester: harvesterFlags,
  cluster: clusterFlags,
};

const CaveatFormGroup = FormFieldsGroup.extend({
  /**
   * @type {any}
   */
  valueFromToken: undefined,

  /**
   * @type {Ember.Component}
   */
  component: undefined,

  /**
   * @type {Boolean}
   */
  isApplicable: true,

  classes: computed('isCaveatEnabled', function classes() {
    return 'caveat-group' + (this.get('isCaveatEnabled') ? ' is-enabled' : '');
  }),
  isVisible: or('isInEditMode', 'valueFromToken'),
  isCaveatEnabled: getBy(array.findBy('fields', raw('isGroupToggle')), raw('value')),
  isExpanded: and(
    or('isCaveatEnabled', 'component.areAllCaveatsExpanded'),
    'isApplicable'
  ),
});

const CaveatsSectionFormGroup = FormFieldsGroup.extend({
  hasExpandedCaveats: and(
    'isExpanded',
    array.isAny('fields', raw('isExpanded'), raw(true))
  ),
  hasTopSeparator: and(
    'hasExpandedCaveats',
    not(equal('name', 'parent.firstGroupWithExpandedCaveatName'))
  ),
  classes: conditional('hasTopSeparator', raw('has-top-separator'), raw('')),
});

const ModelTagsFieldPrototype = TagsField.extend({
  tagEditorComponentName: 'tags-input/model-selector-editor',
  sort: true,
  tagEditorSettings: hash('models'),
  valueToTags(value) {
    return (value || []).map(val => RecordTag.create({
      ownerSource: this,
      value: val,
    }));
  },
  tagsToValue(tags) {
    return removeExcessiveTags(tags).mapBy('value').uniq().compact();
  },
  sortTags(tags) {
    const modelsOrder = this.get('models').mapBy('name');
    const sortKeyDecoratedTags = tags.map(tag => {
      const isOnezone = get(tag, 'value.record.serviceType') === 'onezone';
      const modelIndex = modelsOrder.indexOf(get(tag, 'value.model'));
      const label = get(tag, 'label');
      const sortKey = `${isOnezone ? '0': '1'}-${modelIndex}-${label}`;
      return { sortKey, tag };
    });
    return sortKeyDecoratedTags.sortBy('sortKey').mapBy('tag');
  },
});

function createWhiteBlackListDropdown(fieldName) {
  return DropdownField.extend({
    defaultValue: or(
      'parent.valueFromToken.type',
      raw('whitelist')
    ),
  }).create({
    name: fieldName,
    areValidationClassesEnabled: false,
    options: [
      { value: 'whitelist' },
      { value: 'blacklist' },
    ],
    showSearch: false,
  });
}

export default Component.extend(I18n, {
  classNames: ['token-editor'],
  classNameBindings: ['modeClass'],

  i18n: service(),
  privilegeManager: service(),
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
   * @type {Object|undefined}
   */
  predefinedValues: undefined,

  /**
   * @virtual optional
   * @type {Models.Token}
   */
  token: Object.freeze({}),

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
   * @type {booleal}
   */
  areServiceCaveatWarningDetailsVisible: false,

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
    const {
      basicGroup,
      caveatsGroup,
    } = this.getProperties(
      'basicGroup',
      'caveatsGroup',
    );
    const component = this;

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
          basicGroup,
          caveatsGroup,
        ],
      });
  }),

  /**
   * All non-caveats fields
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  basicGroup: computed(function basicGroup() {
    const component = this;
    return FormFieldsGroup.create({
      name: 'basic',
      fields: [
        TextField.extend({
          component,
          defaultValue: or('component.tokenDataSource.name', raw(undefined)),
        }).create({ name: 'name' }),
        ToggleField.extend({
          component,
          isVisible: notEqual('component.mode', raw('create')),
          defaultValue: reads('component.tokenDataSource.revoked'),
        }).create({
          name: 'revoked',
        }),
        ClipboardField.extend({
          component,
          isVisible: reads('isInViewMode'),
          defaultValue: reads('component.tokenDataSource.tokenString'),
        }).create({
          name: 'tokenString',
          type: 'textarea',
        }),
        RadioField.extend({
          component,
          defaultValue: or(
            'component.tokenDataSource.type',
            raw('access')
          ),
        }).create({
          name: 'type',
          options: [
            { value: 'access' },
            { value: 'identity' },
            { value: 'invite' },
          ],
        }),
        FormFieldsGroup.extend({
          isExpanded: equal('parent.value.type', raw('invite')),
          inviteType: reads('value.inviteType'),
          inviteTypeSpec: computed(
            // Absolute path to value because "inviteType" path does not always recompute.
            // Probably an Ember bug
            'valuesSource.basic.inviteDetails.inviteType',
            function inviteTypeSpec() {
              return tokenInviteTypeOptions.findBy('value', this.get('inviteType'));
            }
          ),
          targetModelName: reads('inviteTypeSpec.targetModelName'),
        }).create({
          name: 'inviteDetails',
          fields: [
            DropdownField.extend({
              component,
              classes: conditional(
                'parent.targetModelName',
                raw('needs-target-model'),
                raw('')
              ),
              defaultValue: or(
                'component.tokenDataSource.inviteType',
                raw('userJoinGroup')
              ),
              options: conditional(
                'isInEditMode',
                raw(tokenInviteTypeOptions),
                raw(tokenInviteTypeOptions
                  .map(option => Object.assign({}, option, { icon: undefined }))
                )
              ),
            }).create({
              name: 'inviteType',
              showSearch: false,
            }),
            this.get('inviteTargetDetailsGroup'),
            this.get('usageLimitGroup'),
            this.get('usageCountField'),
          ],
        }),
      ],
    });
  }),

  /**
   * Fields group visible only when selected invite type has specified targetModelName
   * (invitation target). To not break down while collapsing after
   * invite type change to type without target, it performs caching of previous invite
   * type value to render it until collapsed. Does the same for invite types
   * with/without privileges.
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  inviteTargetDetailsGroup: computed(function inviteTargetDetailsGroup() {
    const component = this;
    return FormFieldsGroup.extend({
      component,
      initTokenTarget: reads('component.tokenDataSource.inviteTarget'),
      isExpanded: notEmpty('inviteTypeSpec.targetModelName'),
      inviteType: reads('parent.inviteType'),
      inviteTypeSpec: reads('parent.inviteTypeSpec'),
      // We need to cache values related to latest invite type with target
      // to preserve previous view while collapsing inviteTargetDetailsGroup
      // after change to invite type without target. Without caching, labels,
      // dropdown values etc. will disappear just after invite type change.
      latestInviteTypeWithTargets: undefined,
      cachedTargetsModelName: undefined,
      cachedTargetsProxy: PromiseObject.create({
        promise: new Promise(() => {}),
      }),
      // Caching for the same reason as for target related values
      cachedPrivilegesModelName: undefined,
      cachedPrivilegesPresetProxy: PromiseObject.create({
        promise: new Promise(() => {}),
      }),
      inviteTypeSpecObserver: observer(
        'inviteTypeSpec',
        'component.mode',
        'initTokenTarget',
        function inviteTypeSpecObserver() {
          this.inviteTypeSpecObserverFunc();
        }
      ),
      init() {
        this._super(...arguments);
        this.inviteTypeSpecObserver();
      },
      inviteTypeSpecObserverFunc() {
        const {
          inviteTypeSpec,
          initTokenTarget,
          cachedTargetsModelName,
          cachedPrivilegesModelName,
        } = this.getProperties(
          'inviteTypeSpec',
          'initTokenTarget',
          'cachedTargetsModelName',
          'cachedPrivilegesModelName'
        );
        if (!inviteTypeSpec) {
          return;
        }
        const newTargetsModelName = inviteTypeSpec.targetModelName;
        const newPrivilegesModelName = !inviteTypeSpec.noPrivileges &&
          newTargetsModelName;
        if (get(component, 'mode') === 'create') {
          if (newTargetsModelName) {
            this.set('latestInviteTypeWithTargets', inviteTypeSpec.value);
            if (cachedTargetsModelName !== newTargetsModelName) {
              this.setProperties({
                cachedTargetsModelName: newTargetsModelName,
                cachedTargetsProxy: component
                  .getRecordOptionsForModel(newTargetsModelName),
              });
            }
          }
          if (newPrivilegesModelName &&
            cachedPrivilegesModelName !== newPrivilegesModelName) {
            this.setProperties({
              cachedPrivilegesModelName: newPrivilegesModelName,
              cachedPrivilegesPresetProxy: component
                .getPrivilegesPresetForModel(newTargetsModelName),
            });
          }
        } else {
          if (newTargetsModelName) {
            this.setProperties({
              latestInviteTypeWithTargets: inviteTypeSpec.value,
              cachedTargetsModelName: newTargetsModelName,
              cachedTargetsProxy: PromiseArray.create({
                promise: resolve(initTokenTarget ? [component.recordToDropdownOption(
                  initTokenTarget)] : []),
              }),
              cachedPrivilegesModelName: newPrivilegesModelName,
              cachedPrivilegesPresetProxy: PromiseArray.create({ promise: resolve([]) }),
            });
          }
        }
      },
    }).create({
      name: 'inviteTargetDetails',
      fields: [
        SiblingLoadingField.extend({
          loadingProxy: reads('parent.cachedTargetsProxy'),
          addColonToLabel: false,
        }).create({
          siblingName: 'target',
          name: 'loadingTarget',
        }),
        this.get('targetField'),
        FormFieldsGroup.extend({
          isExpanded: not('parent.inviteTypeSpec.noPrivileges'),
        }).create({
          name: 'invitePrivilegesDetails',
          fields: [
            SiblingLoadingField.extend({
              loadingProxy: reads('parent.parent.cachedPrivilegesPresetProxy'),
            }).create({
              name: 'loadingPrivileges',
              siblingName: 'privileges',
            }),
            this.get('privilegesField'),
          ],
        }),
      ],
    });
  }),

  /**
   * Allows selecting target for invite token
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  targetField: computed(function targetField() {
    const component = this;
    return DropdownField.extend({
      component,
      cachedTargetsModelName: reads('parent.cachedTargetsModelName'),
      cachedTargetsProxy: reads('parent.cachedTargetsProxy'),
      latestInviteTypeWithTargets: reads('parent.latestInviteTypeWithTargets'),
      addColonToLabel: false,
      placeholder: computed(
        'latestInviteTypeWithTargets',
        'path',
        function placeholder() {
          const {
            latestInviteTypeWithTargets,
            path,
          } = this.getProperties('latestInviteTypeWithTargets', 'path');
          return latestInviteTypeWithTargets &&
            this.t(`${path}.placeholder.${latestInviteTypeWithTargets}`);
        }
      ),
      options: reads('cachedTargetsProxy.content'),
      cachedTargetsModelNameObserver: observer(
        'cachedTargetsModelName',
        function cachedTargetsModelNameObserver() {
          // Reset to default value when target model changes
          this.reset();
        }
      ),
      isVisible: reads('cachedTargetsProxy.isFulfilled'),
      defaultValue: conditional(
        or('isInViewMode', 'component.tokenDataSource.inviteTarget.entityId'),
        'component.tokenDataSource.inviteTarget',
        raw(undefined)
      ),
    }).create({
      name: 'target',
    });
  }),

  /**
   * Allows selecting privileges for invite token
   * @type {ComputedProperty<Utils.FormComponent.PrivilegesField>}
   */
  privilegesField: computed(function privilegesField() {
    const component = this;
    return PrivilegesField.extend({
      component,
      cachedPrivilegesModelName: or(
        'parent.parent.cachedPrivilegesModelName',
        raw('userJoinGroup')
      ),
      cachedPrivilegesPresetProxy: reads('parent.parent.cachedPrivilegesPresetProxy'),
      privilegesGroups: computed(
        'cachedPrivilegesModelName',
        function privilegesGroups() {
          return privilegesForModels[this.get('cachedPrivilegesModelName')];
        }
      ),
      privilegeGroupsTranslationsPath: computed(
        'cachedPrivilegesModelName',
        function privilegeGroupsTranslationsPath() {
          const modelName = _.upperFirst(this.get('cachedPrivilegesModelName'));
          return modelName ?
            `components.content${modelName}sMembers.privilegeGroups` :
            undefined;
        }
      ),
      privilegesTranslationsPath: computed(
        'cachedPrivilegesModelName',
        function privilegesTranslationsPath() {
          const modelName = _.upperFirst(this.get('cachedPrivilegesModelName'));
          return modelName ?
            `components.content${modelName}sMembers.privileges` :
            undefined;
        }
      ),
      isVisible: reads('cachedPrivilegesPresetProxy.isFulfilled'),
      defaultValue: or(
        'component.tokenDataSource.privileges',
        'cachedPrivilegesPresetProxy.content',
        raw([])
      ),
      cachedPrivilegesPresetProxyObserver: observer(
        'cachedPrivilegesPresetProxy.isFulfilled',
        function cachedPrivilegesPresetProxyObserver() {
          if (
            this.get('cachedPrivilegesPresetProxy.isFulfilled') &&
            this.get('isInEditMode')
          ) {
            safeExec(this.get('component'), () => this.reset());
          }
        }
      ),
    }).create({
      classes: 'wrap-on-desktop',
      name: 'privileges',
    });
  }),

  /**
   * Allows choosing "infinity" and concrete number
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  usageLimitGroup: computed(function usageLimitGroup() {
    const component = this;
    return FormFieldsGroup.extend({
      isVisible: reads('isInEditMode'),
    }).create({
      name: 'usageLimit',
      fields: [
        RadioField.extend({
          component,
          defaultValue: conditional(
            equal(
              number('component.tokenDataSource.usageLimit'),
              'component.tokenDataSource.usageLimit'
            ),
            raw('number'),
            raw('infinity')
          ),
        }).create({
          name: 'usageLimitType',
          options: [{
            value: 'infinity',
          }, {
            value: 'number',
          }],
        }),
        NumberField.extend({
          component,
          isEnabled: equal('parent.value.usageLimitType', raw('number')),
          defaultValue: conditional(
            equal(
              number('component.tokenDataSource.usageLimit'),
              'component.tokenDataSource.usageLimit'
            ),
            'component.tokenDataSource.usageLimit',
            raw('')
          ),
        }).create({
          name: 'usageLimitNumber',
          gte: 1,
          integer: true,
        }),
      ],
    });
  }),

  /**
   * Shows information [usageCount]/[usageLimit]
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  usageCountField: computed(function usageCountGroup() {
    const component = this;
    return StaticTextField.extend({
      component,
      usageCount: reads('component.tokenDataSource.usageCount'),
      usageLimit: reads('component.tokenDataSource.usageLimit'),
      text: tag `${'usageCount'} / ${'usageLimit'}`,
      isVisible: reads('isInViewMode'),
    }).create({ name: 'usageCount' });
  }),

  /**
   * Aggregates all caveat-related form elements
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  caveatsGroup: computed(function caveatsGroup() {
    const {
      timeCaveatsGroup,
      geoCaveatsGroup,
      networkCaveatsGroup,
      endpointCaveatsGroup,
      dataAccessCaveatsGroup,
    } = this.getProperties(
      'timeCaveatsGroup',
      'geoCaveatsGroup',
      'networkCaveatsGroup',
      'endpointCaveatsGroup',
      'dataAccessCaveatsGroup',
    );

    return FormFieldsGroup.extend({
      firstGroupWithExpandedCaveatName: getBy(
        array.findBy('fields', raw('hasExpandedCaveats'), raw(true)),
        raw('name')
      ),
    }).create({
      name: 'caveats',
      fields: [
        timeCaveatsGroup,
        geoCaveatsGroup,
        networkCaveatsGroup,
        endpointCaveatsGroup,
        dataAccessCaveatsGroup,
      ],
    });
  }),

  /**
   * Aggregates all "time caveat"-related form elements
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  timeCaveatsGroup: computed(function timeCaveatsGroup() {
    return CaveatsSectionFormGroup.create({
      name: 'timeCaveats',
      fields: [this.get('expireCaveatGroup')],
    });
  }),

  /**
   * Aggregates all "geo caveat"-related form elements
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  geoCaveatsGroup: computed(function geoCaveatsGroup() {
    const {
      regionCaveatGroup,
      countryCaveatGroup,
    } = this.getProperties(
      'regionCaveatGroup',
      'countryCaveatGroup',
    );

    return CaveatsSectionFormGroup.create({
      name: 'geoCaveats',
      fields: [
        regionCaveatGroup,
        countryCaveatGroup,
      ],
    });
  }),

  /**
   * Aggregates all "network caveat"-related form elements
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  networkCaveatsGroup: computed(function networkCaveatsGroup() {
    const {
      asnCaveatGroup,
      ipCaveatGroup,
    } = this.getProperties(
      'asnCaveatGroup',
      'ipCaveatGroup',
    );

    return CaveatsSectionFormGroup.create({
      name: 'networkCaveats',
      fields: [
        asnCaveatGroup,
        ipCaveatGroup,
      ],
    });
  }),

  /**
   * Aggregates all "endpoint caveat"-related form elements
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  endpointCaveatsGroup: computed(function endpointCaveatsGroup() {
    const {
      consumerCaveatGroup,
      serviceCaveatGroup,
      interfaceCaveatGroup,
    } = this.getProperties(
      'consumerCaveatGroup',
      'serviceCaveatGroup',
      'interfaceCaveatGroup',
    );

    return CaveatsSectionFormGroup.create({
      name: 'endpointCaveats',
      fields: [
        consumerCaveatGroup,
        serviceCaveatGroup,
        interfaceCaveatGroup,
      ],
    });
  }),

  /**
   * Aggregates all "data access caveat"-related form elements
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  dataAccessCaveatsGroup: computed(function dataAccessCaveatsGroup() {
    const {
      readonlyCaveatGroup,
      pathCaveatGroup,
      objectIdCaveatGroup,
    } = this.getProperties(
      'readonlyCaveatGroup',
      'pathCaveatGroup',
      'objectIdCaveatGroup',
    );

    return CaveatsSectionFormGroup.extend({
      isExpanded: equal('valuesSource.basic.type', raw('access')),
    }).create({
      name: 'dataAccessCaveats',
      fields: [
        readonlyCaveatGroup,
        pathCaveatGroup,
        objectIdCaveatGroup,
      ],
    });
  }),

  /**
   * Time caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  expireCaveatGroup: computed(function expireCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.expire'),
    }).create(generateCaveatFormGroupBody('expire', [
      DatetimeField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: or(
          'parent.valueFromToken',
          raw(moment().add(1, 'day').endOf('day').toDate())
        ),
      }).create({
        name: 'expire',
      }),
    ]));
  }),

  /**
   * Region caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  regionCaveatGroup: computed(function regionCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.region'),
    }).create(generateCaveatFormGroupBody('region', [
      FormFieldsGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        valueFromToken: reads('parent.valueFromToken'),
      }).create({
        name: 'region',
        areValidationClassesEnabled: true,
        fields: [
          createWhiteBlackListDropdown('regionType'),
          TagsField.extend({
            classes: conditional(
              equal('parent.value.regionType', raw('whitelist')),
              raw('tags-success'),
              raw('tags-danger'),
            ),
            allowedTags: computed(
              'i18nPrefix',
              'path',
              function allowedTags() {
                const path = this.get('path');
                return [
                  'Africa',
                  'Antarctica',
                  'Asia',
                  'Europe',
                  'EU',
                  'NorthAmerica',
                  'Oceania',
                  'SouthAmerica',
                ].map(abbrev => ({
                  label: String(this.t(`${path}.tags.${abbrev}`)),
                  value: abbrev,
                }));
              }
            ),
            tagEditorSettings: hash('allowedTags'),
            defaultValue: or(
              'parent.valueFromToken.list',
              raw([])
            ),
            valueToTags(value) {
              const allowedTags = this.get('allowedTags');
              return (value || [])
                .map(val => allowedTags.findBy('value', val))
                .compact();
            },
            tagsToValue(tags) {
              return tags.mapBy('value');
            },
          }).create({
            name: 'regionList',
            tagEditorComponentName: 'tags-input/selector-editor',
            sort: true,
          }),
        ],
      }),
    ]));
  }),

  /**
   * Country caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  countryCaveatGroup: computed(function countryCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.country'),
    }).create(generateCaveatFormGroupBody('country', [
      FormFieldsGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        valueFromToken: reads('parent.valueFromToken'),
      }).create({
        name: 'country',
        areValidationClassesEnabled: true,
        fields: [
          createWhiteBlackListDropdown('countryType'),
          TagsField.extend({
            defaultValue: or(
              'parent.valueFromToken.list',
              raw([])
            ),
            classes: conditional(
              equal('parent.value.countryType', raw('whitelist')),
              raw('tags-success'),
              raw('tags-danger'),
            ),
            tagEditorSettings: computed('path', function tagEditorSettings() {
              return {
                // Only ASCII letters are allowed. See ISO 3166-1 Alpha-2 codes documentation
                regexp: /^[a-zA-Z]{2}$/,
                transform: label => label.toUpperCase(),
                placeholder: this.t(`${this.get('path')}.editorPlaceholder`),
              };
            }),
            sortTags(tags) {
              return tags.sort((a, b) =>
                get(a, 'label').localeCompare(get(b, 'label'))
              );
            },
            valueToTags(value) {
              if (value && get(value, 'length')) {
                value = value.map(v => v.toUpperCase());
              }
              return this._super(value);
            },
          }).create({
            name: 'countryList',
            sort: true,
          }),
        ],
      }),
    ]));
  }),

  /**
   * ASN caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  asnCaveatGroup: computed(function asnCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.asn'),
    }).create(generateCaveatFormGroupBody('asn', [
      TagsField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: or(
          'parent.valueFromToken',
          raw([])
        ),
        sortTags(tags) {
          return tags.sort((a, b) =>
            parseInt(get(a, 'label') - parseInt(get(b, 'label')))
          );
        },
        tagsToValue(tags) {
          return tags
            .mapBy('label')
            .map(asnString => parseInt(asnString))
            .uniq();
        },
        valueToTags(value) {
          return (value || []).map(asn => ({ label: String(asn) }));
        },
      }).create({
        name: 'asn',
        tagEditorSettings: {
          regexp: /^\d+$/,
        },
        sort: true,
      }),
    ]));
  }),

  /**
   * IP caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  ipCaveatGroup: computed(function ipCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.ip'),
    }).create(generateCaveatFormGroupBody('ip', [
      TagsField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: or(
          'parent.valueFromToken',
          raw([])
        ),
        sortTags(tags) {
          const ipPartsMatcher = /^(\d+)\.(\d+)\.(\d+)\.(\d+)(\/(\d+))?$/;
          const sortKeyDecoratedTags = tags.map(tag => {
            const parsedIp = get(tag, 'label').match(ipPartsMatcher);
            // sortKey for "192.168.0.1/24" is 192168000001024
            const sortKey = parsedIp
              // Four IP octets (1,2,3,4) and mask (6)
              .slice(1, 5).concat([parsedIp[6] || '0'])
              .map(numberStr => _.padStart(numberStr, 3, '0'))
              .join();
            return { sortKey, tag };
          });
          return sortKeyDecoratedTags.sortBy('sortKey').mapBy('tag');
        },
      }).create({
        name: 'ip',
        tagEditorSettings: {
          // IP address with an optional mask (format: 1.1.1.1 or 1.1.1.1/2)
          regexp: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
        },
        sort: true,
      }),
    ]));
  }),

  /**
   * Consumer caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  consumerCaveatGroup: computed(function consumerCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.consumer'),
    }).create(generateCaveatFormGroupBody('consumer', [
      ModelTagsFieldPrototype.extend({
        recordManager: service(),
        userManager: service(),
        groupManager: service(),
        isVisible: reads('parent.isCaveatEnabled'),
        usersProxy: computed(function usersProxy() {
          return this.get('userManager').getAllKnownUsers();
        }),
        groupsProxy: computed(function groupsProxy() {
          return this.get('groupManager').getAllKnownGroups();
        }),
        oneprovidersProxy: promise.array(computed(function oneprovidersProxy() {
          return this.get('recordManager').getUserRecordList('provider')
            .then(providers => get(providers, 'list'));
        })),
        models: computed(function models() {
          return [{
            name: 'user',
            getRecords: () => this.get('usersProxy'),
          }, {
            name: 'group',
            getRecords: () => this.get('groupsProxy'),
          }, {
            name: 'provider',
            getRecords: () => this.get('oneprovidersProxy'),
          }];
        }),
        defaultValue: or(
          'parent.valueFromToken',
          raw([])
        ),
      }).create({ name: 'consumer' }),
    ]));
  }),

  /**
   * Service caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  serviceCaveatGroup: computed(function serviceCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      isApplicable: equal('valuesSource.basic.type', raw('access')),
      valueFromToken: reads('component.tokenDataSource.caveats.service'),
    }).create(generateCaveatFormGroupBody('service', [
      ModelTagsFieldPrototype.extend({
        recordManager: service(),
        isVisible: reads('parent.isCaveatEnabled'),
        servicesProxy: promise.array(computed(function servicesProxy() {
          return component.getServices();
        })),
        clustersProxy: promise.array(computed(function clustersProxy() {
          return this.get('recordManager').getUserRecordList('cluster')
            .then(clusters => get(clusters, 'list'));
        })),
        models: computed(function models() {
          return [{
            name: 'service',
            getRecords: () => this.get('servicesProxy'),
          }, {
            name: 'serviceOnepanel',
            getRecords: () => this.get('clustersProxy'),
          }];
        }),
        defaultValue: or(
          'parent.valueFromToken',
          raw([]),
        ),
      }).create({ name: 'service' }),
    ]));
  }),

  /**
   * Interface caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  interfaceCaveatGroup: computed(function interfaceCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      isApplicable: not(equal('valuesSource.basic.type', raw('invite'))),
      valueFromToken: reads('component.tokenDataSource.caveats.interface'),
    }).create(generateCaveatFormGroupBody('interface', [
      RadioField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: or(
          'parent.valueFromToken',
          raw('rest'),
        ),
      }).create({
        name: 'interface',
        options: [
          { value: 'rest' },
          { value: 'oneclient' },
        ],
      }),
    ]));
  }),

  /**
   * Readonly caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  readonlyCaveatGroup: computed(function readonlyCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.readonly'),
    }).create(generateCaveatFormGroupBody('readonly', [
      StaticTextField.extend({
        isVisible: and('parent.isCaveatEnabled', 'isInEditMode'),
      }).create({ name: 'readonlyEnabledText' }),
      ToggleField.extend({
        isVisible: reads('isInViewMode'),
        defaultValue: or(
          'parent.valueFromToken',
          raw(false),
        ),
      }).create({
        name: 'readonlyView',
      }),
    ]));
  }),

  /**
   * Path caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  pathCaveatGroup: computed(function pathCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.path'),
      spacesProxyIsForMode: undefined,
      spacesProxy: undefined,
      spacesProxySetter: observer(
        'isCaveatEnabled',
        'isInViewMode',
        'valueFromToken',
        function spacesProxySetter() {
          const {
            isCaveatEnabled,
            isInViewMode,
            valueFromToken,
            spacesProxy,
            spacesProxyIsForMode,
          } = this.getProperties(
            'isCaveatEnabled',
            'isInViewMode',
            'valueFromToken',
            'spacesProxy',
            'spacesProxyIsForMode'
          );
          if (isCaveatEnabled) {
            if (isInViewMode) {
              this.setProperties({
                spacesProxy: PromiseArray.create({
                  promise: resolve(Object.keys(valueFromToken).without('__fieldsValueNames')
                    .map(key => {
                      const record = get(valueFromToken, `${key}.pathSpace`);
                      return {
                        value: record,
                        label: get(record, 'name') || `ID: ${get(record, 'entityId')}`,
                        icon: recordIcon(record),
                      };
                    })),
                }),
                spacesProxyIsForMode: 'view',
              });
            } else if (!spacesProxy || spacesProxyIsForMode === 'view') {
              this.setProperties({
                spacesProxy: component.getRecordOptionsForModel('space'),
                spacesProxyIsForMode: 'edit',
              });
            }
          }
        }
      ),
      init() {
        this._super(...arguments);
        this.spacesProxySetter();
      },
    }).create(generateCaveatFormGroupBody('path', [
      SiblingLoadingField.extend({
        loadingProxy: reads('parent.spacesProxy'),
        isVisible: and('parent.isCaveatEnabled', not('isFulfilled')),
        addColonToLabel: false,
      }).create({
        name: 'loadingPathSpaces',
        siblingName: 'path',
      }),
      FormFieldsCollectionGroup.extend({
        isVisible: and(
          'parent.isCaveatEnabled',
          'parent.spacesProxy.isFulfilled'
        ),
        defaultValue: or(
          'parent.valueFromToken',
          raw(undefined)
        ),
        spaces: reads('parent.spacesProxy.content'),
        fieldFactoryMethod(uniqueFieldValueName) {
          const nestedFieldMode = this.get('mode') !== 'view' ? 'edit' : 'view';
          return FormFieldsGroup.create({
            name: 'pathEntry',
            valueName: uniqueFieldValueName,
            areValidationClassesEnabled: true,
            fields: [
              DropdownField.extend({
                options: reads('parent.parent.spaces'),
                defaultValue: reads('options.firstObject.value'),
              }).create({
                name: 'pathSpace',
                areValidationClassesEnabled: false,
                mode: nestedFieldMode,
              }),
              TextField.create({
                name: 'pathString',
                defaultValue: '',
                isOptional: true,
                regex: /^(\/[^/]+)*\/?$/,
                mode: nestedFieldMode,
              }),
            ],
          });
        },
        dumpDefaultValue() {
          return this.get('defaultValue') || this._super(...arguments);
        },
      }).create({
        name: 'path',
      }),
    ]));
  }),

  /**
   * ObjectId caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  objectIdCaveatGroup: computed(function objectIdCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      valueFromToken: reads('component.tokenDataSource.caveats.objectId'),
    }).create(generateCaveatFormGroupBody('objectId', [
      FormFieldsCollectionGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: or(
          'parent.valueFromToken',
          raw(undefined)
        ),
        fieldFactoryMethod(uniqueFieldValueName) {
          return TextField.create({
            name: 'objectIdEntry',
            valueName: uniqueFieldValueName,
            mode: this.get('mode') !== 'view' ? 'edit' : 'view',
          });
        },
        dumpDefaultValue() {
          return this.get('defaultValue') || this._super(...arguments);
        },
      }).create({
        name: 'objectId',
      }),
    ]));
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasExpandedCaveats: array.isAny('caveatsGroup.fields', raw('hasExpandedCaveats')),

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
  isServiceCaveatWarningVisible: and(
    // type: access token
    equal('basicGroup.value.type', raw('access')),
    // service caveat is disabled or is enabled and empty, or is enabled with
    // Onezone service selected
    or(
      not('serviceCaveatGroup.value.serviceEnabled'),
      isEmpty('serviceCaveatGroup.value.service'),
      array.find(
        'serviceCaveatGroup.value.service',
        option => get(option, 'record.serviceType') === 'onezone'
      )
    ),
    // interface caveat is disabled or enabled with selection != oneclient
    or(
      not('interfaceCaveatGroup.value.interfaceEnabled'),
      notEqual('interfaceCaveatGroup.value.interface', raw('oneclient'))
    ),
    // readonly caveat is disabled
    not('readonlyCaveatGroup.value.readonlyEnabled'),
    // path caveat is disabled or enabled with no entries
    or(
      not('pathCaveatGroup.value.pathEnabled'),
      isEmpty('pathCaveatGroup.value.path.__fieldsValueNames')
    ),
    // objectid caveat is disabled or enabled with no entries
    or(
      not('objectIdCaveatGroup.value.objectIdEnabled'),
      isEmpty('objectIdCaveatGroup.value.objectId.__fieldsValueNames')
    )
  ),

  modeObserver: observer('mode', function modeObserver() {
    const {
      fields,
      mode,
    } = this.getProperties('fields', 'mode');

    if (['view', 'edit'].includes(mode)) {
      fields.changeMode('view');
      fields.reset();
    }
    if (mode === 'edit') {
      [
        fields.getFieldByPath('basic.name'),
        fields.getFieldByPath('basic.revoked'),
      ].forEach(field => field.changeMode('edit'));
    }
  }),

  tokenDataSourceObserver: observer(
    'tokenDataSource.content',
    function tokenDataSourceObserver() {
      const {
        fields,
        tokenDataSource,
        mode,
      } = this.getProperties('fields', 'tokenDataSource', 'mode');

      if (get(tokenDataSource, 'isFulfilled') && mode !== 'edit') {
        fields.reset();
      }
    }
  ),

  autoNameGenerator: observer(
    'mode',
    'fields.value.basic.{type,inviteDetails.inviteType,inviteDetails.inviteTargetDetails.target.name}',
    function autoNameGenerator() {
      const {
        mode,
        fields,
      } = this.getProperties('mode', 'fields');
      const nameField = fields.getFieldByPath('basic.name');
      if (mode !== 'create' || get(nameField, 'isModified')) {
        return;
      }

      const type = this.get('fields.value.basic.type');
      const inviteType = this.get('fields.value.basic.inviteDetails.inviteType');
      const inviteTargetName =
        this.get('fields.value.basic.inviteDetails.inviteTargetDetails.target.name');
      this.set(
        'fields.value.basic.name',
        generateTokenName(type, inviteType, inviteTargetName)
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.get('tokenDataSource').then(() => safeExec(this, () => {
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
   * @param {String} modelName 
   * @returns {PromiseArray<FieldOption>}
   */
  getRecordOptionsForModel(modelName) {
    return PromiseArray.create({
      promise: this.get('recordManager').getUserRecordList(modelName)
        .then(recordsList => get(recordsList, 'list'))
        .then(records => RecordOptionsArrayProxy.create({ records })),
    });
  },

  /**
   * @param {String} modelName one of user, space, group, provider, onezone, cluster
   * @param {String} entityId entityId or 'onezone' (only for cluster and onezone model)
   * @returns {Promise<GraphSingleModel>}
   */
  getRecord(modelName, entityId) {
    if (entityId === 'onezone') {
      if (modelName === 'onezone') {
        return resolve(this.get('onedataConnection.onezoneRecord'));
      } else if (modelName === 'cluster') {
        entityId = this.get('guiContext.clusterId');
      }
    }

    return this.get('recordManager').getRecordById(modelName, entityId);
  },

  /**
   * @returns {Promise<ArrayProxy>}
   */
  getServices() {
    const {
      recordManager,
      onedataConnection,
    } = this.getProperties('recordManager', 'onedataConnection');
    const onezoneRecord = get(onedataConnection, 'onezoneRecord');

    return recordManager.getUserRecordList('provider')
      .then(providerList => get(providerList, 'list'))
      .then(providers => {
        return ArrayProxy.extend({
          providers,
          content: array.sort(array.concat('providers', raw([onezoneRecord])), ['name']),
        }).create();
      });
  },

  /**
   * @param {String} modelName 
   * @returns {PromiseArray<String>}
   */
  getPrivilegesPresetForModel(modelName) {
    return PromiseArray.create({
      promise: this.get('privilegeManager')
        .getPrivilegesPresetForModel(modelName)
        .then(result => result['member']),
    });
  },

  recordToDropdownOption(record) {
    return EmberObject.extend({
      label: reads('value.name'),
    }).create({
      value: record,
      icon: recordIcon(record),
    });
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

function createCaveatToggleField(caveatName) {
  return ToggleField.extend({
    classes: 'caveat-group-toggle',
    addColonToLabel: reads('isInViewMode'),
    defaultValue: bool('parent.valueFromToken'),
    isGroupToggle: true,
  }).create({ name: `${caveatName}Enabled` });
}

function createDisabledCaveatDescription(caveatName) {
  return StaticTextField.extend({
    isVisible: not('parent.isCaveatEnabled'),
  }).create({
    name: `${caveatName}DisabledText`,
  });
}

function generateCaveatFormGroupBody(
  caveatName,
  caveatFields
) {
  return {
    name: `${caveatName}Caveat`,
    fields: [
      createCaveatToggleField(caveatName),
      ...caveatFields,
      createDisabledCaveatDescription(caveatName),
    ],
  };
}
