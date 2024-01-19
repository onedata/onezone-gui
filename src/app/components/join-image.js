/**
 * Image with names and IDs showing that some `joiningRecord` wants to join to some
 * `inviteTarget`.
 *
 * @author Jakub Liput, Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import {
  raw,
  getBy,
} from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { dasherize } from '@ember/string';

const recordImages = {
  user: 'assets/images/consume-token/user.svg',
  group: 'assets/images/consume-token/group.svg',
  space: 'assets/images/consume-token/space.svg',
  harvester: 'assets/images/consume-token/harvester.svg',
  cluster: 'assets/images/consume-token/cluster.svg',
  atmInventory: 'assets/images/consume-token/atm-inventory.svg',
};

export default Component.extend(I18n, {
  tagName: 'figure',
  classNames: ['join-image'],

  /**
   * @override
   */
  i18nPrefix: 'components.joinImage',

  /**
   * @virtual
   * @type {'user'|'group'|'space'|'harvester'}
   */
  joiningModelName: undefined,

  /**
   * @virtual
   * @type {Models.User|Models.Group|Models.Space|Models.Harvester}
   */
  joiningRecord: undefined,

  /**
   * @virtual
   * @type {'group'|'space'|'harvester'|'cluster'|'atmInventory'}
   */
  inviteTargetModelName: undefined,

  /**
   * @virtual
   * @type {BasicRecordInfo}
   */
  inviteTargetRecord: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showDetailsInTargetInfoPopover: false,

  /**
   * @virtual optional
   * @type {ComputedProperty<string>}
   */
  inviteTargetInfoComponentName: computed(
    'inviteTargetModelName', {
      get() {
        return this.injectedInviteTargetInfoComponentName ??
          `${dasherize(this.inviteTargetModelName)}-info-content`;
      },
      set(key, value) {
        return this.injectedInviteTargetInfoComponentName = value;
      },
    }
  ),

  /**
   * @virtual optional
   * @type {string|SafeString}
   */
  placeholderUnderSubjectImage: computed({
    get() {
      return this.injectedPlaceholderUnderSubjectImage ??
        this.t('placeholderUnderSubjectImage');
    },
    set(key, value) {
      return this.injectedPlaceholderUnderSubjectImage = value;
    },
  }),

  /**
   * @type {'join'|'add'}
   */
  arrowLabelType: 'join',

  /**
   * @type {string | null}
   */
  injectedInviteTargetInfoComponentName: null,

  /**
   * @type {string | null}
   */
  injectedPlaceholderUnderSubjectImage: null,

  /**
   * @type {ComputedProperty<String>}
   */
  invitedModelImagePath: getBy(raw(recordImages), 'joiningModelName'),

  /**
   * @type {ComputedProperty<String>}
   */
  inviteTargetModelImagePath: getBy(raw(recordImages), 'inviteTargetModelName'),
});
