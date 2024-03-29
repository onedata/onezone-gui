/**
 * Renders single login button. Can optionally have a "link" property set to go
 * to a provided link instead of invoking action.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import contrast from 'contrast';
import {
  defaultIconBackgroundColor,
  defaultIconPath,
  darkFgColor,
  lightFgColor,
} from 'onezone-gui/utils/auth-box-config';
import Color from 'color';
import globals from 'onedata-gui-common/utils/globals';

export default Component.extend({
  tagName: 'div',
  classNames: ['auth-icon-box'],

  /**
   * @virtual
   * Id of authorizer, e.g. google, plgrid, dropbox, google, facebook, ...
   * @type {string}
   */
  authId: undefined,

  /**
   * @virtual
   * @type {string}
   */
  iconBackgroundColor: undefined,

  /**
   * @virtual
   * URL to go when clicked
   * @type {string}
   */
  link: '',

  /**
   * @virtual
   * Text for tooltip
   * @type {string}
   */
  tip: '',

  /**
   * If true, box is used to authenticate - spinner is visible instead of image
   * @type {boolean}
   */
  active: false,

  /**
   * Spinner scale
   * @type {number}
   */
  spinnerScale: 0.25,

  /**
   * Action called on click
   * @type {function}
   * @param {Ember.Component} thisComponent this component instance
   * @returns {undefined}
   */
  action: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  authIconStyle: computed('authId', 'iconPath', {
    get() {
      if (this.injectedAuthIconStyle) {
        return this.injectedAuthIconStyle;
      }
      const iconPath = this.iconPath ?? defaultIconPath;
      const style = `background-image: url(${iconPath});`;
      return htmlSafe(style);
    },
    set(key, value) {
      return this.injectedAuthIconStyle = value;
    },
  }),

  /**
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  aStyle: computed('iconBackgroundColor', {
    get() {
      if (this.injectedAStyle) {
        return this.injectedAStyle;
      }
      const iconBackgroundColor = this.iconBackgroundColor ??
        defaultIconBackgroundColor;
      const fgColor = contrast(iconBackgroundColor) === 'light' ? darkFgColor :
        lightFgColor;
      const color = new Color(iconBackgroundColor);
      const borderColor = color.darken(0.15);
      const style =
        `background-color: ${iconBackgroundColor}; color: ${fgColor}; border-color: ${borderColor};`;
      return htmlSafe(style);
    },
    set(key, value) {
      return this.injectedAStyle = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedAuthIconStyle: null,

  /**
   * @type {string | null}
   */
  injectedAStyle: null,

  hasLink: computed('link', function hasLink() {
    const link = this.get('link');
    return link && link.length !== 0;
  }),

  init() {
    this._super(...arguments);
    const {
      aStyle,
      authIconStyle,
    } = this.getProperties('aStyle', 'authIconStyle');
    if (typeof aStyle === 'string') {
      this.set('aStyle', htmlSafe(aStyle));
    }
    if (typeof authIconStyle === 'string') {
      this.set('authIconStyle', htmlSafe(authIconStyle));
    }
  },

  actions: {
    clicked() {
      const {
        disabled,
        link,
        action,
      } = this.getProperties('disabled', 'link', 'action');
      this.element.dispatchEvent(new Event('mouseleave'));
      if (!disabled) {
        if (link) {
          globals.window.location = link;
        } else {
          action(this);
        }
      }
    },
  },
});
