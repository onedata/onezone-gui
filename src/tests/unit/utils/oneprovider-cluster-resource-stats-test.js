import { expect } from 'chai';
import { describe, it } from 'mocha';
import oneproviderClusterResourceStats from 'onezone-gui/utils/oneprovider-cluster-resource-stats';
import { resolve } from 'rsvp';

describe('Unit | Utility | oneprovider cluster resource stats', function () {
  it('creates the Oneprovider cluster stats object', function () {
    const cluster = {
      oneproviderEffectiveUsers: resolve({
        list: ['a', 'b'],
      }),
      oneproviderEffectiveGroups: resolve({
        list: ['a', 'b', 'c'],
      }),
      oneproviderSpaces: resolve({
        list: ['a', 'b', 'c', 'd'],
      }),
    };

    return oneproviderClusterResourceStats(cluster).then(result => {
      expect(result).to.have.property('usersCount');
      expect(result.usersCount).to.equal(2);
      expect(result).to.have.property('groupsCount');
      expect(result.groupsCount).to.equal(3);
      expect(result).to.have.property('spacesCount');
      expect(result.spacesCount).to.equal(4);
    });
  });
});
