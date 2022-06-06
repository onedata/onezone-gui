/**
 * Component responsible for generating temporary invite tokens for specified inviteType
 * and targetRecord.
 *
 * @module components/invite-token-generator
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads, bool } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import generateShellCommand from 'onezone-gui/utils/generate-shell-command';
import { resolve, all as allFulfilled } from 'rsvp';
import { not, array, raw, promise } from 'ember-awesome-macros';

const onedatifyInviteTypes = [
  'onedatify',
  'onedatifyWithImport',
];

const inviteTypesWithoutSubjectDescription = [
  'supportSpace',
  'registerOneprovider',
  ...onedatifyInviteTypes,
];

export default Component.extend(I18n, {
  classNames: ['invite-token-generator'],

  tokenManager: service(),
  recordManager: service(),
  router: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.inviteTokenGenerator',

  /**
   * @virtual
   * @type {GraphSingleModel}
   */
  targetRecord: undefined,

  /**
   * For possible values see Token model source code. Additional values are:
   * - onedatify
   * - onedatifyWithImport
   * @virtual
   * @type {String}
   */
  inviteType: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @returns {any}
   */
  onCustomTokenClick: notImplementedIgnore,

  /**
   * @type {PromiseObject<String>}
   */
  generatedTokenProxy: undefined,

  /**
   * @type {String}
   */
  ozRegistrationTokenVariable: '$PROVIDER_REGISTRATION_TOKEN',

  /**
   * @type {ComputedProperty<Models.User>}
   */
  currentUser: computed(function currentUser() {
    return this.get('recordManager').getCurrentUserRecord();
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  canCurrentUserInviteProviders: bool('currentUser.canInviteProviders'),

  /**
   * @type {ComputedProperty<String>}
   */
  targetRecordId: reads('targetRecord.entityId'),

  /**
   * @type {ComputedProperty<String>}
   */
  subjectDescription: computed('inviteType', function subjectDescription() {
    const inviteType = this.get('inviteType');
    if (!inviteTypesWithoutSubjectDescription.includes(inviteType)) {
      return this.t(`subjectDescription.${inviteType}`);
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  limitationsDescription: computed(
    'inviteType',
    'canCurrentUserInviteProviders',
    function limitationsDescription() {
      const {
        inviteType,
        canCurrentUserInviteProviders,
      } = this.getProperties('inviteType', 'canCurrentUserInviteProviders');
      if (onedatifyInviteTypes.includes(inviteType)) {
        return canCurrentUserInviteProviders ?
          this.t('onedatifyLimitationsDescription.withRegistrationToken') :
          this.t('onedatifyLimitationsDescription.withoutRegistrationToken');
      } else {
        return this.t('limitationsDescription');
      }
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showCustomTokenLink: not(array.includes(
    raw(onedatifyInviteTypes),
    'inviteType'
  )),

  /**
   * @type {ComputedProperty<string|null>}
   */
  variablesDescription: computed(
    'inviteType',
    'canCurrentUserInviteProviders',
    'ozRegistrationTokenVariable',
    function variablesDescription() {
      const {
        inviteType,
        canCurrentUserInviteProviders,
        ozRegistrationTokenVariable,
      } = this.getProperties(
        'inviteType',
        'canCurrentUserInviteProviders',
        'ozRegistrationTokenVariable',
      );

      if (
        onedatifyInviteTypes.includes(inviteType) &&
        !canCurrentUserInviteProviders
      ) {
        return {
          content: this.t('ozRegistrationTokenVariableDescription.content', {
            variable: ozRegistrationTokenVariable,
          }),
          tip: this.t('ozRegistrationTokenVariableDescription.tip'),
        };
      }

      return null;
    }
  ),

  /**
   * @type {ComputedProperty<PromiseObject<String>>}
   */
  customTokenUrlProxy: promise.object(
    computed('inviteType', 'targetRecord', function customTokenUrlProxy() {
      const {
        router,
        inviteType,
        targetRecordId,
        showCustomTokenLink,
        tokenManager,
      } = this.getProperties(
        'router',
        'inviteType',
        'targetRecordId',
        'showCustomTokenLink',
        'tokenManager'
      );

      if (!showCustomTokenLink) {
        return resolve();
      } else {
        return tokenManager.createTemporaryInviteTokenTemplate(inviteType, targetRecordId)
          .then(tokenTemplate => router.urlFor(
            'onedata.sidebar.content',
            'tokens',
            'new', {
              queryParams: {
                options: serializeAspectOptions({
                  activeSlide: 'form',
                  tokenTemplate: btoa(JSON.stringify(tokenTemplate)),
                }),
              },
            }
          ));
      }
    })
  ),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  dataLoadingProxy: promise.object(promise.all(
    'generatedTokenProxy',
    'customTokenUrlProxy'
  )),

  init() {
    this._super(...arguments);
    this.generateToken();
  },

  generateToken() {
    const {
      tokenManager,
      targetRecordId,
      inviteType,
      canCurrentUserInviteProviders,
      ozRegistrationTokenVariable,
    } = this.getProperties(
      'tokenManager',
      'targetRecordId',
      'inviteType',
      'canCurrentUserInviteProviders',
      'ozRegistrationTokenVariable',
    );

    let tokenPromise;
    if (onedatifyInviteTypes.includes(inviteType)) {
      const ozRegistrationTokenPromise = canCurrentUserInviteProviders ?
        tokenManager.createTemporaryInviteToken('registerOneprovider') : resolve(null);
      const supportSpaceTokenPromise =
        tokenManager.createTemporaryInviteToken('supportSpace', targetRecordId);
      tokenPromise = allFulfilled([
        ozRegistrationTokenPromise,
        supportSpaceTokenPromise,
      ]).then(([onezoneRegistrationToken, supportToken]) =>
        generateShellCommand(inviteType === 'onedatify' ? 'oneprovider' : 'onedatify', {
          onezoneRegistrationToken,
          onezoneRegistrationTokenVariable: canCurrentUserInviteProviders ?
            null : ozRegistrationTokenVariable,
          supportToken,
        })
      );
    } else {
      tokenPromise = tokenManager.createTemporaryInviteToken(inviteType, targetRecordId);
    }
    this.set('generatedTokenProxy', PromiseObject.create({
      promise: tokenPromise,
    }));
  },
});
