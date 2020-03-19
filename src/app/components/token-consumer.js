import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { get, computed, observer } from '@ember/object';
import { conditional, array, raw, equal } from 'ember-awesome-macros';
import RecordsOptionsArrayProxy from 'onezone-gui/utils/record-options-array-proxy';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { tokenInviteTypeToTargetModelMapping } from 'onezone-gui/models/token';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import trimToken from 'onedata-gui-common/utils/trim-token';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';

export default Component.extend(I18n, {
  classNames: ['token-consumer'],

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
  typeText: computed('type', 'typeName', 'targetName', function typeText() {
    const {
      type,
      typeName,
    } = this.getProperties('type', 'typeName');

    if (!type) {
      return null;
    }

    if (typeName === 'invite') {
      const inviteType = get(type, 'inviteToken.inviteType');
      const inviteTypeSpec = tokenInviteTypeToTargetModelMapping[inviteType];
      if (inviteTypeSpec) {
        const targetName = get(type, `inviteToken.${inviteTypeSpec.modelName}Name`);
        return this.t(
          `type.${typeName}.${inviteType}`, { targetName }, { defaultValue: null }
        );
      } else {
        return null;
      }
    } else {
      return this.t(`type.${typeName}`);
    }
  }),

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

  /**
   * @type {ComputedProperty<boolean>}
   */
  invalidTokenErrorOccured: equal('error.id', raw('badValueToken')),

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
      this.setProperties({
        type: null,
        error: null,
      });
    } else if (!trimmedToken) {
      // has only incorrect characters
      this.setProperties({
        type: null,
        error: { id: 'badValueToken' },
      });
    } else {
      return tokenManager.examineToken(trimmedToken)
        .then(result =>
          safeExec(this, 'processExaminationResult', result, lastInputTime)
        )
        .catch(error =>
          safeExec(this, 'processExaminationError', error, lastInputTime)
        );
    }
  },

  processExaminationResult(result, inputTime) {
    if (inputTime < this.get('lastInputTime')) {
      // Another token has been provided, this result should be ignored.
      return;
    }

    this.set('type', get(result || {}, 'type'));
  },

  processExaminationError(error, inputTime) {
    if (inputTime < this.get('lastInputTime')) {
      // Another token has been provided, this result should be ignored.
      return;
    }

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
