/**
 * Shows space properties set in space configuration or prompt to configure space.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { conditional, raw, or, and, not } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import _ from 'lodash';

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

  hasAnyDetail: computed(
    'space.{organizationName,description,tags}',
    function hasAnyDetail() {
      const {
        organizationName,
        description,
        tags,
      } = getProperties(
        this.space,
        'organizationName',
        'description',
        'tags'
      );
      return Boolean(organizationName) ||
        Boolean(description) ||
        !_.isEmpty(tags);
    }
  ),

  centeredMessage: or(
    and(not('hasAnyDetail'), computedT('noDetailsProvided')),
  ),
});
