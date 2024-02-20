/**
 * Revoked info field of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { notEqual, raw } from 'ember-awesome-macros';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';

export const RevokedField = ToggleField.extend({
  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  name: 'revoked',

  /**
   * @override
   */
  defaultValue: false,

  /**
   * @override
   */
  isVisible: notEqual('context.editorMode', raw('create')),
});
