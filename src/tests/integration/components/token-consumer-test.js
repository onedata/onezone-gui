import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { fillIn, click } from 'ember-native-dom-helpers';
import { Promise, resolve, reject } from 'rsvp';
import _ from 'lodash';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';
import OneTooltipHelper from '../../helpers/one-tooltip';
import { dasherize } from '@ember/string';

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
    const verifyInviteTokenStub = sinon.stub(tokenManager, 'verifyInviteToken')
      .returns(resolve());
    const recordManager = lookupService(this, 'record-manager');
    const getUserRecordListStub = sinon.stub(recordManager, 'getUserRecordList');

    const mockedRecords = {};
    [
      'space',
      'group',
      'harvester',
      'atmInventory',
    ].forEach(modelName => {
      mockedRecords[modelName] = _.range(3).map(index => ({
        entityId: `${modelName}${index}`,
        entityType: modelName,
        name: `${modelName}${index}`,
        constructor: {
          modelName: dasherize(modelName),
        },
      }));
      getUserRecordListStub.withArgs(modelName).resolves({
        list: PromiseArray.create({
          promise: resolve(mockedRecords[modelName]),
        }),
      });
    });

    this.setProperties({
      examineStub,
      mockedRecords,
      verifyInviteTokenStub,
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
    typeText: 'Access token',
    name: 'access',
  }, {
    type: { identityToken: {} },
    typeText: 'Identity token',
    name: 'identity',
  }].forEach(({ type, typeText, name }) => {
    it(`shows type information for ${name} token`, function () {
      stubExamine(this, 'token', resolve({ type }));

      this.render(hbs `{{token-consumer}}`);

      return fillIn('.token-string', 'token')
        .then(() => expect(this.$('.token-type').text().trim()).to.equal(typeText));
    });

    it(`does not show "Join" button for ${name} token`, function () {
      stubExamine(this, 'token', resolve({ type }));

      this.render(hbs `{{token-consumer}}`);

      return fillIn('.token-string', 'token')
        .then(() => {
          expect(this.$('.no-join-message').text().trim()).to.equal(
            'This is not an invite token and cannot be used to join to any resource.'
          );
          expect(this.$('.confirm-btn')).to.not.exist;
        });
    });
  });

  function selectorDescription(targetModelName, joiningModelName, actionOnSubject) {
    return `To consume this token, please select a ${joiningModelName} of yours that will ${actionOnSubject} the ${targetModelName} someRecord:`;
  }

  [{
    inviteSpec: {
      inviteType: 'userJoinGroup',
      groupName: 'someRecord',
    },
    typeText: 'Invitation to join a group',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinGroup',
      groupName: 'someRecord',
    },
    typeText: 'Invitation for your group to join a parent group',
    modelToSelect: 'group',
    selectorIcon: 'group',
    selectorDescription: selectorDescription('parent group', 'group', 'join'),
    selectorPlaceholder: 'Select group...',
  }, {
    inviteSpec: {
      inviteType: 'userJoinSpace',
      spaceName: 'someRecord',
    },
    typeText: 'Invitation to join a space',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinSpace',
      spaceName: 'someRecord',
    },
    typeText: 'Invitation for your group to join a space',
    modelToSelect: 'group',
    selectorIcon: 'group',
    selectorDescription: selectorDescription('space', 'group', 'join'),
    selectorPlaceholder: 'Select group...',
  }, {
    inviteSpec: {
      inviteType: 'harvesterJoinSpace',
      spaceName: 'someRecord',
    },
    typeText: 'Invitation for your harvester to become a metadata consumer for a space',
    modelToSelect: 'harvester',
    selectorIcon: 'light-bulb',
    selectorDescription: selectorDescription('space', 'harvester', 'be added to'),
    selectorPlaceholder: 'Select harvester...',
  }, {
    inviteSpec: {
      inviteType: 'userJoinCluster',
      clusterName: 'someRecord',
    },
    typeText: 'Invitation to join a cluster',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinCluster',
      clusterName: 'someRecord',
    },
    typeText: 'Invitation for your group to join a cluster',
    modelToSelect: 'group',
    selectorIcon: 'group',
    selectorDescription: selectorDescription('cluster', 'group', 'join'),
    selectorPlaceholder: 'Select group...',
  }, {
    inviteSpec: {
      inviteType: 'userJoinHarvester',
      harvesterName: 'someRecord',
    },
    typeText: 'Invitation to join a harvester',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinHarvester',
      harvesterName: 'someRecord',
    },
    typeText: 'Invitation for your group to join a harvester',
    modelToSelect: 'group',
    selectorIcon: 'group',
    selectorDescription: selectorDescription('harvester', 'group', 'join'),
    selectorPlaceholder: 'Select group...',
  }, {
    inviteSpec: {
      inviteType: 'spaceJoinHarvester',
      harvesterName: 'someRecord',
    },
    typeText: 'Invitation for your space to become a metadata source for a harvester',
    modelToSelect: 'space',
    selectorIcon: 'space',
    selectorDescription: selectorDescription('harvester', 'space', 'be added to'),
    selectorPlaceholder: 'Select space...',
  }, {
    inviteSpec: {
      inviteType: 'userJoinAtmInventory',
      atmInventoryName: 'someRecord',
    },
    typeText: 'Invitation to join an automation inventory',
    modelToSelect: null,
  }, {
    inviteSpec: {
      inviteType: 'groupJoinAtmInventory',
      atmInventoryName: 'someRecord',
    },
    typeText: 'Invitation for your group to join an automation inventory',
    modelToSelect: 'group',
    selectorIcon: 'group',
    selectorDescription: selectorDescription('automation inventory', 'group', 'join'),
    selectorPlaceholder: 'Select group...',
  }, {
    inviteSpec: {
      inviteType: 'supportSpace',
      spaceName: 'someRecord',
    },
    typeText: 'Support space someRecord',
    modelToSelect: null,
    noJoinMessage: 'This token can be consumed only while giving a support to a space in Oneprovider Panel.',
  }, {
    inviteSpec: {
      inviteType: 'registerOneprovider',
    },
    modelToSelect: null,
    typeText: 'Register Oneprovider',
    noJoinMessage: 'This token can be consumed only during the setup of a new Oneprovider cluster.',
  }].forEach(({
    inviteSpec,
    typeText,
    modelToSelect,
    selectorIcon,
    selectorPlaceholder,
    noJoinMessage,
    selectorDescription,
  }) => {
    const inviteType = inviteSpec.inviteType;

    if (noJoinMessage) {
      it(`does not show "Confirm" button for invite ${inviteType} token`, function () {
        stubExamine(this, 'token', resolve({
          type: {
            inviteToken: inviteSpec,
          },
        }));

        this.render(hbs `{{token-consumer}}`);

        return fillIn('.token-string', 'token')
          .then(() => {
            expect(this.$('.no-join-message').text().trim()).to.equal(noJoinMessage);
            expect(this.$('.confirm-btn')).to.not.exist;
          });
      });
    } else {
      it(`shows "Confirm" button for invite ${inviteType} token`, function () {
        stubExamine(this, 'token', resolve({
          type: {
            inviteToken: inviteSpec,
          },
        }));

        this.render(hbs `{{token-consumer}}`);

        return fillIn('.token-string', 'token')
          .then(() => {
            expect(this.$('.no-join-message')).to.not.exist;
            expect(this.$('.confirm-btn')).to.exist;
          });
      });
    }

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

          const joiningRecordHelper = new JoiningRecordHelper();
          return fillIn('.token-string', 'token')
            .then(() => {
              const $recordSelector = this.$('.joining-record-selector');
              expect($recordSelector).to.exist;
              expect(this.$('.selector-description').text().trim())
                .to.equal(selectorDescription);
              expect(
                $recordSelector.find('.ember-power-select-placeholder').text().trim()
              ).to.equal(selectorPlaceholder);
              return joiningRecordHelper.open();
            })
            .then(() => {
              _.range(3).forEach(i => {
                const option = joiningRecordHelper.getNthOption(i + 1);
                expect(option.innerText).to.contain(`${modelToSelect}${i}`);
                expect(option.querySelector(`.oneicon-${selectorIcon}`)).to.exist;
              });
            });
        }
      );

      it(
        `has disabled "Confirm" button for invite ${inviteType} token when no target record is selected`,
        function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
          }));

          this.render(hbs `{{token-consumer}}`);

          return fillIn('.token-string', 'token')
            .then(() => expect(this.$('.confirm-btn')).to.have.attr('disabled'));
        }
      );

      it(
        `has enabled "Confirm" button for invite ${inviteType} token when target record is selected`,
        function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
          }));

          this.render(hbs `{{token-consumer}}`);

          return fillIn('.token-string', 'token')
            .then(() => new JoiningRecordHelper().selectOption(1))
            .then(() => expect(this.$('.confirm-btn')).to.not.have.attr('disabled'));
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

      it(
        `has enabled "Confirm" button for invite ${inviteType} token`,
        function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
          }));

          this.render(hbs `{{token-consumer}}`);

          return fillIn('.token-string', 'token')
            .then(() => expect(this.$('.confirm-btn')).to.not.have.attr('disabled'));
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
            .to.equal('Invitation to join a space');
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

  it(
    'interprets forbidden-only characters in token input as an incorrect token',
    function () {
      this.render(hbs `{{token-consumer}}`);

      return fillIn('.token-string', '!@#$%^&*()')
        .then(() => {
          expect(this.$('.invalid-token-message')).to.exist;
          expect(this.$('.token-type')).to.not.exist;
          expect(this.get('examineStub')).to.not.be.called;
        });
    }
  );

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

  it(
    'passess data to ConsumeInviteTokenAction instance and executes it',
    function () {
      stubExamine(this, 'token', resolve({
        type: {
          inviteToken: {
            inviteType: 'groupJoinSpace',
          },
        },
      }));
      const tokenActions = lookupService(this, 'token-actions');
      const consumeInviteTokenAction = {
        execute: sinon.stub().resolves(),
      };
      const createConsumeInviteTokenActionStub =
        sinon.stub(tokenActions, 'createConsumeInviteTokenAction')
        .returns(consumeInviteTokenAction);

      this.render(hbs `{{token-consumer}}`);

      const joiningRecordHelper = new JoiningRecordHelper();
      return fillIn('.token-string', 'token')
        .then(() => joiningRecordHelper.selectOption(1))
        .then(() => click('.confirm-btn'))
        .then(() => {
          expect(createConsumeInviteTokenActionStub).to.be.calledOnce;
          expect(createConsumeInviteTokenActionStub).to.be.calledWith(sinon.match({
            joiningRecord: this.get('mockedRecords.group')[0],
            targetModelName: 'space',
            token: 'token',
          }));
          expect(consumeInviteTokenAction.execute).to.be.calledOnce;
        });
    }
  );

  it(
    'has confirm button blocked until ConsumeInviteTokenAction execution is done',
    function () {
      stubExamine(this, 'token', resolve({
        type: {
          inviteToken: {
            inviteType: 'userJoinSpace',
          },
        },
      }));
      let resolveSubmit;
      const tokenActions = lookupService(this, 'token-actions');
      const consumeInviteTokenAction = {
        execute: sinon.stub()
          .returns(new Promise(resolve => resolveSubmit = resolve)),
      };
      sinon.stub(tokenActions, 'createConsumeInviteTokenAction')
        .returns(consumeInviteTokenAction);

      this.render(hbs `{{token-consumer}}`);

      return fillIn('.token-string', 'token')
        .then(() => click('.confirm-btn'))
        .then(() => {
          expect(this.$('.confirm-btn [role="progressbar"]')).to.exist;
          resolveSubmit();
          return wait();
        })
        .then(() =>
          expect(this.$('.confirm-btn [role="progressbar"]')).to.not.exist
        );
    }
  );
});

function stubExamine(testSuite, token, response) {
  testSuite.get('examineStub').withArgs(token).returns(response);
}

class JoiningRecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.joining-record-selector .ember-basic-dropdown');
  }
}
