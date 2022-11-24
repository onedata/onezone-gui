/**
 * FIXME: doc
 * A configuration aspect of space.
 *
 * @module components/content-spaces-members
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import MembersAspectBase from 'onezone-gui/mixins/members-aspect-base';
import { Promise } from 'rsvp';
import { collect, computed } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  classNames: ['content-spaces-configuration'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesConfiguration',

  // FIXME: move to content spaces marketplace
  // advertiseMySpaceAction: computed(function advertiseMySpaceAction() {
  //   return {
  //     // FIXME: implement
  //     action: () => {},
  //     title: this.t('advertiseMySpace'),
  //     class: 'view-options-action',
  //     icon: 'marketplace-space',
  //   };
  // }),

  // globalActions: collect('advertiseMySpaceAction'),
});
