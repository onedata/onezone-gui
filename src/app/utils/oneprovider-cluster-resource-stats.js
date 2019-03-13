/**
 * Creates object with count of various resources of Oneprovider cluster
 * 
 * @module utils/oneprovider-cluster-resource-stats
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, set } from '@ember/object';

export default function oneproviderClusterResourceStats(cluster) {
  const stats = {};
  return get(cluster, 'oneproviderEffectiveUsers')
    .then(effUsers => {
      set(stats, 'usersCount', get(effUsers, 'list.length'));
      return get(cluster, 'oneproviderEffectiveGroups');
    })
    .then(effGroups => {
      set(stats, 'groupsCount', get(effGroups, 'list.length'));
      return get(cluster, 'oneproviderSpaces');
    })
    .then(spaces => {
      set(stats, 'spacesCount', get(spaces, 'list.length'));
      return stats;
    });
}
