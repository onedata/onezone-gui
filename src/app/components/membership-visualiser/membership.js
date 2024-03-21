/**
 * A component, that shows one membership entry. Is used internally by
 * membership-visualiser component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads, gt } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import MembershipRelation from 'onedata-gui-websocket-client/utils/membership-relation';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';
import $ from 'jquery';

export default Component.extend(I18n, {
  classNames: ['membership-row', 'membership'],
  classNameBindings: [
    'isFilteredOut:filtered-out',
    'showDescription:with-description',
    'isHighlighted:highlighted',
    'longPath',
  ],

  currentUser: service(),
  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membership',

  /**
   * @type {Array<string>}
   * @virtual
   */
  highlightedMembers: undefined,

  /**
   * @type {User|Group}
   * @virtual
   */
  pathStart: null,

  /**
   * @type {Utils/MembershipVisualiser/MembershipPath}
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
   * @type {boolean}
   */
  isCondensed: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  currentUserId: reads('currentUser.userId'),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<GraphSingleModel>>}
   */
  recordsProxy: reads('path.model'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFilteredOut: reads('path.isFilteredOut'),

  /**
   * True when path is an effective (indirect) path.
   * @type {Ember.ComputedProperty<boolean>}
   */
  longPath: gt('recordsProxy.length', 1),

  /**
   * @type {boolean}
   */
  isHighlighted: computed('highlightedMembers', 'path.griPath', function isHighlighted() {
    if (!this.highlightedMembers) {
      return false;
    }
    if (this.path.griPath.length < 2) {
      return this.highlightedMembers.includes(this.path.griPath.firstObject);
    } else {
      return this.highlightedMembers.includes(
        this.path.griPath[this.path.griPath.length - 2]
      );
    }
  }),

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
        currentUserId,
        recordManager,
      } = this.getProperties(
        'recordsProxy',
        'pathStart',
        'visibleBlocks',
        'currentUserId',
        'recordManager'
      );
      if (get(recordsProxy, 'isFulfilled')) {
        // Path is built from the end to the beginning, because some of the first
        // elements can by joined into one "more" block at the end.
        const reversedRecords = get(recordsProxy, 'content').slice(0).reverse();
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
            if (record) {
              blocks.unshift({
                id: 'block|' + get(record, 'gri'),
                type: 'block',
                record,
              });
            } else {
              // empty block means, that this part of path cannot be fetched
              // due to the lack of privileges
              blocks.unshift({
                id: 'forbidden',
                type: 'forbidden',
              });
            }
          }
          blocksLength++;
        }
        blocks.unshift({
          id: 'block|' + get(pathStart, 'gri'),
          type: 'block',
          record: pathStart,
        });
        let prevBlock = blocks[0];
        const elements = [blocks[0]];
        blocks.slice(1).forEach(block => {
          const isPrevBlock = get(prevBlock, 'type') === 'block';
          const isThisBlock = get(block, 'type') === 'block';
          const child = get(prevBlock, 'record');
          const isChildCurrentUser = Boolean(child) &&
            recordManager.getModelNameForRecord(child) === 'user' &&
            get(child, 'entityId') === currentUserId;
          elements.push({
            id: this.getPathRelationId(prevBlock, block),
            type: 'relation',
            relation: !isPrevBlock || !isThisBlock ?
              null : MembershipRelation.create({
                parent: get(block, 'record'),
                child,
                isChildCurrentUser,
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
    'recordsProxy.content.@each.name',
    'pathStart.name',
    function membershipDescription() {
      const {
        recordsProxy,
        recordManager,
      } = this.getProperties('recordsProxy', 'recordManager');
      if (get(recordsProxy, 'isFulfilled')) {
        const pathStart = this.get('pathStart');
        const elementsNumber = get(recordsProxy, 'length');
        const pathStartType = this.t(recordManager.getModelNameForRecord(pathStart));
        const pathStartName = get(pathStart, 'name');
        let description = this.t('descBeginning', {
          pathStartType: _.upperFirst(pathStartType),
          pathStartName,
        });
        let nextTranslation = 'descPathFirstElement';
        let prevElement = pathStart;
        for (let i = 0; i < elementsNumber; i++) {
          const element = recordsProxy.objectAt(i);
          if (!element) {
            let nonEmptyElement;
            let j;
            for (j = i + 1; j < elementsNumber; j++) {
              const thisElement = recordsProxy.objectAt(j);
              if (thisElement) {
                nonEmptyElement = thisElement;
                break;
              }
            }
            const translation = i == 0 || (i >= 2 && !recordsProxy.objectAt(i - 2)) ?
              'descPathIsEffectiveMember' : 'descPathCentralIsEffectiveMember';
            const nonEmptyElementModelName =
              recordManager.getModelNameForRecord(nonEmptyElement);
            description += this.t(translation, {
              elementType: nonEmptyElementModelName,
              elementName: get(nonEmptyElement, 'name'),
            });
            i = j;
            if (i < elementsNumber - 1) {
              description += '. ' + this.t('descBeginning', {
                pathStartType: _.upperFirst(
                  this.t(nonEmptyElementModelName)
                ),
                pathStartName: get(nonEmptyElement, 'name'),
              });
              nextTranslation = 'descPathFirstElement';
            }
          } else {
            let membershipType = '';
            let elementType = recordManager.getModelNameForRecord(element);
            const elementName = get(element, 'name');
            if (
              elementType === 'group' &&
              recordManager.getModelNameForRecord(prevElement) === 'group'
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
          }
        }
        description += '.';

        const lastElement = recordsProxy.objectAt(elementsNumber - 1);
        const lastElementModelName = recordManager.getModelNameForRecord(lastElement);
        const pathEndType = this.t(lastElementModelName);
        const pathEndName = get(lastElement, 'name');
        if (elementsNumber > 1) {
          const translation = lastElementModelName === 'provider' ?
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

  didInsertElement() {
    this._super(...arguments);
    this.get('recordsProxy').then(() => {
      next(() => safeExec(this, 'recalculateScrollButtonsVisibility'));
    });
  },

  getScrollContainer() {
    return $(this.get('element')).children('.ps');
  },

  recalculateScrollButtonsVisibility() {
    const element = this.getScrollContainer()[0];
    const detectionEpsilon = 3;
    this.setProperties({
      scrollLeftButton: element.scrollLeft > detectionEpsilon,
      scrollRightButton: element.offsetWidth + element.scrollLeft <
        element.scrollWidth - detectionEpsilon,
    });
  },

  getPathRelationId(prevBlock, block) {
    const leftBlockId = get(prevBlock, 'type') !== 'block' ?
      get(prevBlock, 'type') : get(prevBlock, 'record.gri');
    const rightBlockId = get(block, 'type') !== 'block' ?
      get(prevBlock, 'type') : get(prevBlock, 'record.gri');
    return `relation|${leftBlockId}|` + `${rightBlockId}`;
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
