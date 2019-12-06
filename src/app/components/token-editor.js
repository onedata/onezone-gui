import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, get, getProperties, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import { equal, raw, not } from 'ember-awesome-macros';
import moment from 'moment';

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
          isVisible: equal('valuesSource.basic.type', raw('invite')),
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
        isVisible: computed('subtype', function isVisible() {
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

  caveatsGroup: computed('expireCaveatGroup', function caveatsGroup() {
    const {
      expireCaveatGroup,
    } = this.getProperties('expireCaveatGroup');
    return FormFieldsGroup.create({
      name: 'caveats',
      fields: [
        expireCaveatGroup,
      ],
    });
  }),

  expireCaveatGroup: computed(function expireCaveatGroup() {
    return CaveatFormGroup.create({
      name: 'expire',
      fields: [
        CaveatGroupToggle.create({
          name: 'expireEnabled',
          defaultValue: false,
        }),
        DatetimeField.extend({
          isVisible: reads('valuesSource.caveats.expire.expireEnabled'),
        }).create({
          name: 'validUntil',
          defaultValue: moment().add(1, 'day').endOf('day').toDate(),
        }),
        StaticTextField.extend({
          isVisible: not('valuesSource.caveats.expire.expireEnabled'),
        }).create({
          name: 'expireDisabledText',
        }),
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
