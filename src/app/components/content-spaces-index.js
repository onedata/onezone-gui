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
import { computed, set, observer } from '@ember/object';
import { reject } from 'rsvp';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { next } from '@ember/runloop';

export default Component.extend(I18n, UserProxyMixin, {
  classNames: ['content-spaces-redirect'],

  onezoneServer: inject(),
  currentUser: inject(),
  globalNotify: inject(),
  navigationState: inject(),

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
  leaveSpaceModalTriggers: '',

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
   * @type {Ember.ComputedProperty<Array<AspectAction>>}
   */
  globalActions: computed('isDefaultSpace', function () {
    const isDefaultSpace = this.get('isDefaultSpace');
    return [{
      action: () => this.send('toggleDefaultSpace'),
      title: this.t(isDefaultSpace ? 'unsetDefault' : 'setDefault'),
      class: 'toggle-default-space',
      buttonStyle: 'default',
      icon: isDefaultSpace ? 'home-outline' : 'home',
    }, {
      action: () => this.send('openAddStorage'),
      title: this.t('addStorage'),
      class: 'open-add-storage',
      buttonStyle: 'primary',
      icon: 'provider-add',
    }, {
      action: () => {},
      title: this.t('leave'),
      class: 'leave-space',
      buttonStyle: 'danger',
      icon: 'leave-space',
    }];
  }),

  globalActionsObserver: observer('globalActions', function () {
    this.set('navigationState.aspectActions', this.get('globalActions'));
  }),

  init() {
    this._super(...arguments);
    next(() => {
      this.get('navigationState').setProperties({
        aspectActions: this.get('globalActions'),
        aspectActionsTitle: 'Space',
      });
      this.set('leaveSpaceModalTriggers', '.btn-leave-space.btn;a.leave-space:modal');
    });
  },

  willDestroyElement() {
    next(() => {
      this.get('navigationState').setProperties({
        aspectActions: [],
        aspectActionsTitle: undefined,
      });
    });
    this._super(...arguments);
  },

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
      .then(user => user.setDefaultSpaceId(spaceId));
  },

  actions: {
    openAddStorage() {
      throw new Error('not implemented');
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
