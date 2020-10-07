import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { fillIn, click } from 'ember-native-dom-helpers';
import { set } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';

describe('Integration | Component | content tokens new', function () {
  setupComponentTest('content-tokens-new', {
    integration: true,
  });

  beforeEach(function () {
    const harvesters = [{
      entityId: 'harvester0',
      name: 'harvester0',
    }, {
      entityId: 'harvester1',
      name: 'harvester1',
    }];
    const recordManager = lookupService(this, 'record-manager');
    sinon.stub(recordManager, 'getCurrentUserRecord').resolves({ entityId: 'user1' });
    sinon.stub(recordManager, 'getUserRecordList')
      .withArgs('group').resolves({
        list: PromiseArray.create({
          promise: resolve([]),
        }),
      })
      .withArgs('harvester').resolves({
        list: PromiseArray.create({
          promise: resolve(harvesters),
        }),
      });
    const harvester1Gri = gri({
      entityType: 'harvester',
      entityId: harvesters[1].entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    const findRecordStub = sinon.stub(lookupService(this, 'store'), 'findRecord');
    findRecordStub.callsFake(function (modelName, gri) {
      if (gri === harvester1Gri) {
        return resolve(harvesters[1]);
      } else {
        return findRecordStub.wrappedMethod.apply(this, arguments);
      }
    });
    set(lookupService(this, 'onedata-connection'), 'onezoneRecord', {
      name: 'onezone',
      serviceType: 'onezone',
    });
  });

  it('has class "content-tokens-new', function () {
    this.render(hbs `{{content-tokens-new}}`);

    expect(this.$('.content-tokens-new')).to.exist;
  });

  it('shows list of token templates at the beginning', async function () {
    this.render(hbs `{{content-tokens-new}}`);

    expect(isTemplatesSlideActive(this)).to.be.true;
  });

  // FIXME move to the "custom" template case
  it(
    'passess raw token to CreateTokenAction instance and executes it',
    function () {
      const tokenActions = lookupService(this, 'token-actions');
      const createTokenAction = {
        execute: sinon.stub().resolves(),
      };
      const createCreateTokenActionStub =
        sinon.stub(tokenActions, 'createCreateTokenAction')
        .returns(createTokenAction);

      this.render(hbs `{{content-tokens-new}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'abc'))
        .then(() => click('.submit-token'))
        .then(() => {
          expect(createCreateTokenActionStub).to.be.calledOnce;
          expect(createCreateTokenActionStub).to.be.calledWith(sinon.match({
            rawToken: sinon.match({
              name: 'abc',
              type: sinon.match({
                accessToken: sinon.match({}),
              }),
            }),
          }));
          expect(createTokenAction.execute).to.be.calledOnce;
        });
    }
  );

  it(
    'token editor form is blocked until CreateTokenAction execution is done',
    function () {
      let resolveSubmit;
      const tokenActions = lookupService(this, 'token-actions');
      const createTokenAction = {
        execute: sinon.stub()
          .returns(new Promise(resolve => resolveSubmit = resolve)),
      };
      sinon.stub(tokenActions, 'createCreateTokenAction')
        .returns(createTokenAction);

      this.render(hbs `{{content-tokens-new}}`);

      return wait()
        .then(() => fillIn('.name-field input', 'abc'))
        .then(() => click('.submit-token'))
        .then(() => {
          expect(this.$('.submit-token [role="progressbar"]')).to.exist;
          resolveSubmit();
          return wait();
        })
        .then(() =>
          expect(this.$('.submit-token [role="progressbar"]')).to.not.exist
        );
    }
  );

  it(
    'injects values passed via aspectOptions to form',
    function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        tokenTemplate: encodeURIComponent(JSON.stringify({
          type: {
            inviteToken: {
              inviteType: 'userJoinHarvester',
              harvesterId: 'harvester1',
            },
          },
          caveats: [{
            type: 'time',
            validUntil: 1584525600,
          }],
        })),
      });

      this.render(hbs `{{content-tokens-new}}`);

      return wait()
        .then(() => {
          expect(isFormSlideActive(this)).to.be.true;
          expect(this.$('.type-field .option-invite input').prop('checked')).to.be.true;
          expect(this.$('.inviteType-field').text()).to.contain('Invite user to harvester');
          expect(this.$('.target-field').text()).to.contain('harvester1');
          expect(this.$('.expire-field').find('input').val()).to.contain('2020/03/18');
        });
    }
  );

  it('allows to select "Onezone REST" template', async function () {
    this.render(hbs `{{content-tokens-new}}`);

    await click('.template-onezoneRest');
    expect(isFormSlideActive(this)).to.be.true;
    const $serviceCaveatTags = this.$('.service-field .tag-item');
    expect($serviceCaveatTags).to.have.length(1);
    expect($serviceCaveatTags.text().trim()).to.equal('onezone');
    expect(this.$('.interface-field .option-rest input').prop('checked')).to.be.true;
  });

  it('allows to select "Custom" template', async function () {
    this.render(hbs `{{content-tokens-new}}`);

    await click('.template-custom');
    expect(isFormSlideActive(this)).to.be.true;
    const $serviceCaveatTags = this.$('.service-field .tag-item');
    expect($serviceCaveatTags).to.have.length(1);
    expect($serviceCaveatTags.text().trim()).to.equal('Any Oneprovider');
  });
});

function isTemplatesSlideActive(testCase) {
  return isSlideActive(testCase, 'templates');
}

function isFormSlideActive(testCase) {
  return isSlideActive(testCase, 'form');
}

function isSlideActive(testCase, slideName) {
  const slide = testCase.$(`[data-one-carousel-slide-id="${slideName}"]`)[0];
  return [...slide.classList].any(cls => cls.startsWith('active'));
}
