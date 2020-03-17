import wait from 'ember-test-helpers/wait';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { resolve, reject, Promise } from 'rsvp';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';
import { click } from 'ember-native-dom-helpers';

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
    this.setProperties({
      targetRecord: {
        entityType: 'group',
        entityId: 'group1',
      },
      routerStub,
    });
  });

  afterEach(function () {
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
    stubCreateToken(this,
      ['userJoinGroup', this.get('targetRecord')],
      resolve(correctToken)
    );

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
    stubCreateToken(this,
      ['userJoinGroup', this.get('targetRecord')],
      new Promise(() => {})
    );

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
    stubCreateToken(this,
      ['userJoinGroup', this.get('targetRecord')],
      reject('tokenError')
    );

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

  it('shows additional actions', function () {
    stubCreateToken(this, ['userJoinGroup', this.get('targetRecord')], resolve('token'));

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => {
        const $additionalActions = this.$('.additional-token-actions');
        expect($additionalActions).to.exist;
        expect($additionalActions.find('.generate-another-action').text().trim())
          .to.equal('Generate another token');
        expect($additionalActions.find('.go-to-advanced-action').text().trim())
          .to.equal('Advanced generator');
      });
  });

  it('does not show additional actions when is loading token', function () {
    stubCreateToken(this,
      ['userJoinGroup', this.get('targetRecord')],
      new Promise(() => {})
    );

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => expect(this.$('.additional-token-actions')).to.not.exist);
  });

  it('does not show additional actions when generation error occurred', function () {
    stubCreateToken(this, ['userJoinGroup', this.get('targetRecord')], reject());

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => expect(this.$('.additional-token-actions')).to.not.exist);
  });

  it('allows to generate another token', function () {
    const secondToken = 'secondToken';
    const targetRecord = this.get('targetRecord');
    stubCreateToken(this, ['userJoinGroup', targetRecord], resolve('firstToken'));

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => {
        stubCreateToken(this, ['userJoinGroup', targetRecord], resolve(secondToken));
        return click('.generate-another-action');
      })
      .then(() => {
        expect(this.get('createTokenStub')).to.be.calledTwice;
        expect(this.$('.token-textarea').val()).to.equal(secondToken);
        expect(this.$('.spinner')).to.not.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
      });
  });

  it('sets correct url for "advanced generator" action', function () {
    const {
      targetRecord,
      routerStub,
    } = this.getProperties('targetRecord', 'routerStub');
    stubCreateToken(this, ['userJoinGroup', targetRecord], resolve());
    routerStub
      .withArgs('onedata.sidebar.content', 'tokens', 'new', {
        queryParams: {
          options: 'type.invite..inviteType.userJoinGroup..inviteTargetId.group1',
        },
      })
      .returns('correctUrl');

    this.render(hbs `
      {{invite-token-generator
        inviteType="userJoinGroup"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() =>
        expect(this.$('.go-to-advanced-action')).to.have.attr('href', 'correctUrl')
      );
  });

  it(
    'calls passed onGoToAdvancedClick when "advanced generator" has been clicked',
    function () {
      stubCreateToken(this, ['userJoinGroup', this.get('targetRecord')], resolve());
      const clickSpy = sinon.spy();
      this.on('clickHandler', clickSpy);

      this.render(hbs `
        {{invite-token-generator
          inviteType="userJoinGroup"
          targetRecord=targetRecord
          onGoToAdvancedClick=(action "clickHandler")
        }}
      `);

      return wait()
        .then(() => click('.go-to-advanced-action'))
        .then(() => expect(clickSpy).to.be.calledOnce);
    }
  );

  [{
    inviteType: 'userJoinGroup',
    description: 'Copy below token and pass it to the user you would like to invite:',
  }, {
    inviteType: 'groupJoinGroup',
    description: 'Copy below token and pass it to the owner of group you would like to invite:',
  }, {
    inviteType: 'userJoinSpace',
    description: 'Copy below token and pass it to the user you would like to invite:',
  }, {
    inviteType: 'groupJoinSpace',
    description: 'Copy below token and pass it to the owner of group you would like to invite:',
  }, {
    inviteType: 'supportSpace',
  }, {
    inviteType: 'registerOneprovider',
  }, {
    inviteType: 'userJoinCluster',
    description: 'Copy below token and pass it to the user you would like to invite:',
  }, {
    inviteType: 'groupJoinCluster',
    description: 'Copy below token and pass it to the owner of group you would like to invite:',
  }, {
    inviteType: 'userJoinHarvester',
    description: 'Copy below token and pass it to the user you would like to invite:',
  }, {
    inviteType: 'groupJoinHarvester',
    description: 'Copy below token and pass it to the owner of group you would like to invite:',
  }, {
    inviteType: 'spaceJoinHarvester',
    description: 'Copy below token and pass it to the owner of space you would like to invite:',
  }, {
    inviteType: 'onedatify',
    dontShowAdvanced: true,
  }, {
    inviteType: 'onedatifyWithImport',
    dontShowAdvanced: true,
  }].forEach(({ inviteType, description, dontShowAdvanced }) => {
    it(`shows correct description for ${inviteType} invite token`, function () {
      this.set('inviteType', inviteType);
      stubCreateToken(this, [inviteType, undefined], resolve());

      this.render(hbs `{{invite-token-generator inviteType=inviteType}}`);

      if (description) {
        expect(this.$('.description').text().trim()).to.equal(description);
      } else {
        expect(this.$('.description')).to.not.exist;
      }
    });

    if (dontShowAdvanced) {
      it(`does not show "go to advanced" link for ${inviteType} invite token`, function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        this.render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        return wait()
          .then(() => expect(this.$('.go-to-advanced-action')).to.not.exist);
      });
    } else {
      it(`shows "go to advanced" link for ${inviteType} invite token`, function () {
        this.set('inviteType', inviteType);
        stubCreateToken(this, [inviteType, undefined], resolve());

        this.render(hbs `{{invite-token-generator inviteType=inviteType}}`);

        return wait()
          .then(() => expect(this.$('.go-to-advanced-action')).to.exist);
      });
    }
  });

  it('allows to generate onedatify command', function () {
    const space = { entityId: 'space0' };
    this.set('targetRecord', space);
    stubCreateToken(this,
      ['supportSpace', space],
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
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*' --registration-token 'registertoken' --token 'supporttoken'$/
      ));
  });

  it('allows to generate onedatify with import command', function () {
    const space = { entityId: 'space0' };
    this.set('targetRecord', space);
    stubCreateToken(this, ['supportSpace', space], resolve('supporttoken'));
    stubCreateToken(this, ['registerOneprovider'], resolve('registertoken'));

    this.render(hbs `
      {{invite-token-generator
        inviteType="onedatifyWithImport"
        targetRecord=targetRecord
      }}
    `);

    return wait()
      .then(() => expect(this.$('.token-textarea').val()).to.match(
        /^curl https:\/\/get\.onedata\.org\/onedatify\.sh \| sh -s onedatify --onezone-url '.*' --registration-token 'registertoken' --token 'supporttoken' --import$/
      ));
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
