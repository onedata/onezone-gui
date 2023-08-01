/**
 * FIXME: doc
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { conditional, raw, isEmpty, and } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { SpaceTag } from './space-configuration/space-tags-selector';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.spaceMarketplaceTile',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  tileClassNames: Object.freeze(['space-marketplace-tile', 'text-center']),

  tileClass: computed('tileClassNames', function tileClass() {
    return this.tileClassNames?.join(' ') ?? '';
  }),

  // FIXME: sprawdzić na production
  imageSrc: conditional(
    'space.advertisedInMarketplace',
    raw('assets/images/cart-checked.svg'),
    raw('assets/images/cart-disabled.svg'),
  ),

  spaceId: reads('space.entityId'),

  isConfigureButtonShown: and(
    'space.privileges.update',
    'space.privileges.manageInMarketplace',
  ),

  footerLinkToParams: computed('spaceId', function footerLinkToParams() {
    return ['onedata.sidebar.content.aspect', 'spaces', this.spaceId, 'configuration'];
  }),

  figureBottomText: conditional(
    'space.advertisedInMarketplace',
    computedT('advertised'),
    computedT('notAdvertised')
  ),

  figureBottomTextClass: conditional(
    'space.advertisedInMarketplace',
    raw('advertised'),
    raw('not-advertised'),
  ),
});
