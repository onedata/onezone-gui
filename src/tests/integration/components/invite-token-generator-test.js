import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { resolve, reject, Promise } from 'rsvp';
import { parseAspectOptions } from 'onedata-gui-common/services/navigation-state';
import _ from 'lodash';
import { suppressRejections } from '../../helpers/suppress-rejections';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | invite token generator', function () {
  setupRenderingTest();

  beforeEach(function () {
    const onezoneTimestamp = 12345;
    const routerStub = sinon.stub(lookupService(this, 'router'), 'urlFor').returns(null);
    sinon.stub(lookupService(this, 'recordManager'), 'getCurrentUserRecord')
      .callsFake(() => this.get('userRecord'));
    sinon.stub(lookupService(this, 'onezoneServer'), 'getServerTime')
      .resolves(onezoneTimestamp);
    this.setProperties({
      targetRecord: {
        entityType: 'group',
        entityId: 'group0',
      },
      routerStub,
      onezoneTimestamp,
      userRecord: {
        canInviteProviders: true,
      },
    });
  });

  it('has class invite-token-generator', async function () {
    stubCreateToken(this, [undefined, undefined], resolve());

    await render(hbs `{{invite-token-generator}}`);

    expect(find('.invite-token-generator')).to.exist;
  });

  it('shows token in textarea', async function () {
    const correctToken = 'userJoinGroup-token';
    stubCreateToken(this, ['userJoinGroup', 'group0'], resolve(correctToken));

    await render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    expect(this.get('createTokenStub')).to.be.calledOnce;
    const tokenTextarea = find('.token-textarea');
    expect(tokenTextarea).to.exist;
    expect(tokenTextarea).to.have.value(correctToken);
    expect(find('.spinner')).to.not.exist;
    expect(find('.resource-load-error')).to.not.exist;
  });

  it('shows spinner while token is being generated', async function () {
    stubCreateToken(this, ['userJoinGroup', 'group0'], new Promise(() => {}));

    await render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    expect(this.get('createTokenStub')).to.be.calledOnce;
    expect(find('.token-textarea')).to.not.exist;
    expect(find('.spinner')).to.exist;
    expect(find('.resource-load-error')).to.not.exist;
  });

  it('shows error when token generation has failed', async function () {
    suppressRejections();
    stubCreateToken(this, ['userJoinGroup', 'group0'], reject('tokenError'));

    await render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    expect(this.get('createTokenStub')).to.be.calledOnce;
    expect(find('.token-textarea')).to.not.exist;
    expect(find('.spinner')).to.not.exist;
    const errorContainer = find('.resource-load-error');
    expect(errorContainer).to.exist;
    expect(errorContainer).to.contain.text('tokenError');
  });

  it('sets correct url for "custom token" action', async function () {
    stubCreateToken(this, ['userJoinGroup', 'group0'], resolve());
    const correctRouteOptions = {
      activeSlide: 'form',
      tokenTemplate: btoa(JSON.stringify({
        type: {
          inviteToken: {
            inviteType: 'userJoinGroup',
            groupId: 'group0',
          },
        },
        caveats: [{
          type: 'time',
          validUntil: this.get('onezoneTimestamp') + 14 * 24 * 60 * 60,
        }],
      })),
    };
    this.get('routerStub').callsFake((route, resource, content, options) => {
      if (route === 'onedata.sidebar.content' &&
        resource === 'tokens' &&
        content === 'new' &&
        _.isEqual(parseAspectOptions(options.queryParams.options), correctRouteOptions)
      ) {
        return 'correctUrl';
      }
    });

    await render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    expect(find('.custom-token-action')).to.have.attr('href', 'correctUrl');
  });

  it(
    'calls passed onCustomTokenClick when "custom token" action has been clicked',
    async function () {
      stubCreateToken(this, ['userJoinGroup', 'group0'], resolve());
      const clickSpy = sinon.spy();
      this.set('clickHandler', clickSpy);

      await render(hbs `
        {{invite-token-generator
          inviteType="userJoinGroup"
          targetRecord=targetRecord
          onCustomTokenClick=(action clickHandler)
        }}
      `);

      await click('.custom-token-action');
      expect(clickSpy).to.be.calledOnce;
    }
  );

  const standardLimitations = 'This token will expire in 2 weeks and has no usage count limit.';
  const onedatifyLimitations = 'Tokens included below will expire in 2 weeks and have no usage count limit.';
  const passToUserDescription = 'Copy below token and pass it to the user you would like to invite.';
  const passToGroupDescription = 'Copy below token and pass it to the owner of group you would like to invite.';

  [{
    inviteType: 'userJoinGroup',
    subjectDescription: passToUserDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'groupJoinGroup',
    subjectDescription: passToGroupDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'userJoinSpace',
    subjectDescription: passToUserDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'groupJoinSpace',
    subjectDescription: passToGroupDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'harvesterJoinSpace',
    subjectDescription: 'Copy below token and pass it to the owner of harvester you would like to invite.',
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'supportSpace',
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'registerOneprovider',
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'userJoinCluster',
    subjectDescription: passToUserDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'groupJoinCluster',
    subjectDescription: passToGroupDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'userJoinHarvester',
    subjectDescription: passToUserDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'groupJoinHarvester',
    subjectDescription: passToGroupDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'spaceJoinHarvester',
    subjectDescription: 'Copy below token and pass it to the owner of space you would like to invite.',
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'userJoinAtmInventory',
    subjectDescription: passToUserDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'groupJoinAtmInventory',
    subjectDescription: passToGroupDescription,
    limitationsDescription: standardLimitations,
  }, {
    inviteType: 'onedatify',
    limitationsDescription: onedatifyLimitations,
    dontShowCustomToken: true,
  }, {
    inviteType: 'onedatifyWithImport',
    limitationsDescription: onedatifyLimitations,
    dontShowCustomToken: true,
  }].forEach(({
    inviteType,
    subjectDescription,
    limitationsDescription,
    dontShowCustomToken,
  }) => {
    it(`shows correct subject description for ${inviteType} invite token`, async function () {
      this.set('inviteType', inviteType);
      stubCreateToken(this, [inviteType, undefined], resolve());

      await render(hbs `{{invite-token-generator inviteType=inviteType}}`);

      if (subjectDescription) {
        expect(find('.subject-description')).to.have.trimmed.text(subjectDescription);
      } else {
        expect(find('.subject-description')).to.not.exist;
      }
    });

    it(
      `shows correct limitations description for ${inviteType} invite token`,
      async function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        await render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        expect(find('.limitations-text'))
          .to.have.trimmed.text(limitationsDescription);
      }
    );

    if (dontShowCustomToken) {
      it(`does not show "custom token" link for ${inviteType} invite token`, async function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        await render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        expect(find('.custom-token-action')).to.not.exist;
      });
    } else {
      it(`shows "custom token" link for ${inviteType} invite token`, async function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        await render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        expect(find('.custom-token-action')).to.exist;
      });
    }
  });

  context('when user has truthy "canInviteProviders"', function () {
    it('allows to generate onedatify command', async function () {
      const space = { entityId: 'space0' };
      this.set('targetRecord', space);
      stubCreateToken(this,
        ['supportSpace', 'space0'],
        resolve('supporttoken')
      );
      stubCreateToken(this,
        ['registerOneprovider'],
        resolve('registertoken')
      );

      await render(hbs `
        {{invite-token-generator
          inviteType="onedatify"
          targetRecord=targetRecord
        }}
      `);

      expect(find('.token-textarea').value).to.match(
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token 'registertoken' --token 'supporttoken'$/
      );
    });

    it('allows to generate onedatify with import command', async function () {
      const space = { entityId: 'space0' };
      this.set('targetRecord', space);
      stubCreateToken(this, ['supportSpace', 'space0'], resolve('supporttoken'));
      stubCreateToken(this, ['registerOneprovider'], resolve('registertoken'));

      await render(hbs `
        {{invite-token-generator
          inviteType="onedatifyWithImport"
          targetRecord=targetRecord
        }}
      `);

      expect(find('.token-textarea').value).to.match(
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token 'registertoken' --token 'supporttoken' --import$/
      );
    });

    ['onedatify', 'onedatifyWithImport'].forEach((inviteType) => {
      it(`does not show variables description for ${inviteType} invite token`,
        async function () {
          const space = { entityId: 'space0' };
          this.set('targetRecord', space);
          stubCreateToken(this,
            ['supportSpace', 'space0'],
            resolve('supporttoken')
          );

          await render(hbs `
            {{invite-token-generator
              inviteType="onedatify"
              targetRecord=targetRecord
            }}
          `);

          expect(find('.variables-description')).to.not.exist;
        }
      );
    });
  });

  context('when user has falsy "canInviteProviders"', function () {
    beforeEach(function () {
      this.set('userRecord.canInviteProviders', false);
    });

    it('allows to generate onedatify command', async function () {
      const space = { entityId: 'space0' };
      this.set('targetRecord', space);
      stubCreateToken(this,
        ['supportSpace', 'space0'],
        resolve('supporttoken')
      );

      await render(hbs `
        {{invite-token-generator
          inviteType="onedatify"
          targetRecord=targetRecord
        }}
      `);

      expect(find('.token-textarea').value).to.match(
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token "\$PROVIDER_REGISTRATION_TOKEN" --token 'supporttoken'$/
      );
    });

    it('allows to generate onedatify with import command', async function () {
      const space = { entityId: 'space0' };
      this.set('targetRecord', space);
      stubCreateToken(this, ['supportSpace', 'space0'], resolve('supporttoken'));

      await render(hbs `
        {{invite-token-generator
          inviteType="onedatifyWithImport"
          targetRecord=targetRecord
        }}
      `);

      expect(find('.token-textarea').value).to.match(
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token "\$PROVIDER_REGISTRATION_TOKEN" --token 'supporttoken' --import$/
      );
    });

    ['onedatify', 'onedatifyWithImport'].forEach((inviteType) => {
      it(`shows correct limitations and variables description for ${inviteType} invite token`,
        async function () {
          const space = { entityId: 'space0' };
          this.set('targetRecord', space);
          stubCreateToken(this,
            ['supportSpace', 'space0'],
            resolve('supporttoken')
          );

          await render(hbs `
            {{invite-token-generator
              inviteType="onedatify"
              targetRecord=targetRecord
            }}
          `);

          expect(find('.limitations-text').textContent.trim()).to.equal(
            'The support token included below will expire in 2 weeks and has no usage count limit.'
          );
          expect(find('.variables-description').textContent.trim()).to.equal(
            'A valid $PROVIDER_REGISTRATION_TOKEN must be defined for the above command to work. Please contact a Onezone administrator to acquire such a token.'
          );
          const tipText =
            await new OneTooltipHelper(find('.variables-description .one-icon'))
            .getText();
          expect(tipText).to.equal(
            'This Onezone enforces a restricted policy that prevents regular users from registering new Oneprovider instances at will.'
          );
        });
    });
  });
});

function stubCreateToken(testCase, args, result) {
  let createTokenStub;
  if (testCase.get('createTokenStub')) {
    createTokenStub = testCase.get('createTokenStub');
  } else {
    const tokenManager = lookupService(testCase, 'token-manager');
    createTokenStub = sinon.stub(tokenManager, 'createTemporaryInviteToken');
    testCase.set('createTokenStub', createTokenStub);
  }
  createTokenStub.withArgs(...args).returns(result);
}
