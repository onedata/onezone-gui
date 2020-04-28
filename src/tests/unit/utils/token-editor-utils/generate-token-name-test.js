import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import generateTokenName from 'onezone-gui/utils/token-editor-utils/generate-token-name';
import sinon from 'sinon';
import moment from 'moment';

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

  it('returns "token-DATE" when no arguments have been passed', function () {
    const name = generateTokenName();
    expect(name).to.equal(`token-${this.nowString}`);
  });

  [
    'access',
    'identity',
    'invite',
  ].forEach(type => {
    it(`returns "${type}-DATE" when type is "${type}"`, function () {
      const name = generateTokenName(type);
      expect(name).to.equal(`${type}-${this.nowString}`);
    });
  });

  it(
    'returns "invite-DATE" when type is "invite" and inviteType has unknown value',
    function () {
      const name = generateTokenName('invite', 'sth');
      expect(name).to.equal(`invite-${this.nowString}`);
    }
  );

  [{
    inviteType: 'userJoinGroup',
    nameWithTarget: 'inv-usr-grp-recordName',
    nameWithoutTarget: 'inv-usr-grp',
  }, {
    inviteType: 'groupJoinGroup',
    nameWithTarget: 'inv-grp-grp-recordName',
    nameWithoutTarget: 'inv-grp-grp',
  }, {
    inviteType: 'userJoinSpace',
    nameWithTarget: 'inv-usr-spc-recordName',
    nameWithoutTarget: 'inv-usr-spc',
  }, {
    inviteType: 'groupJoinSpace',
    nameWithTarget: 'inv-grp-spc-recordName',
    nameWithoutTarget: 'inv-grp-spc',
  }, {
    inviteType: 'harvesterJoinSpace',
    nameWithTarget: 'inv-hrv-spc-recordName',
    nameWithoutTarget: 'inv-hrv-spc',
  }, {
    inviteType: 'supportSpace',
    nameWithTarget: 'support-space-recordName',
    nameWithoutTarget: 'support-space',
  }, {
    inviteType: 'registerOneprovider',
    nameWithTarget: 'register-oneprovider',
    nameWithoutTarget: 'register-oneprovider',
  }, {
    inviteType: 'userJoinCluster',
    nameWithTarget: 'inv-usr-cls-recordName',
    nameWithoutTarget: 'inv-usr-cls',
  }, {
    inviteType: 'groupJoinCluster',
    nameWithTarget: 'inv-grp-cls-recordName',
    nameWithoutTarget: 'inv-grp-cls',
  }, {
    inviteType: 'userJoinHarvester',
    nameWithTarget: 'inv-usr-hrv-recordName',
    nameWithoutTarget: 'inv-usr-hrv',
  }, {
    inviteType: 'groupJoinHarvester',
    nameWithTarget: 'inv-grp-hrv-recordName',
    nameWithoutTarget: 'inv-grp-hrv',
  }, {
    inviteType: 'spaceJoinHarvester',
    nameWithTarget: 'inv-spc-hrv-recordName',
    nameWithoutTarget: 'inv-spc-hrv',
  }].forEach(({ inviteType, nameWithTarget, nameWithoutTarget }) => {
    it(
      `returns "${nameWithoutTarget}-DATE" when type is "invite", inviteType is "${inviteType}" and inviteTargetName is not provided`,
      function () {
        const name = generateTokenName('invite', inviteType);
        expect(name).to.equal(`${nameWithoutTarget}-${this.nowString}`);
      }
    );

    it(
      `returns "${nameWithTarget}-DATE" when type is "invite", inviteType is "${inviteType}" and inviteTargetName is "recordName"`,
      function () {
        const name = generateTokenName('invite', inviteType, 'recordName');
        expect(name).to.equal(`${nameWithTarget}-${this.nowString}`);
      }
    );
  });
});
