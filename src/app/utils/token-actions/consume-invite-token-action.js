/**
 * Allows to consume invite token and the redirects to target record.
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
        router,
        guiUtils,
      } = this.getProperties(
        'joiningRecord',
        'targetModelName',
        'token',
        'tokenManager',
        'router',
        'guiUtils'
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
          if (get(result, 'status') === 'done') {
            next(() => {
              router.transitionTo(
                'onedata.sidebar.content',
                targetModelName + 's',
                guiUtils.getRoutableIdFor(get(result, 'result'))
              );
            });
          }
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
});
