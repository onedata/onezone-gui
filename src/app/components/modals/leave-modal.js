/**
 * A modal that acknowledges leaving current user from some record.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { eq, raw, promise } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

/**
 * @typedef {Object} LeaveModalOptions
 * @property {GraphSingleModel} recordToLeave
 */

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  recordManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.leaveModal',

  /**
   * @virtual
   * @type {string}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {LeaveModalOptions}
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<GraphSingleModel>}
   */
  recordToLeave: reads('modalOptions.recordToLeave'),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  translatedModelNameToLeave: computed(
    'recordToLeave',
    function translatedModelNameToLeave() {
      const modelName = this.recordToLeave ?
        this.recordManager.getModelNameForRecord(this.recordToLeave) : null;
      if (!modelName) {
        return null;
      }

      return this.t(`common.modelNames.${modelName}`, {}, {
        usePrefix: false,
        defaultValue: null,
      });
    }
  ),

  /**
   * @type {ComputedProperty<Models.User>}
   */
  currentUser: computed(function currentUser() {
    return this.recordManager.getCurrentUserRecord();
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  modalHeader: computed('translatedModelNameToLeave', function modalHeader() {
    return this.t('header', { readableModelName: this.translatedModelNameToLeave ?? '' });
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCurrentUserDirectMember: eq('recordToLeave.directMembership', raw(true)),

  /**
   * @type {ComputedProperty<PromiseObject<boolean>>}
   */
  isCurrentUserIndirectMemberProxy: promise.object(computed(
    'recordToLeave',
    async function isCurrentUserIndirectMemberProxy() {
      try {
        const currentUserMembership =
          await this.recordManager.getCurrentUserMembership(this.recordToLeave);
        return currentUserMembership.intermediaries.length > 0;
      } catch (error) {
        console.error(
          'Could not load current user membership information for given record due to error.',
          this.recordToLeave,
          error
        );
        // We don't know if current user is an indirect member of `recordToLeave`,
        // so we have to assume something - lets suppose, that he isn't.
        return false;
      }
    }
  )),

  /**
   * @type {ComputedProperty<boolean | null>}
   */
  isCurrentUserIndirectMember: reads('isCurrentUserIndirectMemberProxy.content'),

  /**
   * @type {ComputedProperty<{ main: SafeString, beforeMemberships: SafeString, afterMemberships: SafeString }>}
   */
  infoText: computed(
    'isCurrentUserDirectMember',
    'isCurrentUserIndirectMember',
    'translatedModelNameToLeave',
    'recordToLeave.name',
    function infoText() {
      const translationData = {
        readableModelName: this.translatedModelNameToLeave ?? '',
        recordName: get(this.recordToLeave, 'name'),
      };
      const modelName = this.recordManager.getModelNameForRecord(this.recordToLeave);
      let translationName;
      if (this.isCurrentUserDirectMember) {
        if (this.isCurrentUserIndirectMember) {
          translationName = 'infoDirectAndIndirect';
        } else {
          translationName = 'infoOnlyDirect';
        }
      } else {
        if (this.isCurrentUserIndirectMember) {
          translationName = 'infoOnlyIndirect';
        } else {
          translationName = 'infoNotMember';
        }
      }

      return {
        main: this.t(`${translationName}.main.${modelName}`, translationData, {
          defaultValue: this.t(`${translationName}.main.generic`, translationData),
        }),
        beforeMemberships: this.t(
          `${translationName}.beforeMemberships`,
          translationData, {
            defaultValue: '',
          }
        ),
        afterMemberships: this.t(`${translationName}.afterMemberships`, translationData, {
          defaultValue: '',
        }),
      };
    }
  ),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  loadingProxy: reads('isCurrentUserIndirectMemberProxy'),

  actions: {
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        await submitCallback();
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
