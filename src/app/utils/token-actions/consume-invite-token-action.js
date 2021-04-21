/**
 * Allows to consume invite token and then redirects to target record.
 * Needs joiningRecord, targetModelName and token passed via context.
 *
 * @module utils/token-actions/consume-invite-token-action
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import trimToken from 'onedata-gui-common/utils/trim-token';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import { next } from '@ember/runloop';

export default Action.extend({
  tokenManager: service(),
  router: service(),
  guiUtils: service(),
  sidebarResources: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.tokenActions.consumeInviteTokenAction',

  /**
   * @type {ComputedProperty<GraphSingleModel>}
   */
  joiningRecord: reads('context.joiningRecord'),

  /**
   * @type {ComputedProperty<String>}
   */
  targetModelName: reads('context.targetModelName'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  dontRedirect: reads('context.dontRedirect'),

  /**
   * @type {ComputedProperty<String>}
   */
  token: computedPipe('context.token', trimToken),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        joiningRecord,
        targetModelName,
        token,
        tokenManager,
      } = this.getProperties(
        'joiningRecord',
        'targetModelName',
        'token',
        'tokenManager',
      );

      const consumePromise = tokenManager.consumeInviteToken(
        token,
        targetModelName,
        joiningRecord.constructor.modelName,
        get(joiningRecord, 'entityId')
      );

      const result = ActionResult.create();
      return result.interceptPromise(consumePromise)
        .catch(() => {})
        .then(() => {
          this.notifyResult(result);
          this.transitionIfSuccess(result);
          return result;
        });
    }
  },

  /**
   * @override
   */
  getSuccessNotificationText(result) {
    const {
      joiningRecord,
      targetModelName,
    } = this.getProperties(
      'joiningRecord',
      'targetModelName',
    );
    const joiningRecordName = get(joiningRecord, 'name');
    const joiningModelName = get(joiningRecord, 'constructor.modelName');
    const targetRecordName = get(result, 'result.name');

    return this.t(`successNotificationText.${targetModelName}.${joiningModelName}`, {
      joiningRecordName,
      targetRecordName,
    });
  },

  transitionIfSuccess(result) {
    const {
      joiningRecord,
      targetModelName,
      dontRedirect,
      router,
      guiUtils,
      sidebarResources,
    } = this.getProperties(
      'joiningRecord',
      'targetModelName',
      'dontRedirect',
      'router',
      'guiUtils',
      'sidebarResources'
    );
    const joiningModelName = get(joiningRecord, 'constructor.modelName');

    if (get(result, 'status') !== 'done' || dontRedirect) {
      return;
    }
    const promiseResult = get(result, 'result');

    let transitionResourceType =
      sidebarResources.getRouteResourceTypeForModelName(targetModelName);
    let transitionRecordId = promiseResult && guiUtils.getRoutableIdFor(promiseResult);
    let transitionAspect = 'index';
    if (
      (targetModelName === 'harvester' && joiningModelName === 'space') ||
      (targetModelName === 'space' && joiningModelName === 'harvester')
    ) {
      transitionAspect = transitionResourceType;
      transitionResourceType =
        sidebarResources.getRouteResourceTypeForModelName(joiningModelName);
      transitionRecordId = guiUtils.getRoutableIdFor(joiningRecord);
    }

    if (transitionRecordId) {
      next(() => {
        router.transitionTo(
          'onedata.sidebar.content.aspect',
          transitionResourceType,
          transitionRecordId,
          transitionAspect
        );
      });
    }
  },
});
