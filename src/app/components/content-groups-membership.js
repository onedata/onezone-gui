/**
 * TODO: This component is temporary. All membership content will be moved to the
 * "Members" aspect.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import MembershipAspectBase from 'onezone-gui/mixins/membership-aspect-base';
import { reads } from '@ember/object/computed';
import layout from 'onezone-gui/templates/components/-membership-aspect-base';

export default Component.extend(MembershipAspectBase, I18n, {
  layout,
  classNames: ['membership-aspect-base', 'content-groups-membership'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembership',

  /**
   * @type {Group}
   */
  targetRecord: reads('group'),
});
