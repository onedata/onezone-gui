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
import EmberObject, { computed, get, set, getProperties, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce, next } from '@ember/runloop';
import { Promise, all as allFulfilled, resolve } from 'rsvp';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
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
} from 'onezone-gui/utils/token-editor-utils';
import {
  conditional,
  equal,
  raw,
  and,
  or,
  not,
  hash,
  array,
  getBy,
  promise,
  tag,
  notEmpty,
  notEqual,
} from 'ember-awesome-macros';
import moment from 'moment';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import ArrayProxy from '@ember/array/proxy';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import computedT from 'onedata-gui-common/utils/computed-t';

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
  viewTokenValue: undefined,
  classes: computed('isCaveatEnabled', function classes() {
    return 'caveat-group' + (this.get('isCaveatEnabled') ? ' is-enabled' : '');
  }),
  isVisible: or('isInEditMode', 'viewTokenValue'),
  isCaveatEnabled: conditional(
    'isInEditMode',
    getBy(array.findBy('fields', raw('isGroupToggle')), raw('value')),
    notEmpty('viewTokenValue'),
  ),
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
      const modelIndex = modelsOrder.indexOf(get(tag, 'value.model'));
      const label = get(tag, 'label');
      const sortKey = `${modelIndex}-${label}`;
      return { sortKey, tag };
    });
    return sortKeyDecoratedTags.sortBy('sortKey').mapBy('tag');
  },
});

const RecordsOptionsArrayProxy = ArrayProxy.extend(OwnerInjector, {
  oneiconAlias: service(),
  records: undefined,
  sortedRecords: array.sort('records', ['name']),
  content: computed('sortedRecords.@each.name', function content() {
    const {
      sortedRecords,
      oneiconAlias,
    } = this.getProperties('sortedRecords', 'oneiconAlias');
    return sortedRecords.map(record => ({
      value: record,
      label: get(record, 'name'),
      icon: oneiconAlias.getName(get(record, 'entityType')),
    }));
  }),
});

