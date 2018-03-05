/**
 * Add a computed property checking if the component is holding a default space
 *
 * @module mixins/has-default-space
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Mixin.create({
  /**
   * @virtual
   * @property {models/Space} space
   */

  /**
   * @virtual
   * @property {ProxyObject} userProxy
   */

  /**
   * @type {string}
   */
  spaceEntityId: reads('space.entityId'),

  /**
   * @type {string}
   */
  defaultSpaceId: reads('userProxy.content.defaultSpaceId'),

  /**
   * @returns {boolean|undefined} true if loaded space is the default
   */
  hasDefaultSpace: computed(
    'spaceEntityId',
    'defaultSpaceId',
    function getIsDefaultSpace() {
      const {
        spaceEntityId,
        defaultSpaceId,
      } = this.getProperties(
        'spaceEntityId',
        'defaultSpaceId',
      );
      return spaceEntityId && defaultSpaceId && (spaceEntityId === defaultSpaceId);
    }
  ),
});
