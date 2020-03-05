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
import { computed, get, getProperties, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { Promise, all as allFulfilled } from 'rsvp';
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
import { editorDataToToken } from 'onezone-gui/utils/token-editor-utils';
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
import ArrayProxy from '@ember/array/proxy';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';

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
  isCaveatEnabled: getBy(
    array.findBy('fields', raw('isGroupToggle')),
    raw('value')
  ),
});

const ModelTagsFieldPrototype = TagsField.extend({
  tagEditorComponentName: 'tags-input/model-selector-editor',
  defaultValue: computed(() => []),
  sort: true,
  tagEditorSettings: hash('models'),
  valueToTags(value) {
    return (value || []).map(val => RecordTag.create({ value: val }));
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
  return DropdownField.create({
    name: fieldName,
    areValidationClassesEnabled: false,
    options: [
      { value: 'whitelist' },
      { value: 'blacklist' },
    ],
    showSearch: false,
    defaultValue: 'whitelist',
  });
}

export default Component.extend(I18n, {
  classNames: ['token-editor'],

  i18n: service(),
  spaceManager: service(),
  groupManager: service(),
  harvesterManager: service(),
  clusterManager: service(),
  privilegeManager: service(),
  oneiconAlias: service(),
  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tokenEditor',

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
    return FormFieldsGroup.create({
      name: 'basic',
      fields: [
        TextField.create({ name: 'name' }),
        RadioField.create({
          name: 'type',
          options: [
            { value: 'access' },
            { value: 'identity' },
            { value: 'invite' },
          ],
          defaultValue: 'access',
        }),
        FormFieldsGroup.extend({
          isExpanded: equal('parent.value.type', raw('invite')),
        }).create({
          name: 'inviteDetails',
          fields: [
            DropdownField.create({
              name: 'inviteType',
              showSearch: false,
              options: tokenInviteTypeOptions,
              defaultValue: 'userJoinGroup',
            }),
            this.get('inviteTargetDetailsGroup'),
            this.get('usageLimitGroup'),
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
      inviteTypeSpecObserver: observer('inviteTypeSpec', function itsObserver() {
        const {
          inviteTypeSpec,
          cachedTargetsModelName,
          cachedPrivilegesModelName,
        } = this.getProperties(
          'inviteTypeSpec',
          'cachedTargetsModelName',
          'cachedPrivilegesModelName'
        );
        if (!inviteTypeSpec) {
          return;
        }
        const newTargetsModelName = inviteTypeSpec.targetModelName;
        const newPrivilegesModelName = !inviteTypeSpec.noPrivileges &&
          newTargetsModelName;
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
      }),
      init() {
        this._super(...arguments);
        this.inviteTypeSpecObserver();
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
    return DropdownField.extend({
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
    }).create({
      name: 'target',
    });
  }),

  /**
   * Allows selecting privileges for invite token
   * @type {ComputedProperty<Utils.FormComponent.PrivilegesField>}
   */
  privilegesField: computed(function privilegesField() {
    return PrivilegesField.extend({
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
      defaultValue: or('cachedPrivilegesPresetProxy.content', raw([])),
      cachedPrivilegesPresetProxyObserver: observer(
        'cachedPrivilegesPresetProxy.isFulfilled',
        function cachedPrivilegesPresetProxyObserver() {
          if (this.get('cachedPrivilegesPresetProxy.isFulfilled')) {
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
    return FormFieldsGroup.create({
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
    return CaveatFormGroup.create(generateCaveatFormGroupBody('expire', [
      DatetimeField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
      }).create({
        name: 'expire',
        defaultValue: moment().add(1, 'day').endOf('day').toDate(),
      }),
    ]));
  }),

  /**
   * Region caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  regionCaveatGroup: computed(function regionCaveatGroup() {
    return CaveatFormGroup.create(generateCaveatFormGroupBody('region', [
      FormFieldsGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
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
            defaultValue: [],
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
    return CaveatFormGroup.create(generateCaveatFormGroupBody('country', [
      FormFieldsGroup.extend({
        isVisible: reads('parent.isCaveatEnabled'),
      }).create({
        name: 'country',
        areValidationClassesEnabled: true,
        fields: [
          createWhiteBlackListDropdown('countryType'),
          TagsField.extend({
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
                get(a, 'label').localeCompare(get(b, 'label').toUpperCase())
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
            defaultValue: [],
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
    return CaveatFormGroup.create(generateCaveatFormGroupBody('asn', [
      TagsField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
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
        defaultValue: [],
        sort: true,
      }),
    ]));
  }),

  /**
   * IP caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  ipCaveatGroup: computed(function ipCaveatGroup() {
    return CaveatFormGroup.create(generateCaveatFormGroupBody('ip', [
      TagsField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
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
        defaultValue: [],
        sort: true,
      }),
    ]));
  }),

  /**
   * Consumer caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  consumerCaveatGroup: computed(function consumerCaveatGroup() {
    return CaveatFormGroup.create(generateCaveatFormGroupBody('consumer', [
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
            name: 'oneprovider',
            getRecords: () => this.get('oneprovidersProxy'),
          }];
        }),
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
    return CaveatFormGroup.extend({
      isExpanded: equal('valuesSource.basic.type', raw('access')),
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
      }).create({ name: 'service' }),
    ]));
  }),

  /**
   * Interface caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  interfaceCaveatGroup: computed(function interfaceCaveatGroup() {
    return CaveatFormGroup.extend({
      isExpanded: not(equal('valuesSource.basic.type', raw('invite'))),
    }).create(generateCaveatFormGroupBody('interface', [
      RadioField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
      }).create({
        name: 'interface',
        options: [
          { value: 'rest' },
          { value: 'oneclient' },
        ],
        defaultValue: 'rest',
      }),
    ]));
  }),

  /**
   * Readonly caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  readonlyCaveatGroup: computed(function readonlyCaveatGroup() {
    return CaveatFormGroup.create(generateCaveatFormGroupBody('readonly', [
      StaticTextField.extend({
        isVisible: reads('parent.isCaveatEnabled'),
      }).create({ name: 'readonlyEnabledText' }),
    ]));
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
    ]));
  }),

  /**
   * ObjectId caveat
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  objectIdCaveatGroup: computed(function objectIdCaveatGroup() {
    return CaveatFormGroup.create(generateCaveatFormGroupBody('objectId', [
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
    ]));
  }),

  init() {
    this._super(...arguments);

    // Force compute fields root group
    this.get('fields');
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

function createCaveatToggleField(caveatName) {
  return ToggleField.extend({
    classes: 'caveat-group-toggle',
    addColonToLabel: false,
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
