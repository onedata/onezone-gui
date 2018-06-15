/**
 * A privileges aspect of space.
 *
 * @module components/content-spaces-members
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import PrivilegesAspectBase from 'onezone-gui/mixins/privileges-aspect-base';
import layout from 'onezone-gui/templates/components/-privileges-aspect-base';

export default Component.extend(I18n, GlobalActions, PrivilegesAspectBase, {
  layout,
  classNames: ['privileges-aspect-base', 'content-spaces-members'],

  i18n: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMembers',

  /**
   * @override
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * @override
   */
  modelType: 'space',

  /**
   * @override
   */
  model: reads('space'),

  /**
   * @override
   */
  privilegesTranslationsPath: computed('i18nPrefix', function () {
    return this.get('i18nPrefix') + '.privileges';
  }),

  /**
   * @override
   */
  privilegeGroupsTranslationsPath: computed('i18nPrefix', function () {
    return this.get('i18nPrefix') + '.privilegeGroups';
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<string>}
   */
  globalActionsTitle: computed(function () {
    return this.t('spacePrivileges');
  }),

  /**
   * @override 
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: computed('inviteActions', 'batchEditAction', function () {
    const {
      inviteActions,
      batchEditAction,
    } = this.getProperties('inviteActions', 'batchEditAction');
    return [batchEditAction, ...inviteActions];
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  headerActions: reads('inviteActions'),
});
