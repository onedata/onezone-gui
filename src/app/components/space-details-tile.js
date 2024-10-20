/**
 * Shows space properties set in space configuration or prompt to configure space.
 *
 * @author Jakub Liput
 * @copyright (C) 2023-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { conditional, raw, isEmpty, and, not } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import { SpaceTag } from './space-configuration/space-tags-selector';
import {
  destroyableComputed,
  initDestroyableCache,
  destroyDestroyableComputedValues,
} from 'onedata-gui-common/utils/destroyable-computed';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.spaceDetailsTile',

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  //#region configuration

  readonlyTagsDisplayLimit: 3,

  //#region

  tileClassNames: computed(
    'hasSpaceUpdatePrivilege',
    'noDetails',
    function tileClassNames() {
      const classes = [
        'space-details-tile',
      ];
      if (this.hasSpaceUpdatePrivilege) {
        classes.push(
          'resource-browse-tile',
          'one-tile-link'
        );
      }
      if (this.noDetails) {
        classes.push(
          'no-details'
        );
      }
      return classes;
    }
  ),

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

  inputTags: destroyableComputed('tags.[]', function inputTags() {
    return this.tags?.map(label => {
      return SpaceTag.create({
        ownerSource: this,
        label,
      }) ?? [];
    });
  }),

  noDetails: and(
    not('organizationName'),
    'noTags',
    not('description'),
  ),

  /**
   * @type {ComputedProperty<SafeString|''>}
   */
  centeredMessage: computed(
    'organizationName',
    'description',
    'noTags',
    function centeredMessage() {
      const tagsPresent = !this.noTags;
      if (this.description) {
        return '';
      } else if (this.organizationName) {
        return this.t(tagsPresent ? 'noDescription' : 'noTagsOrDescription');
      } else {
        return this.t(
          tagsPresent ?
          'unknownOrganizationNoDescription' : 'noDetailsProvided'
        );
      }
    },
  ),

  /**
   * @type {ComputedProperty<SafeString|''>}
   */
  topMessage: computed(
    'organizationName',
    'description',
    'noTags',
    function topMessage() {
      const tagsPresent = !this.noTags;
      if (!this.description) {
        return '';
      } else if (this.organizationName) {
        if (tagsPresent) {
          return '';
        } else {
          return this.t('noTags');
        }
      } else {
        return this.t(tagsPresent ? 'unknownOrganization' : 'unknownOrganizationNoTags');
      }
    },
  ),

  init() {
    initDestroyableCache(this);
    this._super(...arguments);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      destroyDestroyableComputedValues(this);
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    evaluateMoreTagsText(moreTagsCount) {
      return this.t('moreTags', { count: moreTagsCount });
    },
  },
});
