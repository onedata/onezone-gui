import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { get, computed, observer } from '@ember/object';
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
  spaceManager: service(),
  groupManager: service(),
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
   * @type {Object}
   */
  type: undefined,

  /**
   * @type {Object}
   */
  error: undefined,

  /**
   * @type {String}
   */
  latestJoiningRecordSelectorModelName: undefined,

  /**
   * @type {String}
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
   * @type {ComputedProperty<String>}
   */
  inviteTargetName: computed('type', function inviteTargetName() {
    const inviteType = this.get('type.inviteToken.inviteType');
    if (inviteType) {
      const inviteTypeSpec = tokenInviteTypeToTargetModelMapping[inviteType];
      if (inviteTypeSpec) {
        return this.get(`type.inviteToken.${inviteTypeSpec.modelName}Name`);
      }
    }
  }),

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
      } = this.getProperties('type', 'typeName', 'inviteTargetName');

      if (!type) {
        return null;
      }

      if (typeName === 'invite') {
        const inviteType = get(type, 'inviteToken.inviteType');
        const inviteTypeSpec = tokenInviteTypeToTargetModelMapping[inviteType];
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

  joiningModelName: computed('type', function joiningModelName() {
    const inviteType = this.get('type.inviteToken.inviteType');
    if (inviteType) {
      for (let modelName of ['user', 'group', 'space']) {
        if (inviteType.startsWith(`${modelName}Join`)) {
          return modelName;
        }
      }
    }
    return null;
  }),

  joiningRecordSelectorModelName: conditional(
    array.includes(raw(['group', 'space']), 'joiningModelName'),
    'joiningModelName',
    raw(null)
  ),

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
      const inviteType = this.get('type.inviteToken.inviteType');

      if (latestJoiningRecordSelectorModelName && inviteType) {
        const inviteTypeSpec = tokenInviteTypeToTargetModelMapping[inviteType];
        if (inviteTypeSpec)
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
    const {
      spaceManager,
      groupManager,
    } = this.getProperties(
      'spaceManager',
      'groupManager',
    );

    let records;
    switch (modelName) {
      case 'group':
        records = groupManager.getGroups();
        break;
      case 'space':
        records = spaceManager.getSpaces();
        break;
    }

    return PromiseArray.create({
      promise: records
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
  },
});
