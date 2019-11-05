import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import OneDatetimePickerHelper from '../../helpers/one-datetime-picker';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import Service from '@ember/service';
import { click, fillIn } from 'ember-native-dom-helpers';
import moment from 'moment';

describe('Integration | Component | content tokens new', function () {
  setupComponentTest('content-tokens-new', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'token-actions', TokenActionsStub);
  });

  it('has class "content-tokens-new"', function () {
    this.render(hbs `{{content-tokens-new}}`);

    expect(this.$('.content-tokens-new')).to.exist;
  });

  it('renders component content-info', function () {
    this.render(hbs `{{content-tokens-new}}`);

    expect(this.$('.content-info')).to.exist;
  });

  it('renders component new-token-form', function () {
    this.render(hbs `{{content-tokens-new}}`);

    expect(this.$('.new-token-form')).to.exist;
  });

  it('allows to create new token with limited lifetime', function () {
    const tokenName = 'token name';
    const tokenActionsStub = lookupService(this, 'token-actions');
    const createTokenActionStub =
      sinon.stub(tokenActionsStub, 'createToken').resolves();
    this.render(hbs `{{content-tokens-new}}`);

    let validUntilHelper;
    return fillIn('.field-general-name', tokenName)
      .then(() => click('.toggle-field-general-validUntilEnabled'))
      .then(() => {
        validUntilHelper =
          new OneDatetimePickerHelper(this.$('.field-validUntil-validUntil'));
        return validUntilHelper.selectToday();
      })
      .then(() => click('.create-button'))
      .then(() => {
        const now = moment().seconds(0).unix();
        expect(createTokenActionStub).to.be.calledWith({
          name: tokenName,
          caveats: [{
            type: 'time',
            // two possible values because test and values measurement can occurr
            // in different minutes.
            validUntil: sinon.match(now).or(sinon.match(now - 60)),
          }],
        });
      });
  });

  it('allows to create new token with unlimited lifetime', function () {
    const tokenName = 'token name';
    const tokenActionsStub = lookupService(this, 'token-actions');
    const createTokenActionStub =
      sinon.stub(tokenActionsStub, 'createToken').resolves();
    this.render(hbs `{{content-tokens-new}}`);

    return fillIn('.field-general-name', tokenName)
      .then(() => click('.create-button'))
      .then(() => {
        expect(createTokenActionStub).to.be.calledWith({
          name: tokenName,
          caveats: [],
        });
      });
  });
});

const TokenActionsStub = Service.extend({
  createToken() {},
});
