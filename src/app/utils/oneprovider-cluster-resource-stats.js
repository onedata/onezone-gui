/**
 * Creates object with count of various resources of Oneprovider cluster
 * 
 * @module utils/oneprovider-cluster-resource-stats
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { hash } from 'rsvp';

export default function oneproviderClusterResourceStats(cluster) {
  return hash({
    usersCount: get(cluster, 'oneproviderEffectiveUsers')
      .then(effUsers => get(effUsers, 'list.length')),
    groupsCount: get(cluster, 'oneproviderEffectiveGroups')
      .then(effGroups => get(effGroups, 'list.length')),
    spacesCount: get(cluster, 'oneproviderSpaces')
      .then(spaces => get(spaces, 'list.length')),
  });
}
