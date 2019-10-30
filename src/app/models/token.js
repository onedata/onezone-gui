/**
 * @module models/token
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
import { resolve } from 'rsvp';
import gri from 'onedata-gui-websocket-client/utils/gri';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { cancel, later } from '@ember/runloop';
import { and, not } from 'ember-awesome-macros';
import moment from 'moment';

const standardGroupMapping = {
  idFieldName: 'groupId',
  modelName: 'group',
};

const standardSpaceMapping = {
  idFieldName: 'spaceId',
  modelName: 'space',
};

const standardHarvesterMapping = {
  idFieldName: 'harvesterId',
  modelName: 'harvester',
};

const standardClusterMapping = {
  idFieldName: 'clusterId',
  modelName: 'cluster',
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

const allowedSubtypes = Object.keys(inviteTokenSubtypeToTargetModelMapping);

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
     */
    subtype: computed('type.inviteToken.subtype', function subtype() {
      const tokenSubtype = this.get('type.inviteToken.subtype');
      return allowedSubtypes.includes(tokenSubtype) ? tokenSubtype : undefined;
    }),

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

    validUntilObserver: observer('validUntil', function validUntilObserver() {
      const {
        validUntil,
        isExpired,
      } = this.getProperties('validUntil', 'isExpired');
      const nowTimestamp = moment().unix();
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
        subtype,
      } = this.getProperties('store', 'type', 'subtype');

      if (!subtype) {
        return resolve(null);
      } else {
        const targetModelMapping =
          inviteTokenSubtypeToTargetModelMapping[subtype];
        const modelName = targetModelMapping.modelName;
        const adapter = store.adapterFor(modelName);
        const entityType = adapter.getEntityTypeForModelName(modelName);

        const targetModelGri = gri({
          entityType,
          entityId: type.inviteToken[targetModelMapping.idFieldName],
          aspect: 'instance',
          scope: 'auto',
        });

        return store.findRecord(targetModelMapping.modelName, targetModelGri);
      }
    },

    /**
     * @returns {undefined}
     */
    rescheduleExpirationTimer() {
      const {
        expirationTimer,
        validUntil,
      } = this.getProperties('expirationTimer', 'validUntil');
      const nowTimestamp = moment().unix();

      cancel(expirationTimer);
      if (typeof validUntil === 'number' && validUntil > nowTimestamp) {
        // If validUntil == nowTimestamp, then token is still valid, so we need +1s.
        const timerTime = (validUntil - nowTimestamp + 1) * 1000;
        this.set(
          'expirationTimer',
          later(() => this.set('isExpired', true), timerTime)
        );
      }
    },
  }
).reopenClass(StaticGraphModelMixin);
