/**
 * @module models/client-token
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

 /**
 * @typedef {Object} TokenCaveat
 * @property {string} type
 * @property {any} * additional options of caveat
 */

import { computed, observer, getProperties } from '@ember/object';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { reads } from '@ember/object/computed';
import { reject } from 'rsvp';
import gri from 'onedata-gui-websocket-client/utils/gri';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { cancel, later } from '@ember/runloop';
import { and, not } from 'ember-awesome-macros';

const standardGroupMapping = {
  idFieldName: 'groupId',
  modelName: 'group',
};

const standardSpaceMapping = {
  idFieldName: 'groupId',
  modelName: 'group',
};

const standardHarvesterMapping = {
  idFieldName: 'groupId',
  modelName: 'group',
};

const standardClusterMapping = {
  idFieldName: 'groupId',
  modelName: 'group',
};

export const inviteTokenSubtypeToTargetModelMapping = {
  userJoinGroup: standardGroupMapping,
  groupJoinGroup: standardGroupMapping,
  userJoinSpace: standardSpaceMapping,
  groupJoinSpace: standardSpaceMapping,
  supportSpace: standardSpaceMapping,
  registerOneprovider: {
    idFieldName: 'adminUserId',
    modelName: 'user',
  },
  userJoinCluster: standardClusterMapping,
  groupJoinCluster: standardClusterMapping,
  userJoinHarvester: standardHarvesterMapping,
  groupJoinHarvester: standardHarvesterMapping,
  spaceJoinHarvester: standardHarvesterMapping,
};

export default Model.extend(
  GraphSingleModelMixin,
  createDataProxyMixin('tokenTarget'), {
    name: attr('string'),
    type: attr('object'),
    rekoved: attr('boolean'),
    metadata: attr('object'),
    token: attr('string'),

    /**
     * Array of caveats
     * @type {Array<TokenCaveat>}
     */
    caveats: attr('array'),

    /**
     * @type {boolean}
     */
    isExpired: false,

    /**
     * @type {any}
     */
    expirationTimer: undefined,

    /**
     * One of: 'access', 'invite'
     * @type {Ember.ComputedProperty<string>}
     */
    typeName: computed('type', function typeName() {
      const type = this.get('type') || {};

      if (type.accessToken) {
        return 'access';
      } else if (type.inviteToken) {
        return 'invite';
      } else {
        return undefined;
      }
    }),

    /**
     * @type {Ember.ComputedProperty<string|undefined>}
     * One of:
     * - undefined (for access token)
     * - 'userJoinGroup',
     * - 'groupJoinGroup',
     * - 'userJoinSpace',
     * - 'groupJoinSpace',
     * - 'supportSpace',
     * - 'registerOneprovider',
     * - 'userJoinCluster',
     * - 'groupJoinCluster',
     * - 'userJoinHarvester',
     * - 'groupJoinHarvester',
     * - 'spaceJoinHarvester'
     */
    tokenSubtype: reads('type.inviteToken.subtype'),

    /**
     * UNIX timestamp of token expiration time
     * @type {Ember.ComputedProperty<number|undefined>}
     */
    validUntil: computed('caveats', function validUntil() {
      const caveats = this.get('caveats') || [];
      const timeCaveat = caveats.findBy('type', 'time');
      return timeCaveat ? timeCaveat.validUntil : undefined;
    }),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    usageLimitReached: computed('metadata', function usageLimitReached() {
      const metadata = this.get('metadata') || {};
      const {
        usageCount,
        usageLimit,
      } = getProperties(metadata, 'usageCount', 'usageLimit');

      if (typeof usageCount === 'number' && typeof usageLimit === 'number') {
        return usageCount >= usageLimit;
      } else {
        // Usage limit is not defined
        return false;
      }
    }),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isActive: and(
      not('isExpired'),
      not('usageLimitReached'),
      not('revoked'),
    ),

    // FIXME: check if it will be fired up on record load
    validUntilObserver: observer('validUntil', function () {
      const {
        validUntil,
        isExpired,
      } = this.getProperties('validUntil', 'isExpired');
      const nowTimestamp = Date.now();
      const hasValidUntil = typeof validUntil === 'number';

      if (!hasValidUntil || validUntil >= nowTimestamp) {
        if (isExpired) {
          this.set('isExpired', false);
        }
      } else {
        if (!isExpired) {
          this.set('isExpired', true);
        }
      }
      
      this.rescheduleExpirationTimer();
    }),

    init() {
      this._super(...arguments);

      this.validUntilObserver();
    },

    destroy() {
      this._super(...arguments);

      cancel(this.get('expirationTimer'));
    },

    /**
     * @override
     * @return {Promise<Models.User|Models.Group|Models.Cluster|Models.Space>}
     */
    fetchTokenTarget() {
      const {
        store,
        type,
      } = this.getProperties('store', 'type');

      if (!type || !type.inviteToken) {
        return reject();
      } else {
        const targetModelMapping =
          inviteTokenSubtypeToTargetModelMapping[type.inviteToken.subtype];
        const targetModelGri = gri({
          entityType: targetModelMapping.modelName,
          entityId: type.inviteToken[targetModelMapping.idFieldName],
          aspect: 'instance',
          scope: 'auto',
        });

        return store.findRecord(targetModelMapping.modelName, targetModelGri);
      }
    },

    rescheduleExpirationTimer() {
      const {
        expirationTimer,
        validUntil,
      } = this.getProperties('expirationTimer', 'validUntil');
      const nowTimestamp = Date.now();

      cancel(expirationTimer);
      if (typeof validUntil === 'number' && validUntil > nowTimestamp) {
        const timerTime = (validUntil - nowTimestamp + 1) * 1000;
        this.set(
          'expirationTimer',
          later(() => this.set('isExpired', true), timerTime)
        );
      }
    },
  }
).reopenClass(StaticGraphModelMixin);
