/**
 * A component represents tree node, used internally by the one-dynamic-tree 
 * component. For example of tree usage, see one-dynamic-tree documentation.
 * 
 * @module components/one-dynamic-tree/node
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from '../../templates/components/one-dynamic-tree/node';
import DisabledPaths from 'onedata-gui-common/mixins/components/one-dynamic-tree/disabled-paths';

const {
  computed,
  computed: {
    readOnly,
  },
  observer,
  on,
} = Ember;

const CHECKBOX_SELECTION_PATH_REPLACE_REGEX = new RegExp('\\.', 'g');

export default Ember.Component.extend(DisabledPaths, {
  layout,
  tagName: '',

  /**
   * Parent tree component.
   * To inject.
   * @type {Ember.Component}
   */
  parentTree: null,

  /**
   * Path to the parent item.
   * @type {string}
   */
  parentPath: '',

  /**
   * Node definition.
   * To inject.
   * @type {Object}
   */
  definition: null,

  /**
   * Tree values.
   * To inject.
   * @type {Ember.Object}
   */
  values: null,

  /**
   * Tree fields.
   * To inject.
   * @type {Ember.Object}
   */
  fields: null,

  /**
   * Tree checkboxes state.
   * To inject.
   * @type {Ember.Object}
   */
  checkboxSelection: null,

  /**
   * Input value changed action.
   * To inject.
   * @type {Function}
   */
  inputValueChanged: () => {},

  /**
   * Input focused out action.
   * To inject.
   * @type {Function}
   */
  inputFocusedOut: () => {},

  /**
   * Selects/deselects all nested checkboxes.
   * To inject.
   * @type {Function}
   */
  selectNestedCheckboxes: () => {},

  /**
   * If true, all nested checkboxes are selected.
   * @type {computed.boolean}
   */
  _areNestedCheckboxesSelected: null,

  /**
   * 'Select all checkboxes' field definition.
   * @type {Ember.Object}
   */
  _selectCheckboxesField: computed('_path', function () {
    return Ember.Object.create({
      name: this.get('_path'),
      type: 'checkbox',
    });
  }),

  /**
   * Field.
   * @type {Ember.Object}
   */
  _field: computed('fields', '_path', function () {
    return this.get(`fields.${this.get('_path')}`);
  }),

  /**
   * If true, a field is rendered
   */
  _renderField: computed('definition', function () {
    let definition = this.get('definition');
    return !!(!definition.subtree && definition.field);
  }),

  /**
   * Path to value in `values` property
   * @type {computed.string}
   */
  _path: computed('definition', 'parentPath', function () {
    let {
      definition,
      parentPath,
    } = this.getProperties('definition', 'parentPath');
    let path = parentPath;
    if (parentPath) {
      path += '.';
    }
    return path + definition.name;
  }),

  /**
   * True if node field should be disabled
   * @type {computed.boolean}
   */
  _isFieldDisabled: computed('_path', 'disabledFieldsPaths.[]', function () {
    return this.isPathDisabled(this.get('_path'));
  }),

  /**
   * Creates new _areNestedCheckboxesSelected property at each path change
   */
  _pathSelectionObserver: on('init', observer('_path', function () {
    let _path = this.get('_path');
    let selectionPath = _path.replace(
      CHECKBOX_SELECTION_PATH_REPLACE_REGEX,
      '.nodes.'
    );
    this.set(
      '_areNestedCheckboxesSelected',
      readOnly(`checkboxSelection.nodes.${selectionPath}.value`)
    );
  })),
});
