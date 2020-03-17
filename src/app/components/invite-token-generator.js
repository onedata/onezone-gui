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
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import generateShellCommand from 'onezone-gui/utils/generate-shell-command';
import { all as allFulfilled } from 'rsvp';
import { not, array, raw } from 'ember-awesome-macros';

const inviteTypesWithoutDescription = [
  'supportSpace',
  'registerOneprovider',
  'onedatify',
  'onedatifyWithImport',
];

export default Component.extend(I18n, {
  classNames: ['invite-token-generator'],

  tokenManager: service(),
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
  onGoToAdvancedClick: notImplementedIgnore,

  /**
   * @type {PromiseObject<String>}
   */
  generatedTokenProxy: undefined,

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  description: computed('inviteType', function description() {
    const inviteType = this.get('inviteType');
    if (inviteTypesWithoutDescription.includes(inviteType)) {
      return undefined;
    } else {
      return this.t(`description.${inviteType}`);
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showGoToAdvanced: not(array.includes(
    raw(['onedatify', 'onedatifyWithImport']),
    'inviteType'
  )),

  /**
   * @type {ComputedProperty<String>}
   */
  goToAdvancedUrl: computed('inviteType', 'targetRecord', function goToAdvancedUrl() {
    const {
      router,
      inviteType,
      targetRecord,
    } = this.getProperties('router', 'inviteType', 'targetRecord');

    const options = {
      type: 'invite',
      inviteType,
    };
    if (targetRecord) {
      options.inviteTargetId = get(targetRecord, 'entityId');
    }
    return router.urlFor(
      'onedata.sidebar.content',
      'tokens',
      'new', {
        queryParams: {
          options: serializeAspectOptions(options),
        },
      }
    );
  }),

  init() {
    this._super(...arguments);
    this.generateToken();
  },

  generateToken() {
    const {
      tokenManager,
      targetRecord,
      inviteType,
    } = this.getProperties(
      'tokenManager',
      'targetRecord',
      'inviteType'
    );

    let tokenPromise;
    if (['onedatify', 'onedatifyWithImport'].includes(inviteType)) {
      tokenPromise = allFulfilled([
        tokenManager.createTemporaryInviteToken('registerOneprovider'),
        tokenManager.createTemporaryInviteToken('supportSpace', targetRecord),
      ]).then(([onezoneRegistrationToken, supportToken]) =>
        generateShellCommand(inviteType === 'onedatify' ? 'oneprovider' : 'onedatify', {
          onezoneRegistrationToken,
          supportToken,
        })
      );
    } else {
      tokenPromise = tokenManager.createTemporaryInviteToken(inviteType, targetRecord);
    }
    this.set('generatedTokenProxy', PromiseObject.create({
      promise: tokenPromise,
    }));
  },

  actions: {
    generateAnother() {
      this.generateToken();
    },
    goToAdvancedClick() {
      this.get('onGoToAdvancedClick')();
    },
  },
});
