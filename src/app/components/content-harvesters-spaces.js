/**
 * A component that shows spaces attached to harvester
 *
 * @module components/content-harvesters-spaces
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['content-harvesters-spaces'],

  harvesterActions: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersSpaces',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @type {Model.Space|null}
   */
  spaceToRemove: null,

  /**
   * @type {boolean}
   */
  isRemovingSpace: false,

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Model.Space>>}
   */
  spacesProxy: computed('harvester', function spacesProxy() {
    const harvester = this.get('harvester');
    return PromiseArray.create({
      promise: get(harvester, 'spaceList').then(sl => get(sl, 'list')),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeSpaceAction: computed(function removeSpaceAction() {
    return {
      action: space => this.set('spaceToRemove', space),
      title: this.t('removeThisSpace'),
      class: 'remove-space',
      icon: 'close',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  spaceActions: collect('removeSpaceAction'),

  actions: {
    removeSpace() {
      this.set('isRemovingSpace', true);
      const {
        spaceToRemove,
        harvester,
        harvesterActions,
      } = this.getProperties('spaceToRemove', 'harvester', 'harvesterActions');
      harvesterActions.removeSpaceFromHarvester(harvester, spaceToRemove)
        .finally(() =>
          safeExec(this, 'setProperties', {
            isRemovingSpace: false,
            spaceToRemove: null,
          })
        );
    },
  },
});
