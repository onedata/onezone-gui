/**
 * Definitions common for all fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {EmberObject} TokenEditorFieldContext
 * @property {'create' | 'view' | 'edit'} editorMode
 * @property {Models.Token} [loadedToken] not defined when in "create" mode
 * @property {boolean} areAllCaveatsExpanded
 */
