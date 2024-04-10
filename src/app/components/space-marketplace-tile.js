/**
 * Shows information about space status in Marketplace with links.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { conditional, raw, and, collect } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { inject as service } from '@ember/service';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

export default Component.extend(I18n, {
  tagName: '',

  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceMarketplaceTile',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onDismiss: undefined,

  tileClassNames: collect(
    raw('space-marketplace-tile'),
    raw('text-center'),
    'advertisedClass',
  ),

  tileClass: computed('tileClassNames', function tileClass() {
    return this.tileClassNames?.join(' ') ?? '';
  }),

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

  isAdvertised: reads('space.advertisedInMarketplace'),

  figureBottomText: conditional(
    'isAdvertised',
    computedT('advertised'),
    computedT('notAdvertised')
  ),

  advertisedClass: conditional(
    'isAdvertised',
    raw('advertised'),
    raw('not-advertised'),
  ),

  viewInMarketplaceHref: computed('spaceId', function viewInMarketplaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content',
      'spaces',
      'join', {
        queryParams: {
          options: serializeAspectOptions({
            selectedSpace: this.spaceId,
          }),
        },
      }
    );
  }),

  actions: {
    dismiss() {
      this?.onDismiss();
    },
  },
});
