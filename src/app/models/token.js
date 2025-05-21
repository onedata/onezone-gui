/**
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} TokenCaveat
 * @property {string} type
 * @property {any} * additional options of caveat
 */

import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import gri from 'onedata-gui-websocket-client/utils/gri';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { cancel, later } from '@ember/runloop';
import { and, or, not } from 'ember-awesome-macros';
import moment from 'moment';

/**
 * Describes generalized invite tokens specifications depending on the invite target
 * model name.
 * - `idFieldName` - name of a field, where backend places invite target record id
 * - `modelName` - model name of the invite target
 * - `hasPrivileges` - if true, then that type of invite has privilege flags included
 */
const standardGroupMapping = {
  idFieldName: 'groupId',
  modelName: 'group',
  hasPrivileges: true,
};

const standardSpaceMapping = {
  idFieldName: 'spaceId',
  modelName: 'space',
  hasPrivileges: true,
};

const standardHarvesterMapping = {
  idFieldName: 'harvesterId',
  modelName: 'harvester',
  hasPrivileges: true,
};

const standardClusterMapping = {
  idFieldName: 'clusterId',
  modelName: 'cluster',
  hasPrivileges: true,
};

const standardAtmInventoryMapping = {
  idFieldName: 'atmInventoryId',
  modelName: 'atmInventory',
  hasPrivileges: true,
};

function mappingWithoutPrivileges(mapping) {
  return Object.assign({}, mapping, { hasPrivileges: false });
}

export const tokenInviteTypeToTargetModelMapping = {
  userJoinGroup: standardGroupMapping,
  groupJoinGroup: standardGroupMapping,
  userJoinSpace: standardSpaceMapping,
  groupJoinSpace: standardSpaceMapping,
  harvesterJoinSpace: mappingWithoutPrivileges(standardSpaceMapping),
  supportSpace: mappingWithoutPrivileges(standardSpaceMapping),
  registerOneprovider: {
    idFieldName: 'adminUserId',
    modelName: 'user',
    hasPrivileges: false,
  },
  userJoinCluster: standardClusterMapping,
  groupJoinCluster: standardClusterMapping,
  userJoinHarvester: standardHarvesterMapping,
  groupJoinHarvester: standardHarvesterMapping,
  spaceJoinHarvester: mappingWithoutPrivileges(standardHarvesterMapping),
  userJoinAtmInventory: standardAtmInventoryMapping,
  groupJoinAtmInventory: standardAtmInventoryMapping,
};

const allowedInviteTypes = Object.keys(tokenInviteTypeToTargetModelMapping);

export const entityType = 'token';

const mixins = [
  GraphSingleModelMixin,
  createDataProxyMixin('tokenTarget'),
];

export default Model.extend(...mixins, {
  name: attr('string'),
  type: attr('object'),
  revoked: attr('boolean'),
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
   * Ember timer object
   * @type {any}
   */
  expirationTimer: undefined,

  /**
   * One of: 'access', 'identity', 'invite'
   * @type {Ember.ComputedProperty<String>}
   */
  typeName: computed('type', function typeName() {
    const type = this.get('type') || {};

    if (type.accessToken) {
      return 'access';
    } else if (type.identityToken) {
      return 'identity';
    } else if (type.inviteToken) {
      return 'invite';
    } else {
      return undefined;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string|undefined>}
   */
  inviteType: computed('type.inviteToken.inviteType', function inviteType() {
    const tokenInviteType = this.get('type.inviteToken.inviteType');
    return allowedInviteTypes.includes(tokenInviteType) ?
      tokenInviteType : undefined;
  }),

  /**
   * @type {Ember.ComputedProperty<string|undefined>}
   */
  targetModelName: computed('inviteType', function targetModelName() {
    const inviteType = this.get('inviteType');
    if (inviteType) {
      return tokenInviteTypeToTargetModelMapping[inviteType].modelName;
    }
  }),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  targetRecordId: computed('inviteType', function targetModelId() {
    const {
      type,
      inviteType,
    } = this.getProperties('type', 'inviteType');
    if (inviteType) {
      const targetModelMapping =
        tokenInviteTypeToTargetModelMapping[inviteType];
      return targetModelMapping && type.inviteToken[targetModelMapping.idFieldName];
    } else {
      return undefined;
    }
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
   * @type {Ember.ComputedProperty<number|String|undefined>}
   */
  usageLimit: reads('metadata.usageLimit'),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  usageCount: reads('metadata.usageCount'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  usageLimitReached: computed('usageLimit', 'usageCount', function usageLimitReached() {
    const {
      usageCount,
      usageLimit,
    } = this.getProperties('usageCount', 'usageLimit');

    if (typeof usageCount === 'number' && typeof usageLimit === 'number') {
      return usageCount >= usageLimit;
    } else {
      // Usage limit is not defined
      return false;
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isObsolete: or('isExpired', 'usageLimitReached'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isActive: and(not('isObsolete'), not('revoked')),

  /**
   * @type {ComputedProperty<Array<String>|undefined}
   */
  privileges: reads('metadata.privileges'),

  index: computed('isActive', 'isObsolete', 'name', 'entityId', function index() {
    const activeIndex = this.isActive ? '0' : '1';
    const obsoleteIndex = this.isObsolete ? '1' : '0';
    return `${activeIndex}\0${obsoleteIndex}\0${this.name}\0${this.entityId}`;
  }),

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

  getTargetModelGri() {
    if (!this.targetRecordId || !this.targetModelName) {
      return null;
    }
    const adapter = this.store.adapterFor(this.targetModelName);
    const entityType = adapter.getEntityTypeForModelName(this.targetModelName);
    return gri({
      entityType,
      entityId: this.targetRecordId,
      aspect: 'instance',
      scope: 'auto',
    });
  },

  /**
   * @override
   * @returns {Promise<Models.User|Models.Group|Models.Cluster|Models.Space|Models.Harvester|null>}
   */
  async fetchTokenTarget() {
    const targetModelGri = this.getTargetModelGri();
    if (!targetModelGri) {
      return null;
    }

    const currentRecord = this.store.peekRecord(this.targetModelName, targetModelGri);
    if (
      currentRecord && (
        currentRecord.isDeleted ||
        currentRecord.isDestroyed ||
        currentRecord.isDestroying
      )
    ) {
      return null;
    }

    return await this.store.findRecord(
      this.targetModelName,
      targetModelGri, {
        reload: true,
      }
    );
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

  /**
   * @override
   */
  async loadRequiredRelations() {
    await this._super(...arguments);
    try {
      return this.tokenTargetProxy;
    } catch {
      // Errors while loading token target are a normal situation e.g. target can not
      // exist or we have insufficient access rights. We can ignore them. Any errors are
      // still accessible via the proxy object.
    }
  },

  /**
   * @override
   */
  getRequiredRelationsGris() {
    const tokenTargetGri = this.getTargetModelGri();
    if (tokenTargetGri) {
      return [tokenTargetGri];
    }
    return [];
  },
}).reopenClass(StaticGraphModelMixin);
