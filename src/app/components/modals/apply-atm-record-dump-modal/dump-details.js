/**
 * Shows information about automation record dump.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { or, isEmpty } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  classNames: ['dump-details'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.applyAtmRecordDumpModal.dumpDetails',

  /**
   * @virtual
   * @type {DumpableAtmModelName}
   */
  atmModelName: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  dump: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  name: or(
    'dump.revision.atmLambdaRevision.name',
    'dump.revision.atmLambdaRevision._data.name',
    'dump.name'
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  summary: or(
    'dump.revision.atmLambdaRevision.summary',
    'dump.revision.atmLambdaRevision._data.summary',
    'dump.summary'
  ),

  /**
   * @type {ComputedProperty<RevisionNumber>}
   */
  revisionNumber: reads('dump.revision.originalRevisionNumber'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isNameUnknown: isEmpty('name'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isSummaryUnknown: isEmpty('summary'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isRevisionNumberUnknown: isEmpty('revisionNumber'),
});
