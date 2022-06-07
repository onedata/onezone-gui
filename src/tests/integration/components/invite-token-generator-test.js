import wait from 'ember-test-helpers/wait';
import { expect } from 'chai';
import { describe, context, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { resolve, reject, Promise } from 'rsvp';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';
import { find, click } from 'ember-native-dom-helpers';
import { parseAspectOptions } from 'onedata-gui-common/services/navigation-state';
import _ from 'lodash';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | invite token generator', function () {
  setupComponentTest('invite-token-generator', {
    integration: true,
  });

  beforeEach(function () {
    this.originalLoggerError = Ember.Logger.error;
    this.originalTestAdapterException = TestAdapter.exception;
    Ember.Logger.error = function () {};
    Ember.Test.adapter.exception = function () {};

    const routerStub = sinon.stub(lookupService(this, 'router'), 'urlFor').returns(null);
    sinon.stub(lookupService(this, 'recordManager'), 'getCurrentUserRecord')
      .callsFake(() => this.get('userRecord'));
    this.setProperties({
      targetRecord: {
        entityType: 'group',
        entityId: 'group0',
      },
      routerStub,
      userRecord: {
        canInviteProviders: true,
      },
    });
  });

  afterEach(function () {
    const fakeClock = this.get('fakeClock');
    if (fakeClock) {
      fakeClock.restore();
    }
    Ember.Logger.error = this.originalLoggerError;
    Ember.Test.adapter.exception = this.originalTestAdapterException;
  });

  it('has class invite-token-generator', function () {
    stubCreateToken(this, [undefined, undefined], resolve());

    this.render(hbs `{{invite-token-generator}}`);

    expect(this.$('.invite-token-generator')).to.exist;
  });

  it('shows token in textarea', function () {
    const correctToken = 'userJoinGroup-token';
    stubCreateToken(this, ['userJoinGroup', 'group0'], resolve(correctToken));

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => {
        expect(this.get('createTokenStub')).to.be.calledOnce;
        const $tokenTextarea = this.$('.token-textarea');
        expect($tokenTextarea).to.exist;
        expect($tokenTextarea.val()).to.equal(correctToken);
        expect(this.$('.spinner')).to.not.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
      });
  });

  it('shows spinner while token is being generated', function () {
    stubCreateToken(this, ['userJoinGroup', 'group0'], new Promise(() => {}));

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => {
        expect(this.get('createTokenStub')).to.be.calledOnce;
        expect(this.$('.token-textarea')).to.not.exist;
        expect(this.$('.spinner')).to.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
      });
  });

  it('shows error when token generation has failed', function () {
    stubCreateToken(this, ['userJoinGroup', 'group0'], reject('tokenError'));

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => {
        expect(this.get('createTokenStub')).to.be.calledOnce;
        expect(this.$('.token-textarea')).to.not.exist;
        expect(this.$('.spinner')).to.not.exist;
        const $errorContainer = this.$('.resource-load-error');
        expect($errorContainer).to.exist;
        expect($errorContainer.text()).to.contain('tokenError');
      });
  });

  it('sets correct url for "custom token" action', function () {
    stubCreateToken(this, ['userJoinGroup', 'group0'], resolve());
    const timestamp = 1584525600;
    this.set('fakeClock', sinon.useFakeTimers({
      now: timestamp * 1000,
      shouldAdvanceTime: true,
    }));
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
          validUntil: timestamp + 14 * 24 * 60 * 60,
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

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() =>
        expect(this.$('.custom-token-action')).to.have.attr('href', 'correctUrl')
      );
  });

  it(
    'calls passed onCustomTokenClick when "custom token" action has been clicked',
    function () {
      stubCreateToken(this, ['userJoinGroup', 'group0'], resolve());
      const clickSpy = sinon.spy();
      this.on('clickHandler', clickSpy);

      this.render(hbs `
        {{invite-token-generator
          inviteType="userJoinGroup"
          targetRecord=targetRecord
          onCustomTokenClick=(action "clickHandler")
        }}
      `);

      return wait()
        .then(() => click('.custom-token-action'))
        .then(() => expect(clickSpy).to.be.calledOnce);
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
    it(`shows correct subject description for ${inviteType} invite token`, function () {
      this.set('inviteType', inviteType);
      stubCreateToken(this, [inviteType, undefined], resolve());

      this.render(hbs `{{invite-token-generator inviteType=inviteType}}`);

      if (subjectDescription) {
        expect(this.$('.subject-description').text().trim()).to.equal(subjectDescription);
      } else {
        expect(this.$('.subject-description')).to.not.exist;
      }
    });

    it(
      `shows correct limitations description for ${inviteType} invite token`,
      function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        this.render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        return wait()
          .then(() =>
            expect(this.$('.limitations-text').text().trim())
            .to.equal(limitationsDescription)
          );
      }
    );

    if (dontShowCustomToken) {
      it(`does not show "custom token" link for ${inviteType} invite token`, function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        this.render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        return wait()
          .then(() => expect(this.$('.custom-token-action')).to.not.exist);
      });
    } else {
      it(`shows "custom token" link for ${inviteType} invite token`, function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        this.render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        return wait()
          .then(() => expect(this.$('.custom-token-action')).to.exist);
      });
    }
  });

  context('when user has truthy "canInviteProviders"', function () {
    it('allows to generate onedatify command', function () {
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

      this.render(hbs `
        {{invite-token-generator
          inviteType="onedatify"
          targetRecord=targetRecord
        }}
      `);

      return wait()
        .then(() => expect(this.$('.token-textarea').val()).to.match(
          /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token 'registertoken' --token 'supporttoken'$/
        ));
    });

    it('allows to generate onedatify with import command', function () {
      const space = { entityId: 'space0' };
      this.set('targetRecord', space);
      stubCreateToken(this, ['supportSpace', 'space0'], resolve('supporttoken'));
      stubCreateToken(this, ['registerOneprovider'], resolve('registertoken'));

      this.render(hbs `
        {{invite-token-generator
          inviteType="onedatifyWithImport"
          targetRecord=targetRecord
        }}
      `);

      return wait()
        .then(() => expect(this.$('.token-textarea').val()).to.match(
          /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token 'registertoken' --token 'supporttoken' --import$/
        ));
    });

    ['onedatify', 'onedatifyWithImport'].forEach((inviteType) => {
      it(`does not show variables description for ${inviteType} invite token`,
        async function (done) {
          const space = { entityId: 'space0' };
          this.set('targetRecord', space);
          stubCreateToken(this,
            ['supportSpace', 'space0'],
            resolve('supporttoken')
          );

          this.render(hbs `
            {{invite-token-generator
              inviteType="onedatify"
              targetRecord=targetRecord
            }}
          `);

          await wait();
          expect(find('.variables-description')).to.not.exist;
          done();
        });
    });
  });

  context('when user has falsy "canInviteProviders"', function () {
    beforeEach(function () {
      this.set('userRecord.canInviteProviders', false);
    });

    it('allows to generate onedatify command', async function (done) {
      const space = { entityId: 'space0' };
      this.set('targetRecord', space);
      stubCreateToken(this,
        ['supportSpace', 'space0'],
        resolve('supporttoken')
      );

      this.render(hbs `
        {{invite-token-generator
          inviteType="onedatify"
          targetRecord=targetRecord
        }}
      `);

      await wait();
      expect(find('.token-textarea').value).to.match(
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token "\$PROVIDER_REGISTRATION_TOKEN" --token 'supporttoken'$/
      );
      done();
    });

    it('allows to generate onedatify with import command', async function (done) {
      const space = { entityId: 'space0' };
      this.set('targetRecord', space);
      stubCreateToken(this, ['supportSpace', 'space0'], resolve('supporttoken'));

      this.render(hbs `
        {{invite-token-generator
          inviteType="onedatifyWithImport"
          targetRecord=targetRecord
        }}
      `);

      await wait();
      expect(find('.token-textarea').value).to.match(
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*?' --registration-token "\$PROVIDER_REGISTRATION_TOKEN" --token 'supporttoken' --import$/
      );
      done();
    });

    ['onedatify', 'onedatifyWithImport'].forEach((inviteType) => {
      it(`shows correct limitations and variables description for ${inviteType} invite token`,
        async function (done) {
          const space = { entityId: 'space0' };
          this.set('targetRecord', space);
          stubCreateToken(this,
            ['supportSpace', 'space0'],
            resolve('supporttoken')
          );

          this.render(hbs `
            {{invite-token-generator
              inviteType="onedatify"
              targetRecord=targetRecord
            }}
          `);

          await wait();
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
          done();
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
