/**
 * A service which provides harvester manipulation functions ready to use for GUI 
 *
 * @module services/harvester-actions
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import $ from 'jquery';

export default Service.extend(I18n, {
  router: service(),
  i18n: service(),
  harvesterManager: service(),
  globalNotify: service(),
  guiUtils: service(),
  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.harvesterActions',

  /**
   * @type {Ember.ComputedProperty<Array<SidebarButtonDefinition>>}
   */
  buttons: collect('btnCreate', 'btnJoin'),

  /**
   * @type {Ember.ComputedProperty<SidebarButtonDefinition>}
   */
  btnCreate: computed(function btnCreate() {
    const router = this.get('router');
    return {
      icon: 'add-filled',
      title: this.t('btnCreate.title'),
      tip: this.t('btnCreate.hint'),
      class: 'create-harvester-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'harvesters',
        'new'),
    };
  }),

  /**
   * @type {Ember.Computed<SidebarButtonDefinition>}
   */
  btnJoin: computed(function btnJoin() {
    const router = this.get('router');
    return {
      icon: 'join-plug',
      title: this.t('btnJoin.title'),
      tip: this.t('btnJoin.hint'),
      class: 'join-harvester-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'harvesters',
        'join'),
    };
  }),

  /**
   * Creates new harvester
   * @param {Object} harvester harvester base object
   * @returns {Promise} A promise, which resolves to new harvester if it has
   * been created successfully.
   */
  createHarvester(harvester) {
    const {
      globalNotify,
      harvesterManager,
    } = this.getProperties(
      'globalNotify',
      'harvesterManager'
    );
    return harvesterManager.createRecord(harvester)
      .then(harvester => {
        globalNotify.success(this.t('harvesterCreateSuccess'));
        next(() =>
          this.redirectToHarvester(harvester, 'config')
          .then(() => {
            const sidebarContainer = $('.col-sidebar');
            $('.col-sidebar').scrollTop(sidebarContainer[0].scrollHeight -
              sidebarContainer[0].clientHeight);
          })
        );
        return harvester;
      }).catch(error => {
        globalNotify.backendError(this.t('harvesterCreating'), error);
        throw error;
      });
  },

  /**
   * Updates harvester
   * @param {Model.Harvester} harvester
   * @returns {Promise}
   */
  updateHarvester(harvester) {
    const globalNotify = this.get('globalNotify');
    return harvester.save()
      .then(() => {
        globalNotify.success(this.t('updateHarvesterSuccess'));
      })
      .catch(error => {
        globalNotify.backendError(this.t('updatingHarvester'), error);
        throw error;
      });
  },

  /**
   * Joins to existing harvester using token
   * @param {string} token
   * @returns {Promise<Model.Harvester>} A promise, which resolves to harvester
   * if it has been joined successfully.
   */
  joinHarvester(token) {
    return this.get('harvesterManager').joinHarvester(token)
      .then(harvester => {
        this.get('globalNotify').info(this.t('joinedHarvesterSuccess'));
        this.redirectToHarvester(harvester);
        return harvester;
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningHarvester'), error);
        throw error;
      });
  },

  /**
   * Leave harvester
   * @param {Model.Harvester} harvester
   * @returns {Promise}
   */
  leaveHarvester(harvester) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.leaveHarvester(get(harvester, 'entityId'))
      .then(() => {
        globalNotify.success(this.t(
          'leaveHarvesterSuccess', { harvesterName: get(harvester, 'name') }
        ));
      })
      .catch(error => {
        globalNotify.backendError(this.t('leavingHarvester'), error);
        throw error;
      });
  },

  /**
   * Redirects to harvester page
   * @param {Model.Harvester} harvester
   * @param {string} aspect
   * @param {Object} queryParams
   * @returns {Promise}
   */
  redirectToHarvester(harvester, aspect = 'plugin', queryParams = undefined) {
    const {
      router,
      guiUtils,
    } = this.getProperties('router', 'guiUtils');
    const options = {
      queryParams: queryParams || {},
    };
    return router.transitionTo(
      'onedata.sidebar.content.aspect',
      'harvesters',
      guiUtils.getRoutableIdFor(harvester),
      aspect,
      options
    );
  },

  /**
   * Removes harvester
   * @param {Model.Harvester} harvester
   * @param {boolean} removeData
   * @returns {Promise}
   */
  removeHarvester(harvester, removeData) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.removeHarvester(get(harvester, 'id'), removeData)
      .then(() => {
        globalNotify.success(this.t(
          'removeHarvesterSuccess', { harvesterName: get(harvester, 'name') }
        ));
      })
      .catch(error => {
        harvester.rollbackAttributes();
        globalNotify.backendError(this.t('removingHarvester'), error);
        throw error;
      });
  },

  /**
   * Removes space form harvester
   * @param {Model.Harvester} harvester 
   * @param {Model.Space} space
   * @returns {Promise}
   */
  removeSpaceFromHarvester(harvester, space) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.removeSpaceFromHarvester(
      get(harvester, 'entityId'),
      get(space, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('removeSpaceFromHarvesterSuccess', {
        harvesterName: get(harvester, 'name'),
        spaceName: get(space, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('removingSpaceFromHarvester'), error);
      throw error;
    });
  },

  /**
   * Adds space to harvester
   * @param {Model.Harvester} harvester 
   * @param {Model.Space} space
   * @return {Promise}
   */
  addSpaceToHarvester(harvester, space) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.addSpaceToHarvester(
      get(harvester, 'entityId'),
      get(space, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addSpaceToHarvesterSuccess', {
        harvesterName: get(harvester, 'name'),
        spaceName: get(space, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('addingSpaceToHarvester'), error);
      throw error;
    });
  },

  /**
   * Removes group from space
   * @param {Model.Harvester} harvester 
   * @param {Model.Group} group
   * @returns {Promise}
   */
  removeGroupFromHarvester(harvester, group) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.removeGroupFromHarvester(
      get(harvester, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('removeGroupSuccess', {
        harvesterName: get(harvester, 'name'),
        groupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('deletingGroup'), error);
      throw error;
    });
  },

  /**
   * Removes user from harvester
   * @param {Model.Harvester} harvester 
   * @param {Model.User} user
   * @returns {Promise}
   */
  removeUserFromHarvester(harvester, user) {
    const {
      harvesterManager,
      globalNotify,
      currentUser,
    } = this.getProperties('harvesterManager', 'globalNotify', 'currentUser');
    const userEntityId = get(user, 'entityId');
    const harvesterEntityId = get(harvester, 'entityId');
    return harvesterManager.removeUserFromHarvester(
      harvesterEntityId,
      userEntityId
    ).catch((errorRemove) => {
      if (get(currentUser, 'userId') === userEntityId) {
        return harvesterManager.leaveHarvester(harvesterEntityId)
          .catch(errorLeave => {
            if (get(errorLeave || {}, 'id') !== 'forbidden') {
              console.error(errorRemove);
              throw errorLeave;
            } else {
              throw errorRemove;
            }
          });
      } else {
        throw errorRemove;
      }
    }).then(() => {
      globalNotify.success(this.t('removeUserSuccess', {
        harvesterName: get(harvester, 'name'),
        userName: get(user, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('removingUser'), error);
      throw error;
    });
  },

  /**
   * Creates member group for specified harvester
   * @param {Model.Harvester} harvester 
   * @param {Object} groupRepresentation
   * @return {Promise}
   */
  createMemberGroupForHarvester(harvester, groupRepresentation) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager
      .createMemberGroupForHarvester(
        get(harvester, 'entityId'),
        groupRepresentation
      ).then(() => {
        globalNotify.success(this.t('createMemberGroupSuccess', {
          memberGroupName: get(groupRepresentation, 'name'),
        }));
      }).catch(error => {
        globalNotify.backendError(this.t('creatingMemberGroup'), error);
        throw error;
      });
  },

  /**
   * Adds existing group to harvetser
   * @param {Model.Harvester} harvester
   * @param {Model.Group} group
   * @return {Promise}
   */
  addMemberGroupToHarvester(harvester, group) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.addMemberGroupToHarvester(
      get(harvester, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addMemberGroupSuccess', {
        memberGroupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('addingMemberGroup'), error);
      throw error;
    });
  },

  /**
   * Joins user to an existing harvester (without token)
   * @param {Model.Harvester} harvester
   * @returns {Promise} A promise, which resolves to harvester if it has
   * been joined successfully.
   */
  joinHarvesterAsUser(harvester) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.joinHarvesterAsUser(get(harvester, 'entityId'))
      .then(harvesterRecord => {
        globalNotify.info(this.t('joinedHarvesterSuccess'));
        return harvesterRecord;
      })
      .catch(error => {
        globalNotify.backendError(this.t('joiningHarvester'), error);
        throw error;
      });
  },

  /**
   * Creates index
   * @param {Model.Harvester} harvester
   * @param {Object} indexRepresentation
   * @returns {Promise}
   */
  createIndex(harvester, indexRepresentation) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.createIndex(
        get(harvester, 'entityId'),
        indexRepresentation
      ).then(() => {
        globalNotify.success(this.t('createIndexSuccess'));
      })
      .catch(error => {
        globalNotify.backendError(this.t('creatingIndex'), error);
        throw error;
      });
  },

  /**
   * Removes index
   * @param {Model.Index} index
   * @param {boolean} removeData
   * @returns {Promise}
   */
  removeIndex(index, removeData) {
    const {
      harvesterManager,
      globalNotify,
    } = this.getProperties('harvesterManager', 'globalNotify');
    return harvesterManager.removeIndex(get(index, 'gri'), removeData)
      .then(() => {
        globalNotify.success(this.t(
          'removeIndexSuccess', { indexName: get(index, 'name') }
        ));
      })
      .catch(error => {
        index.rollbackAttributes();
        globalNotify.backendError(this.t('removingIndex'), error);
        throw error;
      });
  },
});
