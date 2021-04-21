import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import generateTokenName from 'onezone-gui/utils/token-editor-utils/generate-token-name';
import sinon from 'sinon';
import moment from 'moment';
import backendifyName from 'onedata-gui-common/utils/backendify-name';
import _ from 'lodash';

describe('Unit | Utility | token editor utils/generate token name', function () {
  beforeEach(function () {
    const now = moment('2020-04-28 10:05:00');
    this.fakeClock = sinon.useFakeTimers({
      now: now.valueOf(),
      shouldAdvanceTime: true,
    });
    this.nowString = now.format('YYYY.MM.DD-HH.mm');
  });

  afterEach(function () {
    this.fakeClock.restore();
  });

  it('returns "Token DATE" when no arguments have been passed', function () {
    const name = generateTokenName();
    expect(name).to.equal(`Token ${this.nowString}`);
  });

  [
    'access',
    'identity',
    'invite',
  ].forEach(type => {
    it(`returns "${_.upperFirst(type)} DATE" when type is "${type}"`, function () {
      const name = generateTokenName(type);
      expect(name).to.equal(`${_.upperFirst(type)} ${this.nowString}`);
    });
  });

  it(
    'returns "Invite DATE" when type is "invite" and inviteType has unknown value',
    function () {
      const name = generateTokenName('invite', 'sth');
      expect(name).to.equal(`Invite ${this.nowString}`);
    }
  );

  [{
    inviteType: 'userJoinGroup',
    nameWithTarget: 'Inv. usr. grp. recordName',
    nameWithoutTarget: 'Inv. usr. grp.',
  }, {
    inviteType: 'groupJoinGroup',
    nameWithTarget: 'Inv. grp. grp. recordName',
    nameWithoutTarget: 'Inv. grp. grp.',
  }, {
    inviteType: 'userJoinSpace',
    nameWithTarget: 'Inv. usr. spc. recordName',
    nameWithoutTarget: 'Inv. usr. spc.',
  }, {
    inviteType: 'groupJoinSpace',
    nameWithTarget: 'Inv. grp. spc. recordName',
    nameWithoutTarget: 'Inv. grp. spc.',
  }, {
    inviteType: 'harvesterJoinSpace',
    nameWithTarget: 'Inv. hrv. spc. recordName',
    nameWithoutTarget: 'Inv. hrv. spc.',
  }, {
    inviteType: 'supportSpace',
    nameWithTarget: 'Support space recordName',
    nameWithoutTarget: 'Support space',
  }, {
    inviteType: 'registerOneprovider',
    // register-oneprovider token target is the user-creator. Mentioning it in a token
    // name is worthless
    nameWithTarget: 'Register Oneprovider',
    nameWithoutTarget: 'Register Oneprovider',
  }, {
    inviteType: 'userJoinCluster',
    nameWithTarget: 'Inv. usr. cls. recordName',
    nameWithoutTarget: 'Inv. usr. cls.',
  }, {
    inviteType: 'groupJoinCluster',
    nameWithTarget: 'Inv. grp. cls. recordName',
    nameWithoutTarget: 'Inv. grp. cls.',
  }, {
    inviteType: 'userJoinHarvester',
    nameWithTarget: 'Inv. usr. hrv. recordName',
    nameWithoutTarget: 'Inv. usr. hrv.',
  }, {
    inviteType: 'groupJoinHarvester',
    nameWithTarget: 'Inv. grp. hrv. recordName',
    nameWithoutTarget: 'Inv. grp. hrv.',
  }, {
    inviteType: 'spaceJoinHarvester',
    nameWithTarget: 'Inv. spc. hrv. recordName',
    nameWithoutTarget: 'Inv. spc. hrv.',
  }, {
    inviteType: 'userJoinAtmInventory',
    nameWithTarget: 'Inv. usr. atm. inv. recordName',
    nameWithoutTarget: 'Inv. usr. atm. inv.',
  }, {
    inviteType: 'groupJoinAtmInventory',
    nameWithTarget: 'Inv. grp. atm. inv. recordName',
    nameWithoutTarget: 'Inv. grp. atm. inv.',
  }].forEach(({ inviteType, nameWithTarget, nameWithoutTarget }) => {
    it(
      `returns "${nameWithoutTarget} DATE" when type is "invite", inviteType is "${inviteType}" and inviteTargetName is not provided`,
      function () {
        const name = generateTokenName('invite', inviteType);
        expect(name).to.equal(`${nameWithoutTarget} ${this.nowString}`);
      }
    );

    it(
      `returns "${nameWithTarget} DATE" when type is "invite", inviteType is "${inviteType}" and inviteTargetName is "recordName"`,
      function () {
        const name = generateTokenName('invite', inviteType, 'recordName');
        expect(name).to.equal(`${nameWithTarget} ${this.nowString}`);
      }
    );
  });

  it('generates name compatible with backend naming convention', function () {
    const name = generateTokenName(
      'invite',
      'userJoinSpace',
      _.times(30, () => 'very').join(' ') + ' long'
    );

    expect(backendifyName(name)).to.equal(name);
  });
});
