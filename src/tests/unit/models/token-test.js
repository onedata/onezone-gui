import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import { set, get, setProperties } from '@ember/object';
import { inviteTokenSubtypeToTargetModelMapping } from 'onezone-gui/models/token';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import gri from 'onedata-gui-websocket-client/utils/gri';
import moment from 'moment';

describe('Unit | Model | token', function () {
  setupModelTest('token', {
    needs: [],
  });

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
      const model = this.subject();
      set(model, 'type', {
        [typeName + 'Token']: {},
      });

      expect(get(model, 'typeName')).to.equal(typeName);
    });
  });

  it('computes undefined subtype based on access token type', function () {
    const model = this.subject();
    set(model, 'type', {
      accessToken: {},
    });

    expect(get(model, 'subtype')).to.be.undefined;
  });

  it('computes non-empty subtype based on invite token type', function () {
    const subtype = 'userJoinGroup';
    const model = this.subject();
    set(model, 'type', {
      inviteToken: {
        subtype,
      },
    });

    expect(get(model, 'subtype')).to.equal(subtype);
  });

  Object.keys(inviteTokenSubtypeToTargetModelMapping).forEach(subtype => {
    const targetModelMapping = inviteTokenSubtypeToTargetModelMapping[subtype];

    it(
      `calculates targetModelName as "${targetModelMapping.modelName}" for subtype ${subtype}`,
      function () {
        const model = this.subject();
        set(model, 'type', {
          inviteToken: {
            subtype,
          },
        });

        expect(get(model, 'targetModelName'))
          .to.equal(targetModelMapping.modelName);
      }
    );

    it(
      `fetches invite token target (${targetModelMapping.modelName}) with subtype ${subtype}`,
      function () {
        const targetModelEntityId = 'someId';
        const targetModelGri = gri({
          entityType: targetModelMapping.modelName,
          entityId: targetModelEntityId,
          aspect: 'instance',
          scope: 'auto',
        });
        const targetModelMock = {
          targetModelGri,
          modelName: targetModelMapping.modelName,
        };
        sinon.stub(this.store(), 'findRecord')
          .withArgs(targetModelMapping.modelName, targetModelGri)
          .returns(resolve(targetModelMock));
        sinon.stub(this.store(), 'adapterFor')
          .withArgs(targetModelMapping.modelName)
          .returns({
            getEntityTypeForModelName(modelName) {
              return modelName;
            },
          });
        const model = this.subject();
        set(model, 'type', {
          inviteToken: {
            subtype,
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
      const model = this.subject();
      set(model, 'caveats', [createTimeCaveat(timestamp)]);

      expect(get(model, 'validUntil')).to.equal(timestamp);
    }
  );

  it(
    'presents expiration time in validUntil property as undefined if time caveat is not defined',
    function () {
      const model = this.subject();
      set(model, 'caveats', []);

      expect(get(model, 'validUntil')).to.be.undefined;
    }
  );

  it('has usageLimitReached == true if usage limit is reached', function () {
    const model = this.subject();
    set(model, 'metadata', {
      usageCount: 3,
      usageLimit: 3,
    });

    expect(get(model, 'usageLimitReached')).to.be.true;
  });

  it('has usageLimitReached == false if usage limit is not reached', function () {
    const model = this.subject();
    set(model, 'metadata', {
      usageCount: 2,
      usageLimit: 3,
    });

    expect(get(model, 'usageLimitReached')).to.be.false;
  });

  it('has usageLimitReached == false if usage limit is not defined', function () {
    const model = this.subject();

    expect(get(model, 'usageLimitReached')).to.be.false;
  });

  it('has isExpired == true when validUntil < now', function () {
    const model = this.subject();
    set(model, 'caveats', [createTimeCaveat(moment().unix() - 3600)]);

    expect(get(model, 'isExpired')).to.be.true;
  });

  it('has isExpired == false when validUntil > now', function () {
    const model = this.subject();
    set(model, 'caveats', [createTimeCaveat(moment().unix() + 3600)]);

    expect(get(model, 'isExpired')).to.be.false;
  });

  it('schedules change of isExpired if validUntil > now', function () {
    const model = this.subject();
    set(model, 'caveats', [createTimeCaveat(moment().unix() + 3600)]);

    this.clock.tick(3601 * 1000);

    expect(get(model, 'isExpired')).to.be.true;
  });

  it(
    'resets scheduled change of isExpired if validUntil has been increased',
    function () {
      const model = this.subject();
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
      const model = this.subject();
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
      const model = this.subject();
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
      const model = this.subject();
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
      const model = this.subject();
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
      const model = this.subject();
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
});

function createTimeCaveat(validUntil) {
  return {
    type: 'time',
    validUntil,
  };
}
