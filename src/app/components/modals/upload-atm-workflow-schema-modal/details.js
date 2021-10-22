import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { isEmpty } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  classNames: ['details'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.uploadAtmWorkflowSchemaModal.details',

  /**
   * @type {Object}
   */
  dump: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('dump.name'),

  /**
   * @type {ComputedProperty<String>}
   */
  revisionNumber: reads('dump.initialRevision.originalRevisionNumber'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isNameUnknown: isEmpty('name'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isRevisionNumberUnknown: isEmpty('revisionNumber'),
});
