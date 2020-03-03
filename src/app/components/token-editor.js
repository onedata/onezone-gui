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
import { Promise, all as allFulfilled, allSettled, resolve } from 'rsvp';
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
import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
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
import { editorDataToToken, tokenToEditorDefaultData } from 'onezone-gui/utils/token-editor-utils';
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
} from 'ember-awesome-macros';
import moment from 'moment';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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
    'token.${name,typeName,metadata,caveats}',
    function tokenDataSource() {
      return tokenToEditorDefaultData(this.get('token'), this.getRecord.bind(this));
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed('basicGroup', 'caveatsGroup', function fields() {
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
  basicGroup: computed(
    'inviteTargetDetailsGroup',
    'usageLimitGroup',
    'usageCountField',
    function basicGroup() {
      const component = this;
      return FormFieldsGroup.create({
        name: 'basic',
        fields: [
          TextField.extend({
            component,
            defaultValue: or('component.tokenDataSource.name', raw(undefined)),
          }).create({ name: 'name' }),
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
          }).create({
            name: 'inviteDetails',
            fields: [
              DropdownField.extend({
                component,
                defaultValue: conditional(
                  'isInEditMode',
                  raw('userJoinGroup'),
                  'component.tokenDataSource.inviteType'
                ),
              }).create({
                name: 'inviteType',
                showSearch: false,
                options: tokenInviteTypeOptions,
              }),
              this.get('inviteTargetDetailsGroup'),
              this.get('usageLimitGroup'),
              this.get('usageCountField'),
            ],
          }),
        ],
      });
    }
  ),

  /**
   * Fields group visible only when selected invite type has specified targetModelName
   * (invitation target). To not break down while collapsing after
   * invite type change to type without target, it performs caching of previous invite
   * type value to render it until collapsed. Does the same for invite types
   * with/without privileges.
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  inviteTargetDetailsGroup: computed(
    'targetField',
    'privilegesField',
    function inviteTargetDetailsGroup() {
      const component = this;
      return FormFieldsGroup.extend({
        component,
        viewTokenTargetProxy: reads('component.tokenDataSource.inviteTargetProxy'),
        isExpanded: notEmpty('inviteTypeSpec.targetModelName'),
        inviteType: reads('parent.value.inviteType'),
        inviteTypeSpec: computed('inviteType', function inviteTypeSpec() {
          return tokenInviteTypeOptions.findBy('value', this.get('inviteType'));
        }),
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
            const newPrivilegesModelName = !inviteTypeSpec.noPrivileges && newTargetsModelName;
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
          }
        ),
        init() {
          this._super(...arguments);
          scheduleOnce('afterRender', this, 'inviteTypeSpecObserver');
        },
      }).create({
        name: 'inviteTargetDetails',
        fields: [
          LoadingField.extend({
            isVisible: not('isFulfilled'),
            loadingProxy: reads('parent.cachedTargetsProxy'),
            label: getBy(
              array.findBy('parent.fields', raw('name'), raw('target')),
              raw('label')
            ),
            isValid: reads('isFulfilled'),
          }).create({
            name: 'loadingTarget',
          }),
          this.get('targetField'),
          FormFieldsGroup.extend({
            isExpanded: not('parent.inviteTypeSpec.noPrivileges'),
          }).create({
            name: 'invitePrivilegesDetails',
            fields: [
              LoadingField.extend({
                isVisible: not('isFulfilled'),
                loadingProxy: reads('parent.parent.cachedPrivilegesPresetProxy'),
                label: getBy(
                  array.findBy('parent.fields', raw('name'), raw('privileges')),
                  raw('label')
                ),
                isValid: reads('isFulfilled'),
              }).create({
                name: 'loadingPrivileges',
              }),
              this.get('privilegesField'),
            ],
          }),
        ],
      });
    }
  ),

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
      label: computed('latestInviteTypeWithTargets', 'path', function label() {
        const {
          latestInviteTypeWithTargets,
          path,
        } = this.getProperties('latestInviteTypeWithTargets', 'path');
        return latestInviteTypeWithTargets &&
          this.t(`${path}.label.${latestInviteTypeWithTargets}`);
      }),
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
          if (this.get('cachedPrivilegesPresetProxy.isFulfilled') && this.get('mode') === 'edit') {
            this.reset();
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
      text: tag `${'usageCount'}/${'usageLimit'}`,
      isVisible: reads('isInViewMode'),
    }).create({ name: 'usageCount' });
  }),

  /**
   * Aggregates all caveat-related form elements
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  caveatsGroup: computed(
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
    'expandCaveats',
    function caveatsGroup() {
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
    }
  ),

  /**
   * Time caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  expireCaveatGroup: computed(function expireCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      component,
      viewTokenValue: reads('component.tokenDataSource.caveats.expire'),
    }).create({
      name: 'expireCaveat',
      fields: [
        createCaveatToggleField('expire'),
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
        createDisabledCaveatDescription('expire'),
      ],
    });
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
    }).create({
      name: 'regionCaveat',
      fields: [
        createCaveatToggleField('region'),
        FormFieldsGroup.extend({
          isVisible: reads('parent.isCaveatEnabled'),
          viewTokenValue: reads('parent.viewTokenValue'),
        }).create({
          name: 'region',
          areValidationClassesEnabled: true,
          fields: [
            createWhiteBlackListDropdown('regionType'),
            TagsField.extend({
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
        createDisabledCaveatDescription('region'),
      ],
    });
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
    }).create({
      name: 'countryCaveat',
      fields: [
        createCaveatToggleField('country'),
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
              sortTags(tags) {
                return tags.sort((a, b) =>
                  get(a, 'label').toUpperCase().localeCompare(
                    get(b, 'label').toUpperCase()
                  )
                );
              },
              tagsToValue(tags) {
                return tags
                  .mapBy('label')
                  .map(country => country.toUpperCase())
                  .uniq();
              },
            }).create({
              name: 'countryList',
              tagEditorSettings: {
                // Only ASCII letters are allowed. See ISO 3166-1 Alpha-2 codes documentation
                regexp: /^[a-zA-Z]{2}$/,
              },
              sort: true,
            }),
          ],
        }),
        createDisabledCaveatDescription('country'),
      ],
    });
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
    }).create({
      name: 'asnCaveat',
      fields: [
        createCaveatToggleField('asn'),
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
        createDisabledCaveatDescription('asn'),
      ],
    });
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
    }).create({
      name: 'ipCaveat',
      fields: [
        createCaveatToggleField('ip'),
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
        createDisabledCaveatDescription('ip'),
      ],
    });
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
    }).create({
      name: 'consumerCaveat',
      fields: [
        createCaveatToggleField('consumer'),
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
                        onlySettledOk(parents.mapBy(`eff${upperChildRecordName}List`))
                      )
                      .then(effLists => onlySettledOk(effLists.mapBy('list')));
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
        createDisabledCaveatDescription('consumer'),
      ],
    });
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
    }).create({
      name: 'serviceCaveat',
      fields: [
        createCaveatToggleField('service'),
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
        createDisabledCaveatDescription('service'),
      ],
    });
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
    }).create({
      name: 'interfaceCaveat',
      fields: [
        createCaveatToggleField('interface'),
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
        createDisabledCaveatDescription('interface'),
      ],
    });
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
    }).create({
      name: 'readonlyCaveat',
      fields: [
        createCaveatToggleField('readonly'),
        StaticTextField.extend({
          isVisible: and('parent.isCaveatEnabled', 'isInEditionMode'),
        }).create({ name: 'readonlyEnabledText' }),
        createDisabledCaveatDescription('readonly'),
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
      ],
    });
  }),

  /**
   * Path caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  pathCaveatGroup: computed(function pathCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      spacesProxy: null,
      pathEnabledObserver: observer('value.pathEnabled', function pathEnabledObserver() {
        if (this.get('value.pathEnabled') && !this.get('spacesProxy')) {
          this.set(
            'spacesProxy',
            component.getRecordOptionsForModel('space')
          );
        }
      }),
    }).create({
      name: 'pathCaveat',
      fields: [
        createCaveatToggleField('path'),
        LoadingField.extend({
          loadingProxy: reads('parent.spacesProxy'),
          isVisible: and('parent.isCaveatEnabled', not('isFulfilled')),
          label: getBy(
            array.findBy('parent.fields', raw('name'), raw('path')),
            raw('label')
          ),
          isValid: reads('isFulfilled'),
        }).create({
          name: 'loadingPathSpaces',
        }),
        FormFieldsCollectionGroup.extend({
          isVisible: and(
            'parent.isCaveatEnabled',
            'parent.spacesProxy.isFulfilled'
          ),
          spaces: reads('parent.spacesProxy.content'),
          fieldFactoryMethod(createdFieldsCounter) {
            return FormFieldsGroup.extend({}).create({
              name: 'pathEntry',
              valueName: `pathEntry${createdFieldsCounter}`,
              areValidationClassesEnabled: true,
              fields: [
                DropdownField.extend({
                  options: reads('parent.parent.spaces'),
                  defaultValue: reads('options.firstObject.value'),
                }).create({
                  name: 'pathSpace',
                  areValidationClassesEnabled: false,
                }),
                TextField.create({
                  name: 'pathString',
                  defaultValue: '',
                  isOptional: true,
                  regex: /^(\/[^/]+)*$/,
                }),
              ],
            });
          },
        }).create({
          name: 'path',
        }),
        createDisabledCaveatDescription('path'),
      ],
    });
  }),

  /**
   * ObjectId caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  objectIdCaveatGroup: computed(function objectIdCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'objectIdCaveat',
      fields: [
        createCaveatToggleField('objectId'),
        FormFieldsCollectionGroup.extend({
          isVisible: reads('parent.isCaveatEnabled'),
          fieldFactoryMethod(createdFieldsCounter) {
            return TextField.create({
              name: 'objectIdEntry',
              valueName: `objectIdEntry${createdFieldsCounter}`,
            });
          },
        }).create({
          name: 'objectId',
        }),
        createDisabledCaveatDescription('objectId'),
      ],
    });
  }),

  modeObserver: observer('mode', function modeObserver() {
    const {
      fields,
      mode,
    } = this.getProperties('fields', 'mode');

    if (mode === 'view') {
      fields.changeMode('view');
      fields.reset();
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
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.modeObserver();
  },

  notifyAboutChange() {
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
      oneiconAlias,
    } = this.getProperties(
      'spaceManager',
      'groupManager',
      'harvesterManager',
      'clusterManager',
      'oneiconAlias'
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
        .then(recordsList => recordsList.sortBy('name'))
        .then(recordsList => recordsList.map(record => ({
          value: record,
          label: get(record, 'name'),
          icon: oneiconAlias.getName(modelName),
        }))),
    });
  },

  /**
   * @param {String} modelName one of user, group, provider, cluster
   * @param {String} entityId entityId or 'onezone' (only for cluster model)
   * @returns {Promise<GraphSingleModel>}
   */
  getRecord(modelName, entityId) {
    const {
      userManager,
      groupManager,
      providerManager,
      clusterManager,
      guiContext,
    } = this.getProperties(
      'userManager',
      'groupManager',
      'providerManager',
      'clusterManager',
      'guiContext'
    );

    switch (modelName) {
      case 'user':
        return userManager.getRecordById(entityId);
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
      } = this.getProperties('fields', 'onSubmit', 'currentUser');

      if (get(fields, 'isValid')) {
        this.set('isSubmitting', true);
        return currentUser.getCurrentUserRecord().then(user => {
          const formValues = fields.dumpValue();
          const tokenRawModel = editorDataToToken(formValues, user);
          return onSubmit(tokenRawModel);
        }).finally(() => safeExec(this, () => this.set('isSubmitting', false)));
      }
    },
  },
});

function onlySettledOk(promiseArr) {
  return allSettled(promiseArr)
    .then(arr => arr.filterBy('state', 'fulfilled').mapBy('value'));
}

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
