import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { fillIn } from 'ember-native-dom-helpers';
import { Promise, resolve, reject } from 'rsvp';
import _ from 'lodash';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | token consumer', function () {
  setupComponentTest('token-consumer', {
    integration: true,
  });

  beforeEach(function () {
    this.originalLoggerError = Ember.Logger.error;
    this.originalTestAdapterException = TestAdapter.exception;
    Ember.Logger.error = function () {};
    Ember.Test.adapter.exception = function () {};

    const tokenManager = lookupService(this, 'token-manager');
    const examineStub = sinon.stub(tokenManager, 'examineToken').returns(resolve());

    const mockedRecords = {};
    [
      'space',
      'group',
    ].forEach(modelName => {
      const serviceName = `${modelName}-manager`;
      const getModelsMethodName = `get${_.upperFirst(modelName)}s`;
      const service = lookupService(this, serviceName);
      mockedRecords[modelName] = _.range(3).map(index => ({
        entityId: `${modelName}${index}`,
        entityType: modelName,
        name: `${modelName}${index}`,
      }));
      sinon.stub(service, getModelsMethodName).resolves({
        list: PromiseArray.create({
          promise: resolve(mockedRecords[modelName]),
        }),
      });
    });

    this.setProperties({
      examineStub,
      mockedRecords,
    });
  });

  afterEach(function () {
    Ember.Logger.error = this.originalLoggerError;
    Ember.Test.adapter.exception = this.originalTestAdapterException;
  });

  it('has class "token-consumer"', function () {
    this.render(hbs `{{token-consumer}}`);

    expect(this.$('.token-consumer')).to.exist;
  });

  it('has token input', function () {
    this.render(hbs `{{token-consumer}}`);

    const $input = this.$('input[type="text"].token-string');
    expect($input).to.exist;
    expect($input).to.have.attr('placeholder', 'Enter token...');
  });

  it('does not invoke examine on init', function () {
    this.render(hbs `{{token-consumer}}`);

    return wait()
      .then(() => expect(this.get('examineStub')).to.not.be.called);
  });

  it('invokes examine on token input', function () {
    this.render(hbs `{{token-consumer}}`);

    return fillIn('.token-string', 'token')
      .then(() => {
        const examineStub = this.get('examineStub');
        expect(examineStub).to.be.calledOnce;
        expect(examineStub).to.be.calledWith('token');
      });
  });

  it('invokes examine many times on subsequent token input', function () {
    this.render(hbs `{{token-consumer}}`);

    return fillIn('.token-string', 'token')
      .then(() => fillIn('.token-string', 'token1'))
      .then(() => fillIn('.token-string', 'token12'))
      .then(() => {
        const examineStub = this.get('examineStub');
        expect(examineStub).to.be.calledThrice;
        expect(examineStub).to.be.calledWith('token');
        expect(examineStub).to.be.calledWith('token1');
        expect(examineStub).to.be.calledWith('token12');
      });
  });

  [{
    type: { accessToken: {} },
    typeText: 'Access',
    name: 'access',
  }, {
    type: { identityToken: {} },
    typeText: 'Identity',
    name: 'identity',
  }].forEach(({ type, typeText, name }) => {
    it(`shows type information for ${name} token`, function () {
      stubExamine(this, 'token', resolve({ type }));

      this.render(hbs `{{token-consumer}}`);

      return fillIn('.token-string', 'token')
        .then(() => expect(this.$('.token-type').text().trim()).to.equal(typeText));
    });
  });

  [{
    inviteSpec: {
      inviteType: 'userJoinGroup',
      groupName: 'someRecord',
    },
    typeText: 'Invite user to group someRecord',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinGroup',
      groupName: 'someRecord',
    },
    typeText: 'Invite group to parent group someRecord',
    modelToSelect: 'group',
  }, {
    inviteSpec: {
      inviteType: 'userJoinSpace',
      spaceName: 'someRecord',
    },
    typeText: 'Invite user to space someRecord',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinSpace',
      spaceName: 'someRecord',
    },
    typeText: 'Invite group to space someRecord',
    modelToSelect: 'group',
  }, {
    inviteSpec: {
      inviteType: 'userJoinCluster',
      clusterName: 'someRecord',
    },
    typeText: 'Invite user to cluster someRecord',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinCluster',
      clusterName: 'someRecord',
    },
    typeText: 'Invite group to cluster someRecord',
    modelToSelect: 'group',
  }, {
    inviteSpec: {
      inviteType: 'userJoinHarvester',
      harvesterName: 'someRecord',
    },
    typeText: 'Invite user to harvester someRecord',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinHarvester',
      harvesterName: 'someRecord',
    },
    typeText: 'Invite group to harvester someRecord',
    modelToSelect: 'group',
  }, {
    inviteSpec: {
      inviteType: 'spaceJoinHarvester',
      harvesterName: 'someRecord',
    },
    typeText: 'Invite space to harvester someRecord',
    modelToSelect: 'space',
  }, {
    inviteSpec: {
      inviteType: 'supportSpace',
      spaceName: 'someRecord',
    },
    typeText: 'Support space someRecord',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'registerOneprovider',
    },
    modelToSelect: null,
    typeText: 'Register Oneprovider',
  }].forEach(({ inviteSpec, typeText, modelToSelect }) => {
    const inviteType = inviteSpec.inviteType;
    it(`shows type information for invite ${inviteType} token`, function () {
      stubExamine(this, 'token', resolve({
        type: {
          inviteToken: inviteSpec,
        },
      }));

      this.render(hbs `{{token-consumer}}`);

      return fillIn('.token-string', 'token')
        .then(() => {
          expect(this.$('.token-type').text().trim()).to.equal(typeText);
          expect(this.$('.type-info .warning-icon')).to.not.exist;
        });
    });

    if (modelToSelect) {
      it(
        `shows joining record selector for invite ${inviteType} token`,
        function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
            targetName: 'someRecord',
          }));

          this.render(hbs `{{token-consumer}}`);

          let joiningRecordHelper = new JoiningRecordHelper();
          return fillIn('.token-string', 'token')
            .then(() => {
              expect(this.$('.joining-record-selector')).to.exist;
              return joiningRecordHelper.open();
            })
            .then(() => {
              _.range(3).forEach(i => {
                const option = joiningRecordHelper.getNthOption(i + 1);
                expect(option.innerText).to.contain(`${modelToSelect}${i}`);
                expect(option.querySelector(`.oneicon-${modelToSelect}`)).to.exist;
              });
            });
        }
      );
    } else {
      it(
        `does not show joining record selector for invite ${inviteType} token`,
        function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
            targetName: 'someRecord',
          }));

          this.render(hbs `{{token-consumer}}`);

          return fillIn('.token-string', 'token')
            .then(() => expect(this.$('.joining-record-selector')).to.not.exist);
        }
      );
    }
  });

  it(
    'shows "unknown" target name and warning for invite token when target name is null',
    function () {
      stubExamine(this, 'token', resolve({
        type: {
          inviteToken: {
            inviteType: 'userJoinSpace',
            spaceName: null,
          },
        },
      }));

      this.render(hbs `{{token-consumer}}`);

      return fillIn('.token-string', 'token')
        .then(() => {
          expect(this.$('.token-type').text().trim())
            .to.equal('Invite user to space unknown');
          const $warningIcon = this.$('.type-info .warning-icon');
          expect($warningIcon).to.exist;
          return new OneTooltipHelper($warningIcon[0]).getText();
        })
        .then(tooltipText => expect(tooltipText).to.equal(
          'Cannot resolve invite target name, this token might be outdated or invalid.'
        ));
    }
  );

  it('informs about incorrect token', function () {
    stubExamine(this, 'token', reject({ id: 'badValueToken' }));

    this.render(hbs `{{token-consumer}}`);

    return fillIn('.token-string', 'token')
      .then(() =>
        expect(this.$('.invalid-token-message').text().trim())
        .to.equal('Provided token is invalid.')
      );
  });

  it('informs about other examine errors', function () {
    stubExamine(this, 'token', reject({ id: 'someOtherError' }));

    this.render(hbs `{{token-consumer}}`);

    return fillIn('.token-string', 'token')
      .then(() =>
        expect(this.$('.resource-load-error').text()).to.contain('someOtherError')
      );
  });

  it('interprets whitespaces in token input as an empty value', function () {
    this.render(hbs `{{token-consumer}}`);

    return fillIn('.token-string', '   ')
      .then(() => {
        expect(this.$('.invalid-token-message')).to.not.exist;
        expect(this.$('.token-type')).to.not.exist;
        expect(this.get('examineStub')).to.not.be.called;
      });
  });

  it('interprets forbidden-only characters in token input as an incorrect token', function () {
    this.render(hbs `{{token-consumer}}`);

    return fillIn('.token-string', '!@#$%^&*()')
      .then(() => {
        expect(this.$('.invalid-token-message')).to.exist;
        expect(this.$('.token-type')).to.not.exist;
        expect(this.get('examineStub')).to.not.be.called;
      });
  });

  it('shows spinner while examining token', function () {
    let resolveRequest;
    stubExamine(this, 'token', new Promise(resolve => resolveRequest = resolve));

    this.render(hbs `{{token-consumer}}`);

    expect(this.$('.spinner')).to.not.exist;
    return fillIn('.token-string', 'token')
      .then(() => {
        expect(this.$('.spinner')).to.exist;
        resolveRequest();
        return wait();
      })
      .then(() => expect(this.$('.spinner')).to.not.exist);
  });
});

function stubExamine(testSuite, token, response) {
  testSuite.get('examineStub').withArgs(token).returns(response);
}

class JoiningRecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.joining-record-selector .ember-basic-dropdown');
  }
}
