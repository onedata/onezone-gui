/**
 * Default content for single space
 *
 * @module components/content-spaces-index
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, set } from '@ember/object';
import { reject } from 'rsvp';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';

export default Component.extend(I18n, UserProxyMixin, {
  classNames: ['content-spaces-redirect'],

  onezoneServer: inject(),
  currentUser: inject(),
  globalNotify: inject(),

  /**
   * @override 
   */
  i18nPrefix: 'components.contentSpacesIndex.',

  /**
   * @virtual
   * @type {models/Space}
   */
  space: undefined,

  /**
   * @type {string}
   */
  spaceId: computed.reads('space.entityId'),

  /**
   * TODO: make an util from this code
   * @returns {boolean|undefined} true if loaded space is the default
   */
  isDefaultSpace: computed(
    'space.entityId',
    'userProxy.content.defaultSpaceId',
    function getIsDefaultSpace() {
      const spaceId = this.get('space.entityId');
      const defaultSpaceId = this.get('userProxy.content.defaultSpaceId');
      return spaceId && defaultSpaceId && (spaceId === defaultSpaceId);
    }
  ),

  /**
   * Shows global info about save error.
   * @param {object} error 
   * @returns {undefined}
   */
  _saveErrorHandler(error) {
    const globalNotify = this.get('globalNotify');
    globalNotify.backendError(this.t('saving'), error);
  },

  /**
   * Saves the space
   * @returns {Promise}
   */
  _saveSpace() {
    const space = this.get('space');
    return space.save().catch(error => {
      this._saveErrorHandler(error);
      throw error;
    });
  },

  /**
   * @param {boolean} enable if true, this space will be set as default;
   *  otherwise this space will be unset as default
   * @return {Promise} a promise retured by set default space graph operation
   */
  _setAsDefaultSpace(enable) {
    const spaceId = enable ? this.get('space.entityId') : null;
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.setDefaultSpaceId(spaceId))
      .catch(error =>
        this.get('globalNotify').backendError(this.t('changingDefaultSpace'), error)
      );
  },

  actions: {
    openAddStorage() {
      throw new Error('not implemented');
    },
    openLeaveModal(fromFullToolbar) {
      if (!fromFullToolbar) {
        this.set('_deregisterModalOpen', true);
      }
    },
    leave() {
      const spaceId = this.get('spaceId');
      return this.get('currentUser').getCurrentUserRecord()
        .then(user =>
          user.leaveSpace(spaceId)
        );
    },
    saveSpaceName(name) {
      const space = this.get('space');
      if (!name || !name.length) {
        return reject();
      }
      set(space, 'name', name);
      return this._saveSpace();
    },
    toggleDefaultSpace() {
      return this._setAsDefaultSpace(!this.get('isDefaultSpace'));
    },
  },
});
