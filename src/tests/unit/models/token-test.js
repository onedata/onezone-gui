import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { set, get, setProperties } from '@ember/object';
import {
  tokenInviteTypeToTargetModelMapping,
} from 'onezone-gui/models/token';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import gri from 'onedata-gui-websocket-client/utils/gri';
import moment from 'moment';
import { underscore } from '@ember/string';

describe('Unit | Model | token', function () {
  const { afterEach } = setupTest();

  beforeEach(function () {
    this.clock = sinon.useFakeTimers(moment().valueOf());
  });

  afterEach(function () {
    this.clock.restore();
  });

  [
    'access',
    'invite',
  ].forEach(typeName => {
    it(`computes "${typeName}" typeName based on type`, function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'type', {
        [typeName + 'Token']: {},
      });

      expect(get(model, 'typeName')).to.equal(typeName);
    });
  });

  it('computes undefined invite type based on access token type', function () {
    const model = this.owner.lookup('service:store').createRecord('token', {});
    set(model, 'type', {
      accessToken: {},
    });

    expect(get(model, 'inviteType')).to.be.undefined;
  });

  it('computes non-empty invite type based on invite token type', function () {
    const inviteType = 'userJoinGroup';
    const model = this.owner.lookup('service:store').createRecord('token', {});
    set(model, 'type', {
      inviteToken: {
        inviteType,
      },
    });

    expect(get(model, 'inviteType')).to.equal(inviteType);
  });

  Object.keys(tokenInviteTypeToTargetModelMapping).forEach(inviteType => {
    const targetModelMapping = tokenInviteTypeToTargetModelMapping[inviteType];

    it(
      `calculates targetModelName as "${targetModelMapping.modelName}" for invite type ${inviteType}`,
      function () {
        const model = this.owner.lookup('service:store').createRecord('token', {});
        set(model, 'type', {
          inviteToken: {
            inviteType,
          },
        });

        expect(get(model, 'targetModelName'))
          .to.equal(targetModelMapping.modelName);
      }
    );

    it(
      `fetches invite token target (${targetModelMapping.modelName}) with invite type ${inviteType}`,
      function () {
        const targetModelEntityId = 'someId';
        const targetModelGri = gri({
          entityType: underscore(targetModelMapping.modelName),
          entityId: targetModelEntityId,
          aspect: 'instance',
          scope: 'auto',
        });
        const targetModelMock = {
          targetModelGri,
          modelName: targetModelMapping.modelName,
        };
        const store = this.owner.lookup('service:store');
        sinon.stub(store, 'findRecord')
          .withArgs(targetModelMapping.modelName, targetModelGri)
          .returns(resolve(targetModelMock));
        sinon.stub(store, 'adapterFor')
          .withArgs(targetModelMapping.modelName)
          .returns({
            getEntityTypeForModelName(modelName) {
              return underscore(modelName);
            },
          });
        const model = store.createRecord('token', {});
        set(model, 'type', {
          inviteToken: {
            inviteType,
            [targetModelMapping.idFieldName]: targetModelEntityId,
          },
        });

        return get(model, 'tokenTargetProxy').then(result => {
          expect(result).to.deep.equal(targetModelMock);
        });
      }
    );
  });

  it(
    'presents expiration time in validUntil property if time caveat is defined',
    function () {
      const timestamp = 1571677127;
      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'caveats', [createTimeCaveat(timestamp)]);

      expect(get(model, 'validUntil')).to.equal(timestamp);
    }
  );

  it(
    'presents expiration time in validUntil property as undefined if time caveat is not defined',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'caveats', []);

      expect(get(model, 'validUntil')).to.be.undefined;
    }
  );

  it('has usageLimitReached == true if usage limit is reached', function () {
    const model = this.owner.lookup('service:store').createRecord('token', {});
    set(model, 'metadata', {
      usageCount: 3,
      usageLimit: 3,
    });

    expect(get(model, 'usageLimitReached')).to.be.true;
  });

  it('has usageLimitReached == false if usage limit is not reached', function () {
    const model = this.owner.lookup('service:store').createRecord('token', {});
    set(model, 'metadata', {
      usageCount: 2,
      usageLimit: 3,
    });

    expect(get(model, 'usageLimitReached')).to.be.false;
  });

  it('has usageLimitReached == false if usage limit is not defined', function () {
    const model = this.owner.lookup('service:store').createRecord('token', {});

    expect(get(model, 'usageLimitReached')).to.be.false;
  });

  it('has isExpired == true when validUntil < now', function () {
    const model = this.owner.lookup('service:store').createRecord('token', {});
    set(model, 'caveats', [createTimeCaveat(moment().unix() - 3600)]);

    expect(get(model, 'isExpired')).to.be.true;
  });

  it('has isExpired == false when validUntil > now', function () {
    const model = this.owner.lookup('service:store').createRecord('token', {});
    set(model, 'caveats', [createTimeCaveat(moment().unix() + 3600)]);

    expect(get(model, 'isExpired')).to.be.false;
  });

  it('schedules change of isExpired if validUntil > now', function () {
    const model = this.owner.lookup('service:store').createRecord('token', {});
    set(model, 'caveats', [createTimeCaveat(moment().unix() + 3600)]);

    this.clock.tick(3601 * 1000);

    expect(get(model, 'isExpired')).to.be.true;
  });

  it(
    'resets scheduled change of isExpired if validUntil has been increased',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'caveats', [createTimeCaveat(moment().unix() + 600)]);
      this.clock.tick(1 * 1000);
      set(model, 'caveats', [createTimeCaveat(moment().unix() + 3600)]);
      this.clock.tick(600 * 1000);

      expect(get(model, 'isExpired')).to.be.false;

      this.clock.tick(3001 * 1000);

      expect(get(model, 'isExpired')).to.be.true;
    }
  );

  it(
    'removes scheduled change of isExpired if validUntil becomes undefined',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'caveats', [createTimeCaveat(moment().unix() + 3600)]);
      this.clock.tick(1 * 1000);
      set(model, 'caveats', []);
      this.clock.tick(3601 * 1000);

      expect(get(model, 'isExpired')).to.be.false;
    }
  );

  it(
    'has isActive == true and isObsolete == false if isExpired == false, revoked == false and usageLimitReached == false',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      setProperties(model, {
        caveats: [createTimeCaveat(moment().unix() + 3600)],
        metadata: {
          usageCount: 0,
          usageLimit: 3,
        },
        revoked: false,
      });

      expect(get(model, 'isActive')).to.be.true;
      expect(get(model, 'isObsolete')).to.be.false;
    }
  );

  it(
    'has isActive == false and isObsolete == true if isExpired == true, revoked == false and usageLimitReached == false',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      setProperties(model, {
        caveats: [createTimeCaveat(moment().unix() - 3600)],
        metadata: {
          usageCount: 0,
          usageLimit: 3,
        },
        revoked: false,
      });

      expect(get(model, 'isActive')).to.be.false;
      expect(get(model, 'isObsolete')).to.be.true;
    }
  );

  it(
    'has isActive == false and isObsolete == false if isExpired == false, revoked == true and usageLimitReached == false',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      setProperties(model, {
        caveats: [createTimeCaveat(moment().unix() + 3600)],
        metadata: {
          usageCount: 0,
          usageLimit: 3,
        },
        revoked: true,
      });

      expect(get(model, 'isActive')).to.be.false;
      expect(get(model, 'isObsolete')).to.be.false;
    }
  );

  it(
    'has isActive == false and isObsolete == true if isExpired == false, revoked == false and usageLimitReached == true',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      setProperties(model, {
        caveats: [createTimeCaveat(moment().unix() + 3600)],
        metadata: {
          usageCount: 3,
          usageLimit: 3,
        },
        revoked: false,
      });

      expect(get(model, 'isActive')).to.be.false;
      expect(get(model, 'isObsolete')).to.be.true;
    }
  );

  it(
    'has token privileges available through privileges property',
    function () {
      const privileges = ['space_view'];

      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'metadata', {
        privileges,
      });

      expect(get(model, 'privileges')).to.equal(privileges);
    }
  );

  it(
    'has token usage limit available through usageLimit property',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'metadata', {
        usageLimit: 4,
      });

      expect(get(model, 'usageLimit')).to.equal(4);
    }
  );

  it(
    'has token usage count available through usageCount property',
    function () {
      const model = this.owner.lookup('service:store').createRecord('token', {});
      set(model, 'metadata', {
        usageCount: 3,
      });

      expect(get(model, 'usageCount')).to.equal(3);
    }
  );
});

function createTimeCaveat(validUntil) {
  return {
    type: 'time',
    validUntil,
  };
}
