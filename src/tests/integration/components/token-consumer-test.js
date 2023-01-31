import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, click, settled, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { Promise, resolve, reject } from 'rsvp';
import _ from 'lodash';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import OneTooltipHelper from '../../helpers/one-tooltip';
import { dasherize } from '@ember/string';
import { suppressRejections } from '../../helpers/suppress-rejections';

describe('Integration | Component | token consumer', function () {
  setupRenderingTest();

  beforeEach(function () {
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
    suppressRejections();
  });

  it('has class "token-consumer"', async function () {
    await render(hbs `{{token-consumer}}`);

    expect(find('.token-consumer')).to.exist;
  });

  it('has token input', async function () {
    await render(hbs `{{token-consumer}}`);

    const input = find('input[type="text"].token-string');
    expect(input).to.exist;
    expect(input).to.have.attr('placeholder', 'Enter token...');
  });

  it('does not invoke examine on init', async function () {
    await render(hbs `{{token-consumer}}`);

    expect(this.get('examineStub')).to.not.be.called;
  });

  it('invokes examine on token input', async function () {
    await render(hbs `{{token-consumer}}`);

    await fillIn('.token-string', 'token');
    const examineStub = this.get('examineStub');
    expect(examineStub).to.be.calledOnce;
    expect(examineStub).to.be.calledWith('token');
  });

  it('invokes examine many times on subsequent token input', async function () {
    await render(hbs `{{token-consumer}}`);

    await fillIn('.token-string', 'token');
    await fillIn('.token-string', 'token1');
    await fillIn('.token-string', 'token12');
    const examineStub = this.get('examineStub');
    expect(examineStub).to.be.calledThrice;
    expect(examineStub).to.be.calledWith('token');
    expect(examineStub).to.be.calledWith('token1');
    expect(examineStub).to.be.calledWith('token12');
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
    it(`shows type information for ${name} token`, async function () {
      stubExamine(this, 'token', resolve({ type }));

      await render(hbs `{{token-consumer}}`);

      await fillIn('.token-string', 'token');
      expect(find('.token-type')).to.have.trimmed.text(typeText);
    });

    it(`does not show "Join" button for ${name} token`, async function () {
      stubExamine(this, 'token', resolve({ type }));

      await render(hbs `{{token-consumer}}`);

      await fillIn('.token-string', 'token');
      expect(find('.no-join-message')).to.have.trimmed.text(
        'This is not an invite token and cannot be used to join to any resource.'
      );
      expect(find('.confirm-btn')).to.not.exist;
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
      it(`does not show "Confirm" button for invite ${inviteType} token`, async function () {
        stubExamine(this, 'token', resolve({
          type: {
            inviteToken: inviteSpec,
          },
        }));

        await render(hbs `{{token-consumer}}`);

        await fillIn('.token-string', 'token');
        expect(find('.no-join-message')).to.have.trimmed.text(noJoinMessage);
        expect(find('.confirm-btn')).to.not.exist;
      });
    } else {
      it(`shows "Confirm" button for invite ${inviteType} token`, async function () {
        stubExamine(this, 'token', resolve({
          type: {
            inviteToken: inviteSpec,
          },
        }));

        await render(hbs `{{token-consumer}}`);

        await fillIn('.token-string', 'token');
        expect(find('.no-join-message')).to.not.exist;
        expect(find('.confirm-btn')).to.exist;
      });
    }

    it(`shows type information for invite ${inviteType} token`, async function () {
      stubExamine(this, 'token', resolve({
        type: {
          inviteToken: inviteSpec,
        },
      }));

      await render(hbs `{{token-consumer}}`);

      await fillIn('.token-string', 'token');
      expect(find('.token-type')).to.have.trimmed.text(typeText);
      expect(find('.type-info .warning-icon')).to.not.exist;
    });

    if (modelToSelect) {
      it(
        `shows joining record selector for invite ${inviteType} token`,
        async function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
            targetName: 'someRecord',
          }));

          await render(hbs `{{token-consumer}}`);

          await fillIn('.token-string', 'token');
          const recordSelector = find('.joining-record-selector');
          expect(recordSelector).to.exist;
          expect(find('.selector-description'))
            .to.have.trimmed.text(selectorDescription);
          expect(
            recordSelector.querySelector('.ember-power-select-placeholder')
          ).to.have.trimmed.text(selectorPlaceholder);
          await clickTrigger('.joining-record-selector');
          const options = findAll('.ember-power-select-option');
          _.range(3).forEach(i => {
            expect(options[i]).to.contain.text(`${modelToSelect}${i}`);
            expect(options[i]).to.contain(`.oneicon-${selectorIcon}`);
          });
        }
      );

      it(
        `has disabled "Confirm" button for invite ${inviteType} token when no target record is selected`,
        async function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
          }));

          await render(hbs `{{token-consumer}}`);

          await fillIn('.token-string', 'token');
          expect(find('.confirm-btn')).to.have.attr('disabled');
        }
      );

      it(
        `has enabled "Confirm" button for invite ${inviteType} token when target record is selected`,
        async function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
          }));

          await render(hbs `{{token-consumer}}`);

          await fillIn('.token-string', 'token');
          await selectChoose('.joining-record-selector', `${modelToSelect}0`);
          expect(find('.confirm-btn')).to.not.have.attr('disabled');
        }
      );
    } else {
      it(
        `does not show joining record selector for invite ${inviteType} token`,
        async function () {
          stubExamine(this, 'token', resolve({
            type: {
              inviteToken: inviteSpec,
            },
            targetName: 'someRecord',
          }));

          await render(hbs `{{token-consumer}}`);

          await fillIn('.token-string', 'token');
          expect(find('.joining-record-selector')).to.not.exist;
        }
      );

      if (!noJoinMessage) {
        it(
          `has enabled "Confirm" button for invite ${inviteType} token`,
          async function () {
            stubExamine(this, 'token', resolve({
              type: {
                inviteToken: inviteSpec,
              },
            }));

            await render(hbs `{{token-consumer}}`);

            await fillIn('.token-string', 'token');
            expect(find('.confirm-btn')).to.not.have.attr('disabled');
          }
        );
      }
    }
  });

  it(
    'shows "unknown" target name and warning for invite token when target name is null',
    async function () {
      stubExamine(this, 'token', resolve({
        type: {
          inviteToken: {
            inviteType: 'userJoinSpace',
            spaceName: null,
          },
        },
      }));

      await render(hbs `{{token-consumer}}`);

      await fillIn('.token-string', 'token');
      expect(find('.token-type'))
        .to.have.trimmed.text('Invitation to join a space');
      const warningIcon = find('.type-info .warning-icon');
      expect(warningIcon).to.exist;
      const tooltipText = await new OneTooltipHelper(warningIcon).getText();
      expect(tooltipText).to.equal(
        'Cannot resolve invite target name, this token might be outdated or invalid.'
      );
    }
  );

  it('informs about incorrect token', async function () {
    stubExamine(this, 'token', reject({ id: 'badValueToken' }));

    await render(hbs `{{token-consumer}}`);

    await fillIn('.token-string', 'token');

    expect(find('.invalid-token-message'))
      .to.have.trimmed.text('Provided token is invalid.');
  });

  it('informs about other examine errors', async function () {
    stubExamine(this, 'token', reject({ id: 'someOtherError' }));

    await render(hbs `{{token-consumer}}`);

    await fillIn('.token-string', 'token');
    expect(find('.resource-load-error')).to.contain.text('someOtherError');
  });

  it('interprets whitespaces in token input as an empty value', async function () {
    await render(hbs `{{token-consumer}}`);

    await fillIn('.token-string', '   ');
    expect(find('.invalid-token-message')).to.not.exist;
    expect(find('.token-type')).to.not.exist;
    expect(this.get('examineStub')).to.not.be.called;
  });

  it(
    'interprets forbidden-only characters in token input as an incorrect token',
    async function () {
      await render(hbs `{{token-consumer}}`);

      await fillIn('.token-string', '!@#$%^&*()');
      expect(find('.invalid-token-message')).to.exist;
      expect(find('.token-type')).to.not.exist;
      expect(this.get('examineStub')).to.not.be.called;
    }
  );

  it('shows spinner while examining token', async function () {
    let resolveRequest;
    stubExamine(this, 'token', new Promise(resolve => resolveRequest = resolve));

    await render(hbs `{{token-consumer}}`);

    expect(find('.spinner')).to.not.exist;
    await fillIn('.token-string', 'token');
    expect(find('.spinner')).to.exist;
    resolveRequest();
    await settled();
    expect(find('.spinner')).to.not.exist;
  });

  it(
    'passess data to ConsumeInviteTokenAction instance and executes it',
    async function () {
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

      await render(hbs `{{token-consumer}}`);

      await fillIn('.token-string', 'token');
      await selectChoose('.joining-record-selector', 'group0');
      await click('.confirm-btn');
      expect(createConsumeInviteTokenActionStub).to.be.calledOnce;
      expect(createConsumeInviteTokenActionStub).to.be.calledWith(sinon.match({
        joiningRecord: this.get('mockedRecords.group')[0],
        targetModelName: 'space',
        token: 'token',
      }));
      expect(consumeInviteTokenAction.execute).to.be.calledOnce;
    }
  );

  it(
    'has confirm button blocked until ConsumeInviteTokenAction execution is done',
    async function () {
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

      await render(hbs `{{token-consumer}}`);

      await fillIn('.token-string', 'token');
      await click('.confirm-btn');
      expect(find('.confirm-btn [role="progressbar"]')).to.exist;
      resolveSubmit();
      await settled();
      expect(find('.confirm-btn [role="progressbar"]')).to.not.exist;
    }
  );
});

function stubExamine(testSuite, token, response) {
  testSuite.get('examineStub').withArgs(token).returns(response);
}
