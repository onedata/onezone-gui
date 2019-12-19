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
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import { equal, raw, not, hash } from 'ember-awesome-macros';
import moment from 'moment';
import _ from 'lodash';

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
}, {
  value: 'supportSpace',
  icon: 'space',
  targetModelName: 'space',
}, {
  value: 'registerOneprovider',
  icon: 'provider',
}];

function getTargetModelNameForSubtype(subtype) {
  const subtypeOptions = subtype && tokenSubtypeOptions.findBy('value', subtype);
  return subtypeOptions && subtypeOptions.targetModelName;
}

const CaveatFormGroup = FormFieldsGroup.extend({
  classes: 'caveat-group',
});

const CaveatGroupToggle = ToggleField.extend({
  classes: 'caveat-group-toggle',
  addColonToLabel: false,
  defaultValue: false,
});

export default Component.extend(I18n, {
  classNames: ['token-editor'],

  i18n: service(),
  spaceManager: service(),
  groupManager: service(),
  harvesterManager: service(),
  clusterManager: service(),
  oneiconAlias: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tokenEditor',

  /**
   * @type {Function}
   * @param {EmberObject} formValues
   * @param {boolean} isValid
   */
  onChange: notImplementedIgnore,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed('basicGroup', 'caveatsGroup', function fields() {
    const {
      i18nPrefix,
      basicGroup,
      caveatsGroup,
    } = this.getProperties('i18nPrefix', 'basicGroup', 'caveatsGroup');
    const component = this;

    return FormFieldsRootGroup
      .extend({
        onValueChange() {
          this._super(...arguments);
          scheduleOnce('afterRender', component, 'notifyAboutChange');
        },
      })
      .create({
        ownerSource: this,
        i18nPrefix: `${i18nPrefix}.fields`,
        fields: [
          basicGroup,
          caveatsGroup,
        ],
      });
  }),

  basicGroup: computed('inviteTargetDetailsGroup', function basicGroup() {
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
          ],
        }),
        JsonField.create({
          name: 'metadata',
          isOptional: true,
        }),
      ],
    });
  }),

  inviteTargetDetailsGroup: computed(
    'targetField',
    function inviteTargetDetailsGroup() {
      return FormFieldsGroup.extend({
        subtype: reads('valuesSource.basic.inviteDetails.subtype'),
        isExpanded: computed('subtype', function isExpanded() {
          return getTargetModelNameForSubtype(this.get('subtype'));
        }),
      }).create({
        name: 'inviteTargetDetails',
        fields: [this.get('targetField')],
      });
    }
  ),

  targetField: computed(function targetField() {
    const component = this;
    return DropdownField.extend({
      cachedSubtype: undefined,
      targetModelName: undefined,
      subtype: reads('valuesSource.basic.inviteDetails.subtype'),
      label: computed('cachedSubtype', 'path', function label() {
        const {
          cachedSubtype,
          path,
        } = this.getProperties('cachedSubtype', 'path');
        return cachedSubtype && this.t(`${path}.label.${cachedSubtype}`);
      }),
      placeholder: computed('cachedSubtype', 'path', function placeholder() {
        const {
          cachedSubtype,
          path,
        } = this.getProperties('cachedSubtype', 'path');
        return cachedSubtype &&
          this.t(`${path}.placeholder.${cachedSubtype}`);
      }),
      subtypeObserver: observer('subtype', function subtypeObserver() {
        const {
          subtype,
          targetModelName,
        } = this.getProperties('subtype', 'targetModelName');
        const newTargetModelName = getTargetModelNameForSubtype(subtype);
        if (newTargetModelName) {
          this.enable();
          this.set('cachedSubtype', subtype);
          if (targetModelName !== newTargetModelName) {
            this.setProperties({
              targetModelName: newTargetModelName,
              options: component
                .getTargetOptionsForModel(newTargetModelName),
            });
            this.reset();
          }
        } else {
          this.disable();
        }
      }),
    }).create({
      name: 'target',
    });
  }),

  caveatsGroup: computed(
    'expireCaveatGroup',
    'interfaceCaveatGroup',
    'asnCaveatGroup',
    'ipCaveatGroup',
    'regionCaveatGroup',
    'countryCaveatGroup',
    'objectIdCaveatGroup',
    function caveatsGroup() {
      const {
        expireCaveatGroup,
        interfaceCaveatGroup,
        asnCaveatGroup,
        ipCaveatGroup,
        regionCaveatGroup,
        countryCaveatGroup,
        objectIdCaveatGroup,
      } = this.getProperties(
        'expireCaveatGroup',
        'interfaceCaveatGroup',
        'asnCaveatGroup',
        'ipCaveatGroup',
        'regionCaveatGroup',
        'countryCaveatGroup',
        'objectIdCaveatGroup'
      );

      return FormFieldsGroup.create({
        name: 'caveats',
        fields: [
          expireCaveatGroup,
          interfaceCaveatGroup,
          asnCaveatGroup,
          ipCaveatGroup,
          regionCaveatGroup,
          countryCaveatGroup,
          objectIdCaveatGroup,
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
          name: 'validUntil',
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

  interfaceCaveatGroup: computed(function interfaceCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'interfaceCaveat',
      fields: [
        CaveatGroupToggle.create({
          name: 'interfaceEnabled',
        }),
        RadioField.extend({
          isVisible: reads(
            'valuesSource.caveats.interfaceCaveat.interfaceEnabled'
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
            'valuesSource.caveats.interfaceCaveat.interfaceEnabled'
          ),
        }).create({
          name: 'interfaceDisabledText',
        }),
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

  regionCaveatGroup: computed(function regionCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'regionCaveat',
      fields: [
        CaveatGroupToggle.create({ name: 'regionEnabled' }),
        TagsField.extend({
          isVisible: reads(
            'valuesSource.caveats.regionCaveat.regionEnabled'
          ),
          allowedTags: computed('i18nPrefix', 'path', function () {
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
          }),
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
          name: 'region',
          tagEditorComponentName: 'tags-input/selector-editor',
          defaultValue: [],
          sort: true,
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
        TagsField.extend({
          isVisible: reads(
            'valuesSource.caveats.countryCaveat.countryEnabled'
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
          name: 'country',
          tagEditorSettings: {
            // Only ASCII letters are allowed. See ISO 3166-1 Alpha-2 codes documentation
            regexp: /^[a-zA-Z]{2}$/,
          },
          defaultValue: [],
          sort: true,
        }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.countryCaveat.countryEnabled'
          ),
        }).create({ name: 'countryDisabledText' }),
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
            'valuesSource.caveats.objectIdCaveat.objectIdEnabled'
          ),
          fieldFactoryMethod(createdFieldsCounter) {
            return TextField.create({
              value: 'objectIdEntry',
              valueName: `objectIdEntry${createdFieldsCounter}`,
            });
          },
        }).create({
          name: 'objectId',
        }),
        StaticTextField.extend({
          isVisible: not(
            'valuesSource.caveats.objectIdCaveat.objectIdEnabled'
          ),
        }).create({ name: 'objectIdDisabledText' }),
      ],
    });
  }),

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
      invalidFields: invalidFields.mapBy('path'),
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

    return records
      .then(records => get(records, 'list'))
      .then(recordsList => recordsList.sortBy('name'))
      .then(recordsList => recordsList.map(record => ({
        value: record,
        label: get(record, 'name'),
        icon: oneiconAlias.getName(modelName),
      })));
  },

  // willDestroyElement() {
  //   this._super(...arguments);
  //   debugger;
  // }
});
