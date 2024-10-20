/**
 * Single space item in the Space Marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';
import { or, and, raw } from 'ember-awesome-macros';
import { htmlSafe } from '@ember/string';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import sleep from 'onedata-gui-common/utils/sleep';
import globalCssVariablesManager from 'onedata-gui-common/utils/global-css-variables-manager';
import { MarketplaceSpaceStatus } from 'onezone-gui/utils/spaces-marketplace-item';

/**
 * Time in which the item should change attention color in milliseconds to normal
 * color.
 * @type {number}
 */
export const attentionTransitionTime = 2000;

globalCssVariablesManager.setVariable(
  'components/content-spaces-marketplace/item',
  '--spaces-marketplace-item-attention-transition-time',
  `${attentionTransitionTime}ms`,
);

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: [
    'spaces-marketplace-item',
    'iconified-block',
    'modern-iconified-block',
    // implements infinite scroll list row
    'data-row',
  ],
  classNameBindings: ['iconifiedBlockClass'],
  attributeBindings: ['id:data-row-id'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.item',

  router: service(),
  spaceActions: service(),
  currentUser: service(),
  guiUtils: service(),
  media: service(),

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceItem}
   */
  spaceItem: undefined,

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  /**
   * Time in which the item should be colored for attention in milliseconds.
   * After this time, the transition to normal colors is started (which is not immediate,
   * but is animated by CSS).
   * @type {number}
   */
  attentionColorTime: 2000,

  //#region state

  /**
   * The access has been requested in current component instance.
   * It is stored as component state, because there is currently no such state in model.
   * @type {boolean}
   */
  isRequested: false,

  isAnimating: false,

  iconifiedBlockClass: 'iconified-block-marketplace-available',

  MarketplaceSpaceStatusEnum: MarketplaceSpaceStatus,

  //#endregion

  /**
   * @type {ComputedProperty<number>}
   */
  tagsLimit: or(
    and('media.isMobile', raw(4)),
    and('media.isTablet', raw(6)),
    raw(12),
  ),

  spaceName: reads('spaceItem.name'),

  /**
   * Implements `id` property for use in infinite scroll (in pair to `id` of
   * `Utils.SpacesMarketplaceItem`).
   * @type {string}
   */
  id: reads('spaceItem.id'),

  isAccessGrantedProxy: reads('spaceItem.isAccessGrantedProxy'),

  isAccessGranted: reads('isAccessGrantedProxy.content'),

  organizationName: reads('spaceItem.organizationName'),

  creationTime: reads('spaceItem.creationTime'),

  status: reads('spaceItem.marketplaceSpaceStatusProxy.content'),

  creationDateText: computed('creationTime', function creationDateText() {
    return makeSpacesNonBreakable(
      dateFormat([this.creationTime], {
        format: 'date',
      })
    );
  }),

  tags: computed('spaceItem.tags', function tags() {
    return this.spaceItem.tags?.map(tagName => ({
      label: tagName,
    })) || [];
  }),

  visitSpaceHref: computed(
    'spaceItem.spaceMarketplaceInfo.entityId',
    function visitSpaceHref() {
      return this.router.urlFor(
        'onedata.sidebar.content.aspect',
        'spaces',
        this.guiUtils.getRoutableIdFor(this.spaceItem.spaceMarketplaceInfo),
        'index',
      );
    }
  ),

  configureSpaceHref: computed(
    'spaceItem.spaceMarketplaceInfo.entityId',
    function configureSpaceHref() {
      return this.router.urlFor(
        'onedata.sidebar.content.aspect',
        'spaces',
        this.guiUtils.getRoutableIdFor(this.spaceItem.spaceMarketplaceInfo),
        'configuration',
      );
    }
  ),

  lastActivityDateText: computed(
    'spaceItem.itemRequestInfo.requestInfo.lastActivity',
    function lastActivityDateText() {
      const lastActivity = this.spaceItem?.itemRequestInfo?.requestInfo?.lastActivity;
      if (!lastActivity) {
        return '';
      }
      return makeSpacesNonBreakable(dateFormat([lastActivity], {
        format: 'dateWithMinutes',
      }));
    }
  ),

  againRequestDateText: computed(
    'spaceItem.itemRequestInfo.requestInfo.lastActivity',
    'viewModel.marketplaceConfig.minBackoffAfterRejection',
    function againRequestDateText() {
      const lastActivity = this.spaceItem?.itemRequestInfo?.requestInfo?.lastActivity;
      const minBackoff = this.viewModel.marketplaceConfig?.minBackoffAfterRejection;
      if (
        !lastActivity ||
        !minBackoff ||
        this.spaceItem.itemRequestInfo.collectionName !== 'rejected'
      ) {
        return '';
      }
      return makeSpacesNonBreakable(dateFormat([lastActivity + minBackoff], {
        format: 'dateWithMinutes',
      }));
    }
  ),

  lastRequesterEmail: reads('spaceItem.itemRequestInfo.requestInfo.contactEmail'),

  accessInfoColClassName: computed('status', function accessInfoColClassName() {
    if (!this.status) {
      return '';
    }
    return `access-info-col-${this.status}`;
  }),

  accessColorsSetter: observer('isAccessGranted', function accessColorsSetter() {
    if (!this.isAnimating && typeof this.isAccessGranted === 'boolean') {
      this.setAccessColors();
    }
  }),

  init() {
    this._super(...arguments);
    if (this.viewModel.selectedSpaceInfo?.consumeShouldBlink(this.id)) {
      this.animateAttention();
    } else if (this.isAccessGrantedProxy.isSettled) {
      this.accessColorsSetter();
    }
  },

  setAccessColors(additionalClassName = '') {
    this.set(
      'iconifiedBlockClass',
      (
        this.isAccessGranted ?
        'iconified-block-marketplace-access-granted' :
        'iconified-block-marketplace-available'
      ) + ' ' + additionalClassName
    );
  },

  async animateAttention() {
    if (this.isAnimating) {
      return;
    }
    try {
      this.setProperties({
        isAnimating: true,
        iconifiedBlockClass: 'iconified-block-marketplace-attention',
      });
      await waitForRender();
      await sleep(this.attentionColorTime || 0);
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      this.setAccessColors('iconified-block-marketplace-transitionable');
      await sleep(attentionTransitionTime);
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      // remove transitionable class
      this.setAccessColors();
    } finally {
      if (!this.isDestroyed && !this.isDestroying) {
        this.set('isAnimating', false);
      }
    }
  },

  actions: {
    requestAccess() {
      this.spaceActions.createRequestSpaceAccessAction({
        spaceMarketplaceData: this.spaceItem,
      }).execute();
    },
  },
});

function makeSpacesNonBreakable(text) {
  return htmlSafe(text.replaceAll(' ', '&nbsp;'));
}
