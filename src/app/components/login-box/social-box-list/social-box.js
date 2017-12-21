import Ember from 'ember';

/**
 * Renders single login button. Can optionally has a "link" property set to go
 * to a provided link instead of invoking action.
 * @module components/social-box
 * @author Jakub Liput
 * @copyright (C) 2016-2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const {
  computed,
  String: { htmlSafe },
} = Ember;

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['social-box'],

  /**
   * Use oneicon (fonticon) or image placed in ``/assets/images/auth-providers/{iconName}.{iconType}``
   * @type {string} one of: oneicon, png, jpg, svg, <or other image format>
   */
  iconType: 'oneicon',

  /**
   * Oneicon character name (for iconType == oneicon) or image file name
   * (without extension)
   * @type {string}
   */
  iconName: 'key',

  /** Name of social/login service (eg. 'twitter') */
  type: null,

  /** Href for link when clicked */
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

  _iconName: computed('iconType', 'iconName', function() {
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

  socialIconStyle: computed('_iconName', 'iconType', function () {
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

  hasLink: function() {
    let link = this.get('link');
    return link && link.length !== 0;
  }.property('link'),

  click() {
    // hide tooltip
    this.$()[0].dispatchEvent(new Event('mouseleave'));
  },

  actions: {
    clicked() {
      if (!this.get('disabled')) {
        if (this.get('hasLink')) {
          window.location = this.get('link');
        } else {
          this.sendAction('action', this);
        }
      }
    },
  },
});
