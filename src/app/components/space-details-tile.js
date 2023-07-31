/**
 * Shows space properties set in space configuration or prompt to configure space.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { conditional, raw } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.spaceDetailsTile',

  /**
   * @type {Models.Space}
   */
  space: undefined,

  tileClassNames: computed('hasSpaceUpdatePrivilege', function tileClassNames() {
    const classes = [
      'space-details-tile',
    ];
    if (this.hasSpaceUpdatePrivilege) {
      classes.push(
        'resource-browse-tile',
        'one-tile-link'
      );
    }
    return classes;
  }),

  tileClass: computed('tileClassNames', function tileClass() {
    return this.tileClassNames?.join(' ') ?? '';
  }),

  hasSpaceUpdatePrivilege: reads('space.privileges.update'),

  tileIsLink: reads('hasSpaceUpdatePrivilege'),

  aspect: conditional(
    'hasSpaceUpdatePrivilege',
    raw('configuration'),
    null
  ),

  /**
   * @type {ComputedProperty<SafeString|''>}
   */
  moreText: conditional(
    'hasSpaceUpdatePrivilege',
    computedT('configure'),
    '',
  ),

  init() {
    this._super(...arguments);
    console.log(this.hasSpaceUpdatePrivilege);
  },
});
