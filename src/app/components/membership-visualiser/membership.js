/**
 * A component, that shows one membership entry. Is used internally by
 * membership-visualiser component.
 *
 * @module components/membership-visualiser/membership
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import MembershipRelation from 'onedata-gui-websocket-client/utils/membership-relation';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';

export default Component.extend(I18n, {
  classNames: ['membership'],
  classNameBindings: [
    'isFilteredOut:filtered-out',
    'showDescription:with-description',
  ],

  store: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membership',

  /**
   * @type {User|Group}
   * @virtual
   */
  pathStart: null,

  /**
   * @type {MembershipPath}
   * @virtual
   */
  path: null,

  /**
   * @type {string}
   * @virtual
   */
  searchString: '',

  /**
   * Max number of blocks, that will be rendered in membership path.
   * 0 means no limit.
   * @type {number}
   */
  visibleBlocks: 0,

  /**
   * Step size used to scroll by arrow buttons.
   * @type {number}
   */
  scrollMoveStep: 300,

  /**
   * Redirects to record dedicated page
   * @type {Function}
   * @virtual
   * @param {GraphSingleModel} record
   * @returns {undefined}
   */
  view: notImplementedThrow,

  /**
   * Shows privileges editor
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  modifyPrivileges: notImplementedThrow,

  /**
   * Triggers relation removing
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  removeRelation: notImplementedThrow,

  /**
   * @virtual
   * @type {boolean}
   */
  showDescription: false,

  /**
   * If true, left scroll arrow button is visible.
   * @type {boolean}
   */
  scrollLeftButton: true,

  /**
   * If true, right scroll arrow button is visible.
   * @type {boolean}
   */
  scrollRightButton: true,

  /**
   * @type {Ember.ComputedProperty<PromiseArray<GraphSingleModel>>}
   */
  recordsProxy: reads('path.model'),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  pathElements: computed(
    'recordsProxy.isFulfilled',
    'visibleBlocks',
    function pathElements() {
      const {
        recordsProxy,
        pathStart,
        visibleBlocks,
      } = this.getProperties('recordsProxy', 'pathStart', 'visibleBlocks');
      if (get(recordsProxy, 'isFulfilled')) {
        // Path is built from the end to the beginning, because some of the first
        // elements can by joined into one "more" block at the end.
        const reversedRecords = [pathStart].concat(get(recordsProxy, 'content')).reverse();
        const blocks = [];
        let blocksLength = 0;
        while (
          (blocksLength < visibleBlocks || visibleBlocks === 0) &&
          get(reversedRecords, 'length') > 0
        ) {
          const reversedRecordsLength = get(reversedRecords, 'length');
          if (blocksLength === visibleBlocks - 1 && reversedRecordsLength > 1) {
            blocks.unshift({
              id: 'more',
              type: 'more',
              number: reversedRecordsLength,
            });
          } else {
            const record = reversedRecords.shift();
            blocks.unshift({
              id: 'block|' + get(record, 'gri'),
              type: 'block',
              record,
            });
          }
          blocksLength++;
        }
        let prevBlock = blocks[0];
        const elements = [blocks[0]];
        blocks.slice(1).forEach(block => {
          const isPrevMore = get(prevBlock, 'type') === 'more';
          elements.push({
            id: `relation|${isPrevMore ? 'more' : get(prevBlock, 'record.gri')}|` +
              `${get(block, 'record.gri')}`,
            type: 'relation',
            // there is no logical relation with block "more" - null
            relation: isPrevMore ? null : MembershipRelation.create({
              parent: get(block, 'record'),
              child: get(prevBlock, 'record'),
            }),
          }, block);
          prevBlock = block;
        });
        return elements;
      } else {
        return [];
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  membershipDescription: computed(
    'recordsProxy.content.@each.{name,entityType}',
    'pathStart.{name,entityType}',
    function membershipDescription() {
      const recordsProxy = this.get('recordsProxy');
      if (get(recordsProxy, 'isFulfilled')) {
        const pathStart = this.get('pathStart');
        const elementsNumber = get(recordsProxy, 'length');
        const pathStartType = this.t(get(pathStart, 'entityType'));
        const pathStartName = get(pathStart, 'name');
        let description = this.t('descBeginning', {
          pathStartType: _.upperFirst(pathStartType),
          pathStartName,
        });
        let nextTranslation = 'descPathFirstElement';
        let prevElement = pathStart;
        recordsProxy.forEach(element => {
          let membershipType = '';
          let elementType = get(element, 'entityType');
          const elementName = get(element, 'name');
          if (
            elementType === 'group' &&
            get(prevElement, 'entityType') === 'group'
          ) {
            membershipType = this.t('descSubgroupType');
          }
          if (elementType === 'provider') {
            description += this.t('descSpaceSupportedBy', {
              elementName,
            });
          }
          elementType = this.t(elementType);
          description += this.t(nextTranslation, {
            membershipType,
            elementType,
            elementName,
          });
          prevElement = element;
          nextTranslation = 'descPathCentralElement';
        });
        description += '.';

        const lastElement = recordsProxy.objectAt(elementsNumber - 1);
        const pathEndType = this.t(get(lastElement, 'entityType'));
        const pathEndName = get(lastElement, 'name');
        if (elementsNumber > 1) {
          const translation = get(lastElement, 'entityType') === 'provider' ?
            'descSummaryProvider' : 'descSummary';
          description += this.t(translation, {
            pathStartType,
            pathStartName,
            pathEndType,
            pathEndName,
          });
        }
        return description;
      } else {
        return '';
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFilteredOut: reads('path.isFilteredOut'),

  didInsertElement() {
    this._super(...arguments);
    this.get('recordsProxy').then(() => {
      next(() => safeExec(this, 'recalculateScrollButtonsVisibility'));
    });
  },

  getScrollContainer() {
    return this.$().children('.ps-container');
  },

  recalculateScrollButtonsVisibility() {
    const element = this.getScrollContainer()[0];
    const detectionEpsilon = 3;
    this.setProperties({
      scrollLeftButton: element.scrollLeft > detectionEpsilon,
      scrollRightButton: element.offsetWidth + element.scrollLeft < element.scrollWidth -
        detectionEpsilon,
    });
  },

  actions: {
    pan(deltaX) {
      const scrollContainer = this.getScrollContainer();
      if (scrollContainer) {
        scrollContainer.scrollLeft(scrollContainer.scrollLeft() + deltaX);
      }
    },
    scroll() {
      this.recalculateScrollButtonsVisibility();
    },
    moveLeft() {
      const element = this.getScrollContainer();
      element.scrollLeft(element.scrollLeft() - this.get('scrollMoveStep'));
    },
    moveRight() {
      const element = this.getScrollContainer();
      element.scrollLeft(element.scrollLeft() + this.get('scrollMoveStep'));
    },
  },
});
