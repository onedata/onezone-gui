/**
 * Name field of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { validator } from 'ember-cp-validations';
import isRecord from 'onedata-gui-common/utils/is-record';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TokenNameConflictDetector from 'onezone-gui/utils/token-editor-utils/token-name-conflict-detector';

export const NameField = TextField.extend({
  /**
   * @virtual
   * @type {TokenEditorFieldContext}
   */
  context: undefined,

  /**
   * @override
   */
  name: 'name',

  /**
   * @override
   */
  defaultValue: '',

  /**
   * @type {Utils.TokenEditorUtils.TokenNameConflictDetector | null}
   */
  tokenNameConflictDetectorCache: null,

  /**
   * @override
   */
  customValidators: Object.freeze([
    validator('inline', {
      validate(value, options, model) {
        if (!value) {
          return true;
        }
        const field = model.field;
        const tokenRecord = isRecord(field.context?.loadedToken) ?
          field.context.loadedToken : null;
        const errorMsg = String(field.getTranslation('errors.notUnique'));
        return field.tokenNameConflictDetector
          ?.isNameConflicting(value, tokenRecord) ? errorMsg : true;
      },
      dependentKeys: [
        'model.field.{tokenNameConflictDetector.allTokenNames.[],context.loadedToken.name}',
      ],
    }),
  ]),

  /**
   * @type {ComputedProperty<Utils.TokenEditorUtils.TokenNameConflictDetector | null>}
   */
  tokenNameConflictDetector: computed(
    'context.editorMode',
    function tokenNameConflictDetector() {
      this.tokenNameConflictDetectorCache?.destroy();
      return this.tokenNameConflictDetectorCache = this.context?.editorMode !== 'view' ?
        TokenNameConflictDetector.create({ ownerSource: this }) : null;
    }
  ),

  /**
   * @override
   */
  willDestroy() {
    try {
      this.tokenNameConflictDetectorCache?.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
