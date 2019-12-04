import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, get, observer } from '@ember/object';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import { equal, raw } from 'ember-awesome-macros';

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
  fields: computed(function fields() {
    const i18nPrefix = this.get('i18nPrefix');
    const component = this;

    const inviteTargetDetailsGroup = FormFieldsGroup.extend({
      isExpanded: computed(
        'valuesSource.basic.inviteDetails.subtype',
        function isExpanded() {
          const subtype =
            this.get('valuesSource.basic.inviteDetails.subtype');
          return getTargetModelNameForSubtype(subtype);
        },
      ),
    }).create({
      name: 'inviteTargetDetails',
      fields: [
        DropdownField.extend({
          subtype: undefined,
          targetModelName: undefined,
          label: computed('subtype', 'path', function label() {
            const {
              subtype,
              path,
            } = this.getProperties('subtype', 'path');
            return subtype && this.t(`${path}.label.${subtype}`);
          }),
          placeholder: computed('subtype', 'path', function placeholder() {
            const {
              subtype,
              path,
            } = this.getProperties('subtype', 'path');
            return subtype && this.t(`${path}.placeholder.${subtype}`);
          }),
          subtypeObserver: observer(
            'valuesSource.basic.inviteDetails.subtype',
            function subtypeObserver() {
              const subtype =
                this.get('valuesSource.basic.inviteDetails.subtype');
              const targetModelName =
                getTargetModelNameForSubtype(subtype);
              if (targetModelName) {
                this.enable();
                this.set('subtype', subtype);
                if (this.get('targetModelName') !== targetModelName) {
                  this.setProperties({
                    targetModelName,
                    options: component
                      .getTargetOptionsForModel(targetModelName),
                  });
                  this.reset();
                }
              } else {
                this.disable();
              }
            }
          ),
          init() {
            this._super(...arguments);
            this.subtypeObserver();
          },
        }).create({
          name: 'target',
        }),
      ],
    });

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
          FormFieldsGroup.create({
            name: 'basic',
            fields: [
              TextField.create({
                name: 'name',
              }),
              RadioField.create({
                name: 'type',
                options: [
                  { value: 'access' },
                  { value: 'invite' },
                ],
                defaultValue: 'access',
              }),
              FormFieldsGroup.extend({
                isExpanded: equal(
                  'valuesSource.basic.type',
                  raw('invite')
                ),
              }).create({
                name: 'inviteDetails',
                fields: [
                  DropdownField.create({
                    name: 'subtype',
                    options: tokenSubtypeOptions,
                    defaultValue: 'userJoinGroup',
                  }),
                  inviteTargetDetailsGroup,
                ],
              }),
            ],
          }),
        ],
      });
  }),

  notifyAboutChange() {
    const {
      fields,
      onChange,
    } = this.getProperties('fields', 'onChange');

    onChange({
      values: fields.dumpValue(),
      isValid: get(fields, 'isValid'),
      invalidFields: get(fields, 'invalidFields').mapBy('path'),
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