function createWhiteBlackListDropdown(fieldName) {
  return DropdownField.extend({
    defaultValue: conditional(
      'isInEditMode',
      raw('whitelist'),
      'parent.viewTokenValue.type',
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
  userManager: service(),
  spaceManager: service(),
  groupManager: service(),
  harvesterManager: service(),
  providerManager: service(),
  clusterManager: service(),
  privilegeManager: service(),
  oneiconAlias: service(),
  currentUser: service(),
  guiContext: service(),

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
  token: undefined,

  /**
   * If true, then form will have expanded caveats at first render
   * @virtual optional
   * @type {boolean}
   */
  expandCaveats: false,

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
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `${'mode'}-mode`,

  /**
   * @type {ComputedProperty<EmberObject>}
   */
  tokenDataSource: computed(
    'token.{name,revoked,typeName,metadata,caveats}',
    function tokenDataSource() {
      return tokenToEditorDefaultData(this.get('token'), this.getRecord.bind(this));
    }
  ),

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
          defaultValue: conditional(
            'isInEditMode',
            raw('access'),
            'component.tokenDataSource.type'
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
          inviteTypeSpec: computed('inviteType', function inviteTypeSpec() {
            return tokenInviteTypeOptions.findBy('value', this.get('inviteType'));
          }),
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
              defaultValue: conditional(
                'isInEditMode',
                raw('userJoinGroup'),
                'component.tokenDataSource.inviteType'
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
      viewTokenTargetProxy: reads('component.tokenDataSource.inviteTargetProxy'),
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
        'isInEditMode',
        'viewTokenTargetProxy',
        function inviteTypeSpecObserver() {
          scheduleOnce('afterRender', this, 'inviteTypeSpecObserverFunc');
        }
      ),
      init() {
        this._super(...arguments);
        this.inviteTypeSpecObserver();
      },
      inviteTypeSpecObserverFunc() {
        const {
          inviteTypeSpec,
          viewTokenTargetProxy,
          isInEditMode,
          cachedTargetsModelName,
          cachedPrivilegesModelName,
        } = this.getProperties(
          'inviteTypeSpec',
          'viewTokenTargetProxy',
          'isInEditMode',
          'cachedTargetsModelName',
          'cachedPrivilegesModelName'
        );
        if (!inviteTypeSpec) {
          return;
        }
        const newTargetsModelName = inviteTypeSpec.targetModelName;
        const newPrivilegesModelName = !inviteTypeSpec.noPrivileges &&
          newTargetsModelName;
        if (isInEditMode) {
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
                promise: viewTokenTargetProxy ? viewTokenTargetProxy.then(record => {
                  return record ? [component.recordToDropdownOption(record)] : [];
                }) : resolve([]),
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
      defaultValue: or('component.tokenDataSource.inviteTargetProxy.content'),
      defaultValueObserver: observer(
        'defaultValue',
        'mode',
        function defaultValueObserver() {
          if (this.get('mode') === 'view') {
            this.reset();
          }
        }
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
      defaultValue: conditional(
        'isInEditMode',
        or('cachedPrivilegesPresetProxy.content', raw([])),
        'component.tokenDataSource.privileges',
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
      name: 'privileges',
    });
  }),

  /**
   * Allows choosing "infinity" and concrete number
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  usageLimitGroup: computed(function usageLimitGroup() {
    return FormFieldsGroup.extend({
      isVisible: reads('isInEditMode'),
    }).create({
      name: 'usageLimit',
      fields: [
        RadioField.create({
          name: 'usageLimitType',
          options: [{
            value: 'infinity',
          }, {
            value: 'number',
          }],
          defaultValue: 'infinity',
        }),
        NumberField.extend({
          isEnabled: equal('parent.value.usageLimitType', raw('number')),
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
      expireCaveatGroup,
      regionCaveatGroup,
      countryCaveatGroup,
      asnCaveatGroup,
      ipCaveatGroup,
      consumerCaveatGroup,
      serviceCaveatGroup,
      interfaceCaveatGroup,
      readonlyCaveatGroup,
      pathCaveatGroup,
      objectIdCaveatGroup,
      expandCaveats,
    } = this.getProperties(
      'expireCaveatGroup',
      'regionCaveatGroup',
      'countryCaveatGroup',
      'asnCaveatGroup',
      'ipCaveatGroup',
      'consumerCaveatGroup',
      'serviceCaveatGroup',
      'interfaceCaveatGroup',
      'readonlyCaveatGroup',
      'pathCaveatGroup',
      'objectIdCaveatGroup',
      'expandCaveats'
    );

    return FormFieldsGroup.create({
      name: 'caveats',
      isExpanded: expandCaveats,
      fields: [
        expireCaveatGroup,
        regionCaveatGroup,
        countryCaveatGroup,
        asnCaveatGroup,
        ipCaveatGroup,
        consumerCaveatGroup,
        serviceCaveatGroup,
        interfaceCaveatGroup,
        FormFieldsGroup.extend({
          isExpanded: equal('valuesSource.basic.type', raw('access')),
        }).create({
          name: 'dataAccessCaveats',
          fields: [
            readonlyCaveatGroup,
            pathCaveatGroup,
            objectIdCaveatGroup,
          ],
        }),
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
      viewTokenValue: reads('component.tokenDataSource.caveats.expire'),
    }).create(generateCaveatFormGroupBody('expire', [
      DatetimeField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: conditional(
          'isInEditMode',
          raw(moment().add(1, 'day').endOf('day').toDate()),
          'parent.viewTokenValue',
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
      viewTokenValue: reads('component.tokenDataSource.caveats.region'),
    }).create(generateCaveatFormGroupBody('region', [
      FormFieldsGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        viewTokenValue: reads('parent.viewTokenValue'),
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
            defaultValue: conditional(
              'isInEditMode',
              raw([]),
              'parent.viewTokenValue.list',
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
      viewTokenValue: reads('component.tokenDataSource.caveats.country'),
    }).create(generateCaveatFormGroupBody('country', [
      FormFieldsGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        viewTokenValue: reads('parent.viewTokenValue'),
      }).create({
        name: 'country',
        areValidationClassesEnabled: true,
        fields: [
          createWhiteBlackListDropdown('countryType'),
          TagsField.extend({
            defaultValue: conditional(
              'isInEditMode',
              raw([]),
              'parent.viewTokenValue.list',
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
      viewTokenValue: reads('component.tokenDataSource.caveats.asn'),
    }).create(generateCaveatFormGroupBody('asn', [
      TagsField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: conditional(
          'isInEditMode',
          raw([]),
          'parent.viewTokenValue',
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
      viewTokenValue: reads('component.tokenDataSource.caveats.ip'),
    }).create(generateCaveatFormGroupBody('ip', [
      TagsField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: conditional(
          'isInEditMode',
          raw([]),
          'parent.viewTokenValue',
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
      viewTokenValue: reads('component.tokenDataSource.caveats.consumer'),
    }).create(generateCaveatFormGroupBody('consumer', [
      ModelTagsFieldPrototype.extend({
        groupManager: service(),
        spaceManager: service(),
        currentUser: service(),
        providerManager: service(),
        isVisible: reads('parent.isCaveatEnabled'),
        currentUserProxy: promise.object(computed(function currentUserProxy() {
          return this.get('currentUser').getCurrentUserRecord();
        })),
        groupsProxy: promise.array(computed(function groupsProxy() {
          return this.get('groupManager').getGroups()
            .then(groups => get(groups, 'list'));
        })),
        spacesProxy: promise.array(computed(function spacesProxy() {
          return this.get('spaceManager').getSpaces()
            .then(spaces => get(spaces, 'list'));
        })),
        users: promise.array(computed(
          'currentUserProxy',
          'groupsUsersListsProxy.[]',
          'spacesUsersListsProxy.[]',
          function users() {
            const {
              currentUserProxy,
              groupsUsersListsProxy,
              spacesUsersListsProxy,
            } = this.getProperties(
              'currentUserProxy',
              'groupsUsersListsProxy',
              'spacesUsersListsProxy'
            );
            const usersArray = [];
            return allFulfilled([
              currentUserProxy,
              groupsUsersListsProxy,
              spacesUsersListsProxy,
            ]).then(([
              currentUser,
              groupsUserLists,
              spacesUsersListsProxy,
            ]) => {
              usersArray.push(currentUser);
              groupsUserLists
                .concat(spacesUsersListsProxy)
                .forEach(usersList =>
                  usersArray.push(...usersList.toArray())
                );
              return usersArray.uniqBy('entityId');
            });
          }
        )),
        groups: promise.array(computed(
          'groupsProxy',
          'groupsGroupsListsProxy.[]',
          'spacesGroupsListsProxy.[]',
          function users() {
            const {
              groupsProxy,
              groupsGroupsListsProxy,
              spacesGroupsListsProxy,
            } = this.getProperties(
              'groupsProxy',
              'groupsGroupsListsProxy',
              'spacesGroupsListsProxy'
            );
            const groupsArray = [];
            return allFulfilled([
              groupsProxy,
              groupsGroupsListsProxy,
              spacesGroupsListsProxy,
            ]).then(([
              userGroups,
              groupsGroupsLists,
              spacesGroupsLists,
            ]) => {
              groupsArray.push(...userGroups.toArray());
              groupsGroupsLists
                .concat(spacesGroupsLists)
                .forEach(groupsList =>
                  groupsArray.push(...groupsList.toArray())
                );
              return groupsArray.uniqBy('entityId');
            });
          }
        )),
        oneprovidersProxy: promise.array(computed(function oneprovidersProxy() {
          return this.get('providerManager').getProviders()
            .then(providers => get(providers, 'list'));
        })),
        models: computed(function models() {
          return [{
            name: 'user',
            getRecords: () => this.get('users'),
          }, {
            name: 'group',
            getRecords: () => this.get('groups'),
          }, {
            name: 'provider',
            getRecords: () => this.get('oneprovidersProxy'),
          }];
        }),
        defaultValue: conditional(
          'isInEditMode',
          raw([]),
          'parent.viewTokenValue',
        ),
        init() {
          this._super(...arguments);

          ['group', 'space'].forEach(parentRecordName => {
            ['user', 'group'].forEach(childRecordName => {
              const upperChildRecordName = _.upperFirst(childRecordName);
              const computedLists = computed(
                `${parentRecordName}sProxy.@each.isReloading`,
                function computedLists() {
                  return this.get(`${parentRecordName}sProxy`)
                    .then(parents =>
                      onlyFulfilledValues(parents.mapBy(`eff${upperChildRecordName}List`))
                    )
                    .then(effLists => onlyFulfilledValues(effLists.mapBy('list')));
                }
              );
              this.set(
                `${parentRecordName}s${upperChildRecordName}sListsProxy`,
                promise.array(computedLists)
              );
            });
          });
        },
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
      isExpanded: equal('valuesSource.basic.type', raw('access')),
      viewTokenValue: reads('component.tokenDataSource.caveats.service'),
    }).create(generateCaveatFormGroupBody('service', [
      ModelTagsFieldPrototype.extend({
        clusterManager: service(),
        isVisible: reads('parent.isCaveatEnabled'),
        clustersProxy: promise.array(computed(function clustersProxy() {
          return this.get('clusterManager')
            .getClusters().then(clusters => get(clusters, 'list'));
        })),
        models: computed(function models() {
          return [{
            name: 'service',
            getRecords: () => this.get('clustersProxy'),
          }, {
            name: 'serviceOnepanel',
            getRecords: () => this.get('clustersProxy'),
          }];
        }),
        defaultValue: conditional(
          'isInEditMode',
          raw([]),
          'parent.viewTokenValue',
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
      isExpanded: not(equal('valuesSource.basic.type', raw('invite'))),
      viewTokenValue: reads('component.tokenDataSource.caveats.interface'),
    }).create(generateCaveatFormGroupBody('interface', [
      RadioField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: conditional(
          'isInEditMode',
          raw('rest'),
          'parent.viewTokenValue',
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
      viewTokenValue: reads('component.tokenDataSource.caveats.readonly'),
    }).create(generateCaveatFormGroupBody('readonly', [
      StaticTextField.extend({
        isVisible: and('parent.isCaveatEnabled', 'isInEditMode'),
      }).create({ name: 'readonlyEnabledText' }),
      ToggleField.extend({
        isVisible: reads('isInViewMode'),
        defaultValue: conditional(
          'isInEditMode',
          raw(false),
          or('parent.viewTokenValue', raw(false)),
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
      oneiconAlias: service(),
      component,
      spacesProxy: null,
      viewTokenValue: reads('component.tokenDataSource.caveats.path'),
      pathEnabledObserver: observer(
        'isCaveatEnabled',
        'isInViewMode',
        function pathEnabledObserver() {
          const {
            isCaveatEnabled,
            spacesProxy,
            isInViewMode,
            viewTokenValue,
          } = this.getProperties(
            'isCaveatEnabled',
            'spacesProxy',
            'isInViewMode',
            'viewTokenValue'
          );
          const oneiconAlias = this.get('component.oneiconAlias');
          if (isCaveatEnabled && !spacesProxy) {
            let newProxy;
            if (isInViewMode) {
              newProxy = PromiseArray.create({
                promise: viewTokenValue.then(defaultValue =>
                  Object.keys(defaultValue).without('__fieldsValueNames')
                  .map(key => {
                    const record = get(defaultValue, `${key}.pathSpace`);
                    return {
                      value: record,
                      label: get(record, 'name') || `ID: ${get(record, 'entityId')}`,
                      icon: oneiconAlias.getName('space'),
                    };
                  })
                ),
              });
            } else {
              newProxy = component.getRecordOptionsForModel('space');
            }
            this.set('spacesProxy', newProxy);
          }
        }
      ),
    }).create(generateCaveatFormGroupBody('path', [
      SiblingLoadingField.extend({
        loadingProxy: reads('parent.spacesProxy'),
        isVisible: and('parent.isCaveatEnabled', not('isFulfilled')),
      }).create({
        name: 'loadingPathSpaces',
        siblingName: 'path',
      }),
      FormFieldsCollectionGroup.extend({
        isVisible: and(
          'parent.isCaveatEnabled',
          'parent.spacesProxy.isFulfilled'
        ),
        defaultValue: conditional(
          'isInEditMode',
          raw(undefined),
          'parent.viewTokenValue.content'
        ),
        spaces: reads('parent.spacesProxy.content'),
        defaultValueObserver: observer(
          'parent.viewTokenValue.isFulfilled',
          'isInViewMode',
          function defaultValueObserver() {
            const {
              isInViewMode,
              defaultValue,
            } = this.getProperties('isInViewMode', 'defaultValue');
            if (isInViewMode && defaultValue) {
              this.reset();
              // Ember is not smart enough to know, that value has changed
              this.notifyPropertyChange('value');
            }
          }
        ),
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
          if (this.get('isInEditMode')) {
            return this._super(...arguments);
          } else {
            return this.get('defaultValue');
          }
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
      viewTokenValue: reads('component.tokenDataSource.caveats.objectId'),
    }).create(generateCaveatFormGroupBody('objectId', [
      FormFieldsCollectionGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
        defaultValue: conditional(
          'isInEditMode',
          raw(undefined),
          'parent.viewTokenValue'
        ),
        fieldFactoryMethod(uniqueFieldValueName) {
          return TextField.create({
            name: 'objectIdEntry',
            valueName: uniqueFieldValueName,
            mode: this.get('mode') !== 'view' ? 'edit' : 'view',
          });
        },
        dumpDefaultValue() {
          if (this.get('isInEditMode')) {
            return this._super(...arguments);
          } else {
            return this.get('defaultValue');
          }
        },
      }).create({
        name: 'objectId',
      }),
    ]));
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  submitBtnText: conditional(
    equal('mode', raw('create')),
    computedT('createToken'),
    computedT('saveToken')
  ),

  modeObserver: observer('mode', function modeObserver() {
    const {
      fields,
      mode,
    } = this.getProperties('fields', 'mode');

    if (['view', 'edit'].includes(mode)) {
      fields.changeMode('view');
      fields.reset();
      this.expandCaveatsDependingOnCaveatsExistence();
    }
    if (mode === 'edit') {
      [
        fields.getFieldByPath('basic.name'),
        fields.getFieldByPath('basic.revoked'),
      ].forEach(field => field.changeMode('edit'));
    }
  }),

  tokenDataSourceObserver: observer(
    'tokenDataSource',
    function tokenDataSourceObserver() {
      const {
        fields,
        mode,
      } = this.getProperties('fields', 'mode');

      if (mode === 'view') {
        // update token data
        fields.reset();
        this.expandCaveatsDependingOnCaveatsExistence();
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.modeObserver();
    this.setPredefinedValues();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('fields').destroy();
  },

  setPredefinedValues() {
    const {
      predefinedValues,
      mode,
      fields,
      caveatsGroup,
    } = this.getProperties('predefinedValues', 'mode', 'fields', 'caveatsGroup');

    if (!(mode === 'create' && predefinedValues)) {
      return;
    }
    const typeField = fields.getFieldByPath('basic.type');
    const inviteTypeField = fields.getFieldByPath('basic.inviteDetails.inviteType');
    const {
      type,
      inviteType,
      inviteTargetId,
      expire,
    } = getProperties(
      predefinedValues,
      'type',
      'inviteType',
      'inviteTargetId',
      'expire'
    );
    if (type && ['access', 'identity', 'invite'].includes(type)) {
      typeField.valueChanged(type);
    }
    if (
      get(typeField, 'value') === 'invite' &&
      inviteType &&
      tokenInviteTypeOptions.findBy('value', inviteType)
    ) {
      inviteTypeField.valueChanged(inviteType);
    }
    if (expire) {
      let expireDate;
      try {
        const expireNumber = typeof expire === 'number' ? expire : parseInt(expire);
        expireDate = expireNumber ? new Date(Math.floor(expireNumber) * 1000) : null;
      } catch (err) {
        expireDate = null;
      }
      if (expireDate) {
        set(caveatsGroup, 'isExpanded', true);
        caveatsGroup.getFieldByPath('expireCaveat.expireEnabled').valueChanged(true);
        caveatsGroup.getFieldByPath('expireCaveat.expire').valueChanged(expireDate);
      }
    }

    // observers must have time to launch after changing inviteType
    next(() => this.selectInviteTargetById(inviteTargetId));
  },

  selectInviteTargetById(inviteTargetId) {
    const inviteTargetField = this.get('fields')
      .getFieldByPath('basic.inviteDetails.inviteTargetDetails.target');
    const {
      cachedTargetsModelName,
      cachedTargetsProxy,
    } = getProperties(
      inviteTargetField,
      'cachedTargetsModelName',
      'cachedTargetsProxy'
    );

    if (cachedTargetsModelName && inviteTargetId) {
      cachedTargetsProxy.then(() => safeExec(this, () => {
        if (
          get(inviteTargetField, 'cachedTargetsModelName') === cachedTargetsModelName
        ) {
          const optionToSelect =
            cachedTargetsProxy.findBy('value.entityId', inviteTargetId);
          if (optionToSelect) {
            inviteTargetField.valueChanged(get(optionToSelect, 'value'));
          }
        }
      }));
    }
  },

  expandCaveatsDependingOnCaveatsExistence() {
    const {
      caveatsGroup,
      tokenDataSource,
    } = this.getProperties('caveatsGroup', 'tokenDataSource');

    set(caveatsGroup, 'isExpanded', get(tokenDataSource, 'hasCaveats'));
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
    const {
      spaceManager,
      groupManager,
      harvesterManager,
      clusterManager,
    } = this.getProperties(
      'spaceManager',
      'groupManager',
      'harvesterManager',
      'clusterManager',
    );

    let records;
    switch (modelName) {
      case 'group':
        records = groupManager.getGroups();
        break;
      case 'space':
        records = spaceManager.getSpaces();
        break;
      case 'cluster':
        records = clusterManager.getClusters();
        break;
      case 'harvester':
        records = harvesterManager.getHarvesters();
        break;
    }

    return PromiseArray.create({
      promise: records
        .then(records => get(records, 'list'))
        .then(recordsList => RecordsOptionsArrayProxy.create({
          ownerSource: this,
          records: recordsList,
        })),
    });
  },

  /**
   * @param {String} modelName one of user, space, group, provider, cluster
   * @param {String} entityId entityId or 'onezone' (only for cluster model)
   * @returns {Promise<GraphSingleModel>}
   */
  getRecord(modelName, entityId) {
    const {
      userManager,
      spaceManager,
      groupManager,
      providerManager,
      clusterManager,
      guiContext,
    } = this.getProperties(
      'userManager',
      'spaceManager',
      'groupManager',
      'providerManager',
      'clusterManager',
      'guiContext'
    );

    switch (modelName) {
      case 'user':
        return userManager.getRecordById(entityId);
      case 'space':
        return spaceManager.getRecordById(entityId);
      case 'group':
        return groupManager.getRecordById(entityId);
      case 'provider':
        return providerManager.getRecordById(entityId);
      case 'cluster':
        if (entityId === 'onezone') {
          const onezoneClusterEntityId = get(guiContext, 'clusterId');
          return clusterManager.getRecordById(onezoneClusterEntityId);
        } else {
          return clusterManager.getRecordById(entityId);
        }
    }
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
      icon: this.get('oneiconAlias').getName(get(record, 'entityType')),
    });
  },

  actions: {
    toggleCaveatsGroup() {
      this.toggleProperty('caveatsGroup.isExpanded');
    },
    submit() {
      const {
        fields,
        onSubmit,
        currentUser,
        mode,
        token,
      } = this.getProperties('fields', 'onSubmit', 'currentUser', 'mode', 'token');

      if (get(fields, 'isValid')) {
        this.set('isSubmitting', true);
        let submitPromise;
        const formValues = fields.dumpValue();
        if (mode === 'create') {
          submitPromise = currentUser.getCurrentUserRecord().then(user => {
            const tokenRawModel = creatorDataToToken(formValues, user);
            return onSubmit(tokenRawModel);
          });
        } else {
          const diffObject = editorDataToDiffObject(formValues, token);
          submitPromise = onSubmit(diffObject);
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
    defaultValue: false,
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

function generateCaveatFormGroupBody(caveatName, caveatFields) {
  return {
    name: `${caveatName}Caveat`,
    fields: [
      createCaveatToggleField(caveatName),
      ...caveatFields,
      createDisabledCaveatDescription(caveatName),
    ],
  };
}
