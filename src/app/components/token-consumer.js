/**
 * Asks for token, display info about it and allows to consume an invite token.
 *
 * @module components/token-consumer
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { get, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { conditional, array, raw, equal, and, notEqual, isEmpty, not } from 'ember-awesome-macros';
import RecordsOptionsArrayProxy from 'onezone-gui/utils/record-options-array-proxy';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { tokenInviteTypeToTargetModelMapping } from 'onezone-gui/models/token';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import trimToken from 'onedata-gui-common/utils/trim-token';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';

export default Component.extend(I18n, {
  classNames: ['token-consumer'],
  classNameBindings: ['pendingCheckTime:is-examining'],

  tokenManager: service(),
  tokenActions: service(),
  recordManager: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tokenConsumer',

  /**
   * @type {String}
   */
  token: '',

  /**
   * @type {number}
   */
  lastInputTime: 0,

  /**
   * @type {number}
   */
  pendingCheckTime: 0,

  /**
   * Has the same structure as `type` field in token model
   * @type {Object}
   */
  type: undefined,

  /**
   * @type {Object}
   */
  error: undefined,

  /**
   * Set by joiningRecordSelectorModelNameObserver
   * @type {String}
   */
  latestJoiningRecordSelectorModelName: undefined,

  /**
   * Set by joiningRecordSelectorModelNameObserver
   * @type {PromiseArray<FieldOption>}
   */
  joiningRecordSelectorOptionsProxy: undefined,

  /**
   * @type {Object}
   */
  selectedJoiningRecordOption: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  trimmedToken: computedPipe('token', trimToken),

  /**
   * @type {ComputedProperty<String>}
   */
  typeName: computed('type', function typeName() {
    const type = this.get('type') || {};

    if (type.inviteToken) {
      return 'invite';
    } else if (type.identityToken) {
      return 'identity';
    } else if (type.accessToken) {
      return 'access';
    } else {
      return null;
    }
  }),

  /**
   * For this object details see models/token
   * @type {ComputedProperty<Object>}
   */
  inviteTypeSpec: computed('type.inviteToken.inviteType', function () {
    const inviteType = this.get('type.inviteToken.inviteType');
    if (inviteType) {
      return tokenInviteTypeToTargetModelMapping[inviteType];
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  inviteTargetName: computed('type', function inviteTargetName() {
    const inviteTypeSpec = this.get('inviteTypeSpec');
    if (inviteTypeSpec) {
      return this.get(`type.inviteToken.${inviteTypeSpec.modelName}Name`);
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  inviteTargetModelName: reads('inviteTypeSpec.modelName'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasUnresolvedTargetName: and(
    equal('typeName', raw('invite')),
    notEqual('type.inviteToken.inviteType', raw('registerOneprovider')),
    isEmpty('inviteTargetName')
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  typeText: computed(
    'type.inviteToken.inviteType',
    'inviteTargetName',
    'typeName',
    'targetName',
    function typeText() {
      const {
        type,
        typeName,
        inviteTargetName,
        inviteTypeSpec,
      } = this.getProperties('type', 'typeName', 'inviteTargetName', 'inviteTypeSpec');

      if (!type) {
        return null;
      }

      if (typeName === 'invite') {
        const inviteType = get(type, 'inviteToken.inviteType');
        if (inviteTypeSpec) {
          const targetName = inviteTargetName || this.t('unknownTargetName');
          return this.t(
            `type.${typeName}.${inviteType}`, { targetName }, { defaultValue: null }
          );
        } else {
          return null;
        }
      } else {
        return this.t(`type.${typeName}`);
      }
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  joiningModelName: computed('type', function joiningModelName() {
    const inviteType = this.get('type.inviteToken.inviteType');
    if (inviteType) {
      for (const modelName of ['user', 'group', 'space']) {
        if (inviteType.startsWith(`${modelName}Join`)) {
          return modelName;
        }
      }
    }
    return null;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  joiningRecordSelectorModelName: conditional(
    array.includes(raw(['group', 'space']), 'joiningModelName'),
    'joiningModelName',
    raw(null)
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  joiningRecordSelectorDescription: computed(
    'latestJoiningRecordSelectorModelName',
    'type',
    'inviteTargetName',
    function joiningRecordSelectorDescription() {
      const {
        latestJoiningRecordSelectorModelName,
        inviteTargetName,
      } = this.getProperties(
        'latestJoiningRecordSelectorModelName',
        'inviteTargetName'
      );

      const inviteTypeSpec = this.get('inviteTypeSpec');
      if (latestJoiningRecordSelectorModelName && inviteTypeSpec) {
        return this.t('joiningRecordSelectorDescription', {
          joiningModelName: this.t(
            `joiningModelName.${latestJoiningRecordSelectorModelName}`
          ),
          targetModelName: this.t(`targetModelName.${inviteTypeSpec.modelName}`),
          targetRecordName: inviteTargetName || this.t('unknownTargetName'),
        });
      }
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  invalidTokenErrorOccured: equal('error.id', raw('badValueToken')),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showJoinBtn: and(
    equal('typeName', raw('invite')),
    not(array.includes(
      raw(['supportSpace', 'registerOneprovider']),
      'type.inviteToken.inviteType'
    )),
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  noJoinMessage: computed('type.inviteToken.inviteType', function noJoinMessage() {
    const typeName = this.get('typeName');
    const inviteType = this.get('type.inviteToken.inviteType');

    let translationName;
    if (typeName !== 'invite') {
      translationName = 'notAnInviteTokenInfo';
    } else if (inviteType === 'registerOneprovider') {
      translationName = 'registerOneproviderTokenInfo';
    } else if (inviteType === 'supportSpace') {
      translationName = 'supportSpaceTokenInfo';
    }

    if (translationName && typeName) {
      return this.t(translationName);
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isJoinBtnDisabled: and(
    'joiningRecordSelectorModelName',
    not('selectedJoiningRecordOption')
  ),

  joiningRecordSelectorModelNameObserver: observer(
    'joiningRecordSelectorModelName',
    function joiningRecordSelectorModelNameObserver() {
      const {
        latestJoiningRecordSelectorModelName: latestModelName,
        joiningRecordSelectorModelName: newModelName,
      } = this.getProperties(
        'latestJoiningRecordSelectorModelName',
        'joiningRecordSelectorModelName'
      );

      if (!newModelName || latestModelName === newModelName) {
        return;
      }

      this.setProperties({
        joiningRecordSelectorOptionsProxy: this.getRecordOptionsForModel(newModelName),
        latestJoiningRecordSelectorModelName: newModelName,
        selectedJoiningRecordOption: null,
      });
    }
  ),

  examineToken() {
    const {
      token,
      trimmedToken,
      tokenManager,
      lastInputTime,
    } = this.getProperties('token', 'trimmedToken', 'tokenManager', 'lastInputTime');

    if (token.trim().length === 0) {
      this.resetState();
    } else if (!trimmedToken) {
      // has only incorrect characters
      this.resetState();
      this.set('error', { id: 'badValueToken' });
    } else {
      this.set('pendingCheckTime', lastInputTime);
      return tokenManager.examineToken(trimmedToken)
        .then(result =>
          safeExec(this, 'processExaminationResult', result, lastInputTime)
        )
        .catch(error =>
          safeExec(this, 'processExaminationError', error, lastInputTime)
        )
        .finally(() => safeExec(this, () => {
          if (this.get('pendingCheckTime') === lastInputTime) {
            this.set('pendingCheckTime', 0);
          }
        }));
    }
  },

  processExaminationResult(result, inputTime) {
    if (inputTime < this.get('lastInputTime')) {
      // Another token has been provided, this result should be ignored.
      return;
    }

    this.resetState();
    this.set('type', get(result || {}, 'type'));
  },

  processExaminationError(error, inputTime) {
    if (inputTime < this.get('lastInputTime')) {
      // Another token has been provided, this result should be ignored.
      return;
    }

    this.resetState();
    this.set('error', error);
  },

  /**
   * @param {String} modelName 
   * @returns {PromiseArray<FieldOption>}
   */
  getRecordOptionsForModel(modelName) {
    return PromiseArray.create({
      promise: this.get('recordManager').getUserRecordList(modelName)
        .then(records => get(records, 'list'))
        .then(recordsList => RecordsOptionsArrayProxy.create({
          ownerSource: this,
          records: recordsList,
        })),
    });
  },

  resetState() {
    this.setProperties({
      type: null,
      error: null,
      pendingCheckTime: 0,
    });
  },

  actions: {
    tokenChanged(token) {
      this.setProperties({
        token,
        lastInputTime: new Date().valueOf(),
      });
      debounce(this, 'examineToken', config.environment === 'test' ? 1 : 500);
    },
    join() {
      const {
        recordManager,
        tokenActions,
        token,
        inviteTargetModelName,
        selectedJoiningRecordOption,
        joiningRecordSelectorModelName,
      } = this.getProperties(
        'recordManager',
        'tokenActions',
        'token',
        'inviteTargetModelName',
        'selectedJoiningRecordOption',
        'joiningRecordSelectorModelName'
      );

      const joiningRecord = joiningRecordSelectorModelName ?
        get(selectedJoiningRecordOption, 'value') : recordManager.getCurrentUserRecord();

      return tokenActions.createConsumeInviteTokenAction({
        joiningRecord,
        targetModelName: inviteTargetModelName,
        token,
      }).execute();
    },
  },
});
