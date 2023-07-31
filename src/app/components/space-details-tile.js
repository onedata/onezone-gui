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
import { conditional, raw, or, and, not, isEmpty } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import _ from 'lodash';
import { SpaceTag } from './space-configuration/space-tags-selector';

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

  //#region configuration

  readonlyTagsDisplayLimit: 3,

  //#region

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

  organizationName: reads('space.organizationName'),

  description: reads('space.description'),

  tags: reads('space.tags'),

  noTags: isEmpty('tags'),

  inputTags: computed('tags.[]', function inputTags() {
    return this.tags?.map(label => {
      return SpaceTag.create({
        ownerSource: this,
        label,
      }) ?? [];
    });
  }),

  centeredMessage: computed(
    'organizationName',
    'description',
    'noTags',
    function centeredMessage() {
      const tagsPresent = !this.noTags;
      if (!this.organizationName && tagsPresent && !this.description) {
        return this.t('unknownOrganizationNoDescription');
      } else if (this.organizationName && tagsPresent && !this.description) {
        return this.t('noDescription');
      } else if (
        this.organizationName && !tagsPresent && !this.description
      ) {
        return this.t('noTagsOrDescription');
      } else if (
        !this.organizationName &&
        !tagsPresent &&
        !this.description
      ) {
        return this.t('noDetailsProvided');
      }
    },
  ),
});
