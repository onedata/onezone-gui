/**
 * Renders single login button. Can optionally have a "link" property set to go
 * to a provided link instead of invoking action.
 * @module components/login-box/social-box-list/social-box
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2016-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  tagName: 'div',
  classNames: ['social-box'],

  /**
   * Use oneicon (fonticon) or image placed in 
   * `/assets/images/auth-providers/{iconName}.{iconType}`
   * @type {string} one of: oneicon, png, jpg, svg, <or other image format>
   */
  iconType: 'oneicon',

  /**
   * Oneicon character name (for iconType == oneicon) or image file name
   * (without extension)
   * @virtual
   * @type {string}
   */
  iconName: 'key',

  /**
   * If true, box is used to authenticate - spinner is visible instead of image
   * @type {boolean}
   */
  active: false,

  /** Name of social/login service (eg. 'twitter')
   * @type {string}
   */
  type: null,

  /**
   * Href for link when clicked
   * @type {string}
   */
  link: '',

  /**
   * Text for tooltip
   * @type {string}
   */
  tip: '',

  /**
   * Spinner scale
   * @type {number}
   */
  spinnerScale: 0.25,

  /**
   * Action called on click
   * @type {function}
   * @param {Ember.Component} thisComponent this component instance
   * @return {undefined}
   */
  action: () => {},

  /**
   * Property only for testing purposes.
   * @type {Window}
   */
  _window: window,

  /**
   * Full icon name (oneicon glyph name or file path).
   * @type {Ember.ComputedProperty<string>}
   */
  _iconName: computed('iconType', 'iconName', function () {
    let {
      iconName,
      iconType,
    } = this.getProperties('iconName', 'iconType');
    if (iconType === 'oneicon') {
      return iconName;
    } else {
      return `/assets/images/auth-providers/${iconName}.${iconType}`;
    }
  }),

  /**
   * Custom css styles for icon.
   * @type {Ember.ComputedProperty<string>}
   */
  _socialIconStyle: computed('_iconName', 'iconType', function () {
    let {
      _iconName,
      iconType,
    } = this.getProperties('_iconName', 'iconType');
    let style = '';
    if (iconType !== 'oneicon') {
      style = `background-image: url(${_iconName});`;
    } else {
      style = '';
    }
    return htmlSafe(style);
  }),

  actions: {
    clicked() {
      const {
        disabled,
        link,
        _window,
        action,
      } = this.getProperties('disabled', 'link', '_window', 'action');
      this.element.dispatchEvent(new Event('mouseleave'));
      if (!disabled) {
        if (link) {
          _window.location = link;
        } else {
          action(this);
        }
      }
    },
  },
});
