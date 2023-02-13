/**
 * Single space item in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';
import { or, and, raw, gt, difference } from 'ember-awesome-macros';
import { htmlSafe } from '@ember/string';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: ['spaces-marketplace-item', 'iconified-block'],
  classNameBindings: [
    'isAccessGranted:iconified-block-marketplace-access-granted:iconified-block-marketplace-available',
  ],
  attributeBindings: ['spaceId:data-space-id'],

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
   * @type {number}
   */
  tagsLimit: or(
    and('media.isMobile', raw(4)),
    and('media.isTablet', raw(6)),
    raw(12),
  ),

  //#region state

  /**
   * The access has been requested in current component instance.
   * It is stored as component state, because there is currently no such state in model.
   * @type {boolean}
   */
  isRequested: false,

  isDescriptionExpanded: false,

  //#endregion

  spaceName: reads('spaceItem.name'),

  spaceId: reads('spaceItem.entityId'),

  isAccessGranted: reads('spaceItem.isAccessGranted'),

  organizationName: reads('spaceItem.organizationName'),

  creationTime: reads('spaceItem.creationTime'),

  creationDateText: computed('creationTime', function creationDateText() {
    return htmlSafe(
      dateFormat([this.creationTime], {
        format: 'date',
      })
      .replaceAll(' ', '&nbsp;')
    );
  }),

  creationTimeTooltip: computed('creationTime', function creationTimeTooltip() {
    const creationTimeText = htmlSafe(
      dateFormat([this.creationTime], {
        format: 'dateWithMinutes',
      })
      .replaceAll(' ', '&nbsp;')
    );
    return this.t('creationTimeTooltip', { creationTimeText });
  }),

  tags: computed('spaceItem.tags', function tags() {
    return this.spaceItem.tags.map(tagName => ({
      label: tagName,
    }));
  }),

  tagsLimitExceeded: gt('tags.length', 'tagsLimit'),

  tagsDisplayedOnLimitExceed: difference('tagsLimit', 1),

  limitedTags: computed(
    'tagsLimitExceeded',
    'tagsDisplayedOnLimitExceed',
    function limitedTags() {
      if (this.tagsLimitExceeded) {
        return this.tags.slice(0, this.tagsDisplayedOnLimitExceed);
      } else {
        return this.tags;
      }
    }
  ),

  moreTags: computed(
    'tagsLimitExceeded',
    'tagsDisplayedOnLimitExceed',
    function moreTags() {
      if (this.tagsLimitExceeded) {
        return this.tags.slice(this.tagsDisplayedOnLimitExceed);
      } else {
        return [];
      }
    }
  ),

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

  actions: {
    requestAccess() {
      (async () => {
        const result = await this.spaceActions.createRequestSpaceAccessAction({
          spaceMarketplaceData: this.spaceItem.spaceMarketplaceInfo,
        }).execute();
        if (result.status === 'done') {
          this.set('isRequested', true);
        }
      })();
    },
  },
});
