import Component from '@ember/component';
import { ResourceListItem } from 'onedata-gui-common/components/resources-list';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { promise } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const HarvesterListItem = ResourceListItem.extend(OwnerInjector, {
  oneiconAlias: service(),
  spaceActions: service(),

  /**
   * @virtual
   */
  harvester: undefined,

  /**
   * @virtual
   */
  parentSpace: undefined,

  /**
   * @override
   */
  label: reads('harvester.name'),

  /**
   * @override
   */
  conflictingLabelSource: reads('harvester'),

  /**
   * @override
   */
  icon: computed(function icon() {
    return this.get('oneiconAlias').getName('harvester');
  }),

  /**
   * @override
   */
  actions: computed('parentSpace', 'harvester', function actions() {
    const {
      spaceActions,
      parentSpace,
      harvester,
    } = this.getProperties('spaceActions', 'parentSpace', 'harvester');
    return [spaceActions.createRemoveHarvesterFromSpaceAction({
      space: parentSpace,
      harvester,
    })];
  }),
});

export default Component.extend(I18n, {
  classNames: ['content-spaces-harvesters'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesHarvesters',

  /**
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * @type {ComputedProperty<PromiseArray<Models.Harvester>>}
   */
  spaceHarvestersProxy: promise.array(computed('space', function spaceHarvestersProxy() {
    const space = this.get('space');
    if (space) {
      return get(space, 'harvesterList')
        .then(harvesterList => get(harvesterList, 'list'));
    } else {
      return resolve([]);
    }
  })),

  /**
   * @type {ComputedProperty<Array<HarvesterListItem>>}
   */
  harvesterItems: computed('spaceHarvestersProxy.[]', function harvesterItems() {
    const harvesters = this.get('spaceHarvestersProxy.content') || [];
    const space = this.get('space');
    return harvesters.map(harvester => HarvesterListItem.create({
      ownerSource: this,
      parentSpace: space,
      harvester,
    }));
  }),
});
