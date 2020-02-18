import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, get, getProperties, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
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
import { editorDataToToken } from 'onezone-gui/utils/token-editor-utils';
import { scheduleOnce } from '@ember/runloop';
import {
  equal,
  raw,
  and,
  or,
  not,
  hash,
  array,
  getBy,
  promise,
} from 'ember-awesome-macros';
import moment from 'moment';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise, all as allFulfilled, allSettled } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const tokenSubtypeOptions = [{
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

function getTargetModelNameForSubtype(subtype) {
  const subtypeOption = subtype && tokenSubtypeOptions.findBy('value', subtype);
  return subtypeOption && subtypeOption.targetModelName;
}

function getPrivilegesModelNameForSubtype(subtype) {
  const subtypeOption = subtype && tokenSubtypeOptions.findBy('value', subtype);
  return subtypeOption && !subtypeOption.noPrivileges && subtypeOption.targetModelName;
}

const CaveatFormGroup = FormFieldsGroup.extend({
  classes: computed('isCaveatEnabled', function classes() {
    return 'caveat-group' + (this.get('isCaveatEnabled') ? ' is-enabled' : '');
  }),
  isCaveatEnabled: getBy(array.findBy('fields', raw('isGroupToggle')), raw('value')),
});

const CaveatGroupToggle = ToggleField.extend({
  classes: 'caveat-group-toggle',
  addColonToLabel: false,
  defaultValue: false,
  isGroupToggle: true,
});

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
   * @virtual optional
   * @type {boolean}
   */
  expandCaveats: false,

  /**
   * @type {Function}
   * @param {EmberObject} formValues
   * @param {boolean} isValid
   */
  onChange: notImplementedIgnore,

  /**
   * @type {Function}
   * @param {Object} tokenRawModel
   * @param {Promise}
   */
  onSubmit: notImplementedReject,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed('basicGroup', 'caveatsGroup', function fields() {
    const {
      i18nPrefix,
      basicGroup,
      caveatsGroup,
    } = this.getProperties(
      'i18nPrefix',
      'basicGroup',
      'caveatsGroup',
    );
    const component = this;

    return FormFieldsRootGroup
      .extend({
        ownerSource: reads('component'),
        isEnabled: not('component.isSubmitting'),
        onValueChange() {
          this._super(...arguments);
          scheduleOnce('afterRender', component, 'notifyAboutChange');
        },
      })
      .create({
        component,
        i18nPrefix: `${i18nPrefix}.fields`,
        fields: [
          basicGroup,
          caveatsGroup,
        ],
      });
  }),

  basicGroup: computed(
    'inviteTargetDetailsGroup',
    'usageLimitField',
    function basicGroup() {
      return FormFieldsGroup.create({
        name: 'basic',
        fields: [
          TextField.create({ name: 'name' }),
          RadioField.create({
            name: 'type',
            options: [
              { value: 'access' },
              { value: 'invite' },
            ],
            defaultValue: 'access',
          }),
          FormFieldsGroup.extend({
            isExpanded: equal('valuesSource.basic.type', raw('invite')),
          }).create({
            name: 'inviteDetails',
            fields: [
              DropdownField.create({
                name: 'subtype',
                showSearch: false,
                options: tokenSubtypeOptions,
                defaultValue: 'userJoinGroup',
              }),
              this.get('inviteTargetDetailsGroup'),
              this.get('usageLimitField'),
            ],
          }),
        ],
      });
    }
  ),

  inviteTargetDetailsGroup: computed(
    'targetField',
    'privilegesField',
    function inviteTargetDetailsGroup() {
      const component = this;
      return FormFieldsGroup.extend({
        isExpanded: equal('latestSubtypeWithTargets', 'subtype'),
        subtype: reads('parent.value.subtype'),
        subtypeSpecification: computed(
          'subtype',
          function subtypeSpecification() {
            return tokenSubtypeOptions.findBy('value', this.get('subtype'));
          }
        ),
        latestSubtypeWithTargets: undefined,
        cachedTargetsModelName: undefined,
        cachedTargetsProxy: PromiseObject.create({
          promise: new Promise(() => {}),
        }),
        cachedPrivilegesModelName: undefined,
        cachedPrivilegesPresetProxy: PromiseObject.create({
          promise: new Promise(() => {}),
        }),
        subtypeObserver: observer('subtype', function subtypeObserver() {
          const {
            subtype,
            cachedTargetsModelName,
            cachedPrivilegesModelName,
          } = this.getProperties(
            'subtype',
            'cachedTargetsModelName',
            'cachedPrivilegesModelName'
          );
          const newTargetsModelName = getTargetModelNameForSubtype(subtype);
          const newPrivilegesModelName =
            getPrivilegesModelNameForSubtype(subtype);
          if (newTargetsModelName) {
            this.set('latestSubtypeWithTargets', subtype);
            if (cachedTargetsModelName !== newTargetsModelName) {
              this.setProperties({
                cachedTargetsModelName: newTargetsModelName,
                cachedTargetsProxy: component
                  .getTargetOptionsForModel(newTargetsModelName),
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

          this.subtypeObserver();
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
            isExpanded: not('parent.subtypeSpecification.noPrivileges'),
          }).create({
            name: 'invitePrivilegesDetails',
            fields: [
              LoadingField.extend({
                isVisible: not('isFulfilled'),
                loadingProxy: reads(
                  'parent.parent.cachedPrivilegesPresetProxy'),
                label: getBy(
                  array.findBy('parent.fields', raw('name'), raw(
                    'privileges')),
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

  targetField: computed(function targetField() {
    return DropdownField.extend({
      cachedTargetsProxy: reads('parent.cachedTargetsProxy'),
      latestSubtypeWithTargets: reads('parent.latestSubtypeWithTargets'),
      label: computed('latestSubtypeWithTargets', 'path', function label() {
        const {
          latestSubtypeWithTargets,
          path,
        } = this.getProperties('latestSubtypeWithTargets', 'path');
        return latestSubtypeWithTargets &&
          this.t(`${path}.label.${latestSubtypeWithTargets}`);
      }),
      placeholder: computed(
        'latestSubtypeWithTargets',
        'path',
        function placeholder() {
          const {
            latestSubtypeWithTargets,
            path,
          } = this.getProperties('latestSubtypeWithTargets', 'path');
          return latestSubtypeWithTargets &&
            this.t(`${path}.placeholder.${latestSubtypeWithTargets}`);
        }
      ),
      options: reads('cachedTargetsProxy.content'),
      cachedTargetsModelNameObserver: observer(
        'parent.cachedTargetsModelName',
        function cachedTargetsModelNameObserver() {
          this.reset();
        }
      ),
      isVisible: reads('cachedTargetsProxy.isFulfilled'),
    }).create({
      name: 'target',
    });
  }),

  privilegesField: computed(function privilegesField() {
    return PrivilegesField.extend({
      cachedPrivilegesModelName: or(
        'parent.parent.cachedPrivilegesModelName',
        raw('userJoinGroup')
      ),
      cachedPrivilegesPresetProxy: reads(
        'parent.parent.cachedPrivilegesPresetProxy'),
      privilegesGroups: computed(
        'cachedPrivilegesModelName',
        function privilegesGroups() {
          return privilegesForModels[this.get('cachedPrivilegesModelName')];
        }
      ),
      privilegeGroupsTranslationsPath: computed(
        'cachedPrivilegesModelName',
        function () {
          const modelName =
            _.upperFirst(this.get('cachedPrivilegesModelName'));
          return modelName ?
            `components.content${modelName}sMembers.privilegeGroups` :
            undefined;
        }
      ),
      privilegesTranslationsPath: computed(
        'cachedPrivilegesModelName',
        function () {
          const modelName =
            _.upperFirst(this.get('cachedPrivilegesModelName'));
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

  usageLimitField: computed(function usageLimitField() {
    return FormFieldsGroup.create({
      name: 'usageLimit',
      fields: [
        RadioField.create({
          name: 'usageLimitSelector',
          options: [{
            value: 'infinity',
          }, {
            value: 'number',
          }],
          defaultValue: 'infinity',
        }),
        NumberField.extend({
          isEnabled: equal(
            'parent.value.usageLimitSelector',
            raw('number')
          ),
        }).create({
          name: 'usageLimitNumber',
          gte: 1,
          integer: true,
        }),
      ],
    });
  }),

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
          FormFieldsGroup.extend({
            isExpanded: equal('valuesSource.basic.type', raw('access')),
          }).create({
            name: 'accessOnlyCaveats',
            fields: [
              interfaceCaveatGroup,
              readonlyCaveatGroup,
              pathCaveatGroup,
              objectIdCaveatGroup,
            ],
          }),
        ],
      });
    }
  ),

  expireCaveatGroup: computed(function expireCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'expireCaveat',
      fields: [
        CaveatGroupToggle.create({
          name: 'expireEnabled',
        }),
        DatetimeField.extend({
          isVisible: reads(
            'valuesSource.caveats.expireCaveat.expireEnabled'
          ),
        }).create({
          name: 'expire',
          defaultValue: moment().add(1, 'day').endOf('day').toDate(),
        }),
        StaticTextField.extend({
          isVisible: not('valuesSource.caveats.expireCaveat.expireEnabled'),
        }).create({
          name: 'expireDisabledText',
        }),
      ],
    });
  }),

  regionCaveatGroup: computed(function regionCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'regionCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'regionEnabled' }),
        FormFieldsGroup.extend({
          isVisible: reads(
            'valuesSource.caveats.regionCaveat.regionEnabled'
          ),
        }).create({
          name: 'region',
          areValidationClassesEnabled: true,
          fields: [
            DropdownField.create({
              name: 'regionType',
              areValidationClassesEnabled: false,
              options: [
                { value: 'whitelist' },
                { value: 'blacklist' },
              ],
              showSearch: false,
              defaultValue: 'whitelist',
            }),
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
                    label: String(this.t(
                      `${path}.tags.${abbrev}`)),
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
        StaticTextField.extend({
          isVisible: not('valuesSource.caveats.regionCaveat.regionEnabled'),
        }).create({ name: 'regionDisabledText' }),
      ],
    });
  }),

  countryCaveatGroup: computed(function countryCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'countryCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'countryEnabled' }),
        FormFieldsGroup.extend({
          isVisible: reads(
            'valuesSource.caveats.countryCaveat.countryEnabled'
          ),
        }).create({
          name: 'country',
          areValidationClassesEnabled: true,
          fields: [
            DropdownField.create({
              name: 'countryType',
              areValidationClassesEnabled: false,
              options: [
                { value: 'whitelist' },
                { value: 'blacklist' },
              ],
              showSearch: false,
              defaultValue: 'whitelist',
            }),
            TagsField.extend({
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
              defaultValue: [],
              sort: true,
            }),
          ],
        }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.countryCaveat.countryEnabled'
          ),
        }).create({ name: 'countryDisabledText' }),
      ],
    });
  }),

  asnCaveatGroup: computed(function asnCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'asnCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'asnEnabled' }),
        TagsField.extend({
          isVisible: reads('valuesSource.caveats.asnCaveat.asnEnabled'),
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
        StaticTextField.extend({
          isVisible: not('valuesSource.caveats.asnCaveat.asnEnabled'),
        }).create({ name: 'asnDisabledText' }),
      ],
    });
  }),

  ipCaveatGroup: computed(function ipCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'ipCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'ipEnabled' }),
        TagsField.extend({
          isVisible: reads('valuesSource.caveats.ipCaveat.ipEnabled'),
          sortTags(tags) {
            const ipPartsMatcher = /^(\d+)\.(\d+)\.(\d+)\.(\d+)(\/(\d+))?$/;
            const sortKeyDecoratedTags = tags.map(tag => {
              const parsedIp = get(tag, 'label').match(ipPartsMatcher);
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
        StaticTextField.extend({
          isVisible: not('valuesSource.caveats.ipCaveat.ipEnabled'),
        }).create({ name: 'ipDisabledText' }),
      ],
    });
  }),

  consumerCaveatGroup: computed(function consumerCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'consumerCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'consumerEnabled' }),
        TagsField.extend({
          groupManager: service(),
          spaceManager: service(),
          currentUser: service(),
          providerManager: service(),
          isVisible: reads(
            'valuesSource.caveats.consumerCaveat.consumerEnabled'
          ),
          currentUserProxy: promise.object(computed(
            function currentUserProxy() {
              return this.get('currentUser').getCurrentUserRecord();
            }
          )),
          groupsProxy: promise.array(computed(function groupsProxy() {
            return this.get('groupManager')
              .getGroups().then(groups => get(groups, 'list'));
          })),
          spacesProxy: promise.array(computed(function spacesProxy() {
            return this.get('spaceManager')
              .getSpaces().then(spaces => get(spaces, 'list'));
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
          oneprovidersProxy: promise.array(computed(function oneproviders() {
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
          tagEditorSettings: hash('models'),
          init() {
            this._super(...arguments);

            ['group', 'space'].forEach(parentRecordName => {
              ['user', 'group'].forEach(childRecordName => {
                const upperChildRecordName = _.upperFirst(childRecordName);
                this.set(
                  `${parentRecordName}s${upperChildRecordName}sListsProxy`,
                  promise.array(computed(
                    `${parentRecordName}sProxy.@each.isReloading`,
                    function () {
                      return this.get(`${parentRecordName}sProxy`).then(parents =>
                        onlySettledOk(parents.mapBy(`eff${upperChildRecordName}List`))
                        .then(effLists => onlySettledOk(effLists.mapBy('list')))
                      );
                    }
                  ))
                );
              });
            });
          },
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
        }).create({
          name: 'consumer',
          tagEditorComponentName: 'tags-input/model-selector-editor',
          defaultValue: [],
          sort: true,
        }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.consumerCaveat.consumerEnabled'),
        }).create({ name: 'consumerDisabledText' }),
      ],
    });
  }),

  serviceCaveatGroup: computed(function serviceCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'serviceCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'serviceEnabled' }),
        TagsField.extend({
          clusterManager: service(),
          isVisible: reads(
            'valuesSource.caveats.serviceCaveat.serviceEnabled'
          ),
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
        }).create({
          name: 'service',
          tagEditorComponentName: 'tags-input/model-selector-editor',
          defaultValue: [],
          sort: true,
        }),
        StaticTextField.extend({
          isVisible: not('valuesSource.caveats.serviceCaveat.serviceEnabled'),
        }).create({ name: 'serviceDisabledText' }),
      ],
    });
  }),

  interfaceCaveatGroup: computed(function interfaceCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'interfaceCaveat',
      fields: [
        CaveatGroupToggle.create({
          name: 'interfaceEnabled',
        }),
        RadioField.extend({
          isVisible: reads(
            'valuesSource.caveats.accessOnlyCaveats.interfaceCaveat.interfaceEnabled'
          ),
        }).create({
          name: 'interface',
          options: [
            { value: 'rest' },
            { value: 'oneclient' },
          ],
          defaultValue: 'rest',
        }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.accessOnlyCaveats.interfaceCaveat.interfaceEnabled'
          ),
        }).create({
          name: 'interfaceDisabledText',
        }),
      ],
    });
  }),

  readonlyCaveatGroup: computed(function readonlyCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'readonlyCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'readonlyEnabled' }),
        StaticTextField.extend({
          isVisible: reads(
            'valuesSource.caveats.accessOnlyCaveats.readonlyCaveat.readonlyEnabled'
          ),
        }).create({ name: 'readonlyEnabledText' }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.accessOnlyCaveats.readonlyCaveat.readonlyEnabled'
          ),
        }).create({ name: 'readonlyDisabledText' }),
      ],
    });
  }),

  pathCaveatGroup: computed(function pathCaveatGroup() {
    const component = this;
    return CaveatFormGroup.extend({
      spacesProxy: null,
      pathEnabledObserver: observer('value.pathEnabled', function () {
        if (this.get('value.pathEnabled') && !this.get('spacesProxy')) {
          this.set(
            'spacesProxy',
            component.getTargetOptionsForModel('space')
          );
        }
      }),
    }).create({
      name: 'pathCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'pathEnabled' }),
        FormFieldsCollectionGroup.extend({
          isVisible: and(
            'parent.value.pathEnabled',
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
                TextField.extend({}).create({
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
        LoadingField.extend({
          loadingProxy: reads('parent.spacesProxy'),
          isVisible: and('parent.value.pathEnabled', not('isFulfilled')),
          label: getBy(
            array.findBy('parent.fields', raw('name'), raw('path')),
            raw('label')
          ),
          isValid: reads('isFulfilled'),
        }).create({
          name: 'loadingPathSpaces',
        }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.accessOnlyCaveats.pathCaveat.pathEnabled'
          ),
        }).create({ name: 'pathDisabledText' }),
      ],
    });
  }),

  objectIdCaveatGroup: computed(function objectIdCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'objectIdCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'objectIdEnabled' }),
        FormFieldsCollectionGroup.extend({
          isVisible: reads(
            'valuesSource.caveats.accessOnlyCaveats.objectIdCaveat.objectIdEnabled'
          ),
          fieldFactoryMethod(createdFieldsCounter) {
            return TextField.create({
              name: 'objectIdEntry',
              valueName: `objectIdEntry${createdFieldsCounter}`,
            });
          },
        }).create({
          name: 'objectId',
        }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.accessOnlyCaveats.objectIdCaveat.objectIdEnabled'
          ),
        }).create({ name: 'objectIdDisabledText' }),
      ],
    });
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

  getTargetOptionsForModel(modelName) {
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

    return PromiseObject.create({
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

  getPrivilegesPresetForModel(modelName) {
    return PromiseObject.create({
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

function onlySettledOk(promiseArr) {
  return allSettled(promiseArr)
    .then(arr => arr.filterBy('state', 'fulfilled').mapBy('value'));
}
