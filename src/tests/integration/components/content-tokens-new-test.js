import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import { isSlideActive, getSlide } from '../../helpers/one-carousel';
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
    const spaces = [{
      name: 'space0',
      entityId: 'space0',
    }, {
      name: 'space1',
      entityId: 'space1',
    }];
    const oneproviders = [{
      name: 'provider0',
      entityId: 'provider0',
    }, {
      name: 'provider1',
      entityId: 'provider1',
    }];
    const harvesters = [{
      entityId: 'harvester0',
      name: 'harvester0',
    }, {
      entityId: 'harvester1',
      name: 'harvester1',
    }];
    const recordManager = lookupService(this, 'record-manager');
    const currentUser = {
      entityId: 'user1',
      name: 'me',
    };
    sinon.stub(recordManager, 'getCurrentUserRecord').returns(currentUser);
    sinon.stub(recordManager, 'getUserRecordList')
      .withArgs('space').resolves({
        list: PromiseArray.create({
          promise: resolve(spaces),
        }),
      })
      .withArgs('provider').resolves({
        list: PromiseArray.create({
          promise: resolve(oneproviders),
        }),
      })
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
    sinon.stub(recordManager, 'getRecordById')
      .withArgs('user', 'user1').resolves(currentUser)
      .withArgs('space', 'space0').resolves(spaces[0])
      .withArgs('provider', 'provider0').resolves(oneproviders[0]);
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

    expect(isSlideActive('templates')).to.be.true;
  });

  it(
    'passess raw token to CreateTokenAction instance and executes it',
    async function () {
      const tokenActions = lookupService(this, 'token-actions');
      const createTokenAction = {
        execute: sinon.stub().resolves(),
      };
      const createCreateTokenActionStub =
        sinon.stub(tokenActions, 'createCreateTokenAction')
        .returns(createTokenAction);

      await renderAndSelectTemplate(this, 'custom');
      await fillIn('.name-field input', 'abc');
      await click('.submit-token');

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
    }
  );

  it(
    'token editor form is blocked until CreateTokenAction execution is done',
    async function () {
      let resolveSubmit;
      const tokenActions = lookupService(this, 'token-actions');
      const createTokenAction = {
        execute: sinon.stub()
          .returns(new Promise(resolve => resolveSubmit = resolve)),
      };
      sinon.stub(tokenActions, 'createCreateTokenAction')
        .returns(createTokenAction);

      await renderAndSelectTemplate(this, 'custom');
      await fillIn('.name-field input', 'abc');
      await click('.submit-token');

      expect(this.$('.submit-token [role="progressbar"]')).to.exist;
      resolveSubmit();
      await wait();

      expect(this.$('.submit-token [role="progressbar"]')).to.not.exist;
    }
  );

  it(
    'injects values passed via aspectOptions to form',
    async function () {
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
      await wait();

      checkShowsTemplate('Custom');
      expect(this.$('.type-field .option-invite input').prop('checked')).to.be.true;
      expect(this.$('.inviteType-field').text()).to.contain('Invite user to harvester');
      expect(this.$('.target-field').text()).to.contain('harvester1');
      expect(this.$('.expire-field').find('input').val()).to.contain('2020/03/18');
    }
  );

  it(
    'does not show selected template name on token template selector slide',
    function () {
      this.render(hbs `{{content-tokens-new}}`);

      expect(getSlide('templates').querySelector('.header-row .template-name'))
        .to.not.exist;
    }
  );

  it('allows to select "Onezone REST" template', async function () {
    await renderAndSelectTemplate(this, 'onezoneRest');

    checkShowsTemplate('Onezone REST');
    const $serviceCaveatTags = this.$('.service-field .tag-item');
    expect($serviceCaveatTags).to.have.length(1);
    expect($serviceCaveatTags.text().trim()).to.equal('onezone');
    expect(this.$('.interface-field .option-rest input').prop('checked')).to.be.true;
  });

  it('allows to select "Oneprovider REST" template', async function () {
    await renderAndSelectTemplate(this, 'oneproviderRest');

    checkShowsTemplate('Oneprovider REST/CDMI');
    const $serviceCaveatTags = this.$('.service-field .tag-item');
    expect($serviceCaveatTags).to.have.length(1);
    expect($serviceCaveatTags.text().trim()).to.equal('Any Oneprovider');
    expect(this.$('.interface-field .option-rest input').prop('checked')).to.be.true;
  });

  it('allows to select "Oneclient" template', async function () {
    await renderAndSelectTemplate(this, 'oneclient');

    checkShowsTemplate('Oneclient access');
    expect(this.$('.interface-field .option-oneclient input').prop('checked')).to.be.true;
  });

  it('allows to select "Oneclient in Oneprovider" template', async function () {
    await renderAndSelectTemplate(this, 'oneclientInOneprovider');
    await click('.record-item:first-child');

    checkShowsTemplate('Oneclient access in specific Oneprovider');
    const $serviceCaveatTags = this.$('.service-field .tag-item');
    expect($serviceCaveatTags).to.have.length(1);
    expect($serviceCaveatTags.text().trim()).to.equal('provider0');
    expect(this.$('.interface-field .option-oneclient input').prop('checked')).to.be.true;
  });

  it('allows to select "Read only data" template', async function () {
    await renderAndSelectTemplate(this, 'readonlyData');

    checkShowsTemplate('Read only data access');
    expect(this.$('.readonlyEnabled-field .one-way-toggle')).to.have.class('checked');
  });

  it('allows to select "Read only data for user" template', async function () {
    await renderAndSelectTemplate(this, 'readonlyDataForUser');
    await click('.record-item:first-child');

    checkShowsTemplate('Read only data access for specific user');
    const $consumerCaveatTags = this.$('.consumer-field .tag-item');
    expect($consumerCaveatTags).to.have.length(1);
    expect($consumerCaveatTags.text().trim()).to.equal('me');
    expect(this.$('.readonlyEnabled-field .one-way-toggle')).to.have.class('checked');
  });

  it('allows to select "Restricted data" template', async function () {
    await renderAndSelectTemplate(this, 'restrictedData');
    await click('.record-item:first-child');

    checkShowsTemplate('Restricted data access');
    const $pathEntries = this.$('.pathEntry-field');
    expect($pathEntries).to.have.length(1);
    expect($pathEntries.find('.pathSpace-field').text()).to.contain('space0');
    expect($pathEntries.find('.pathString-field input')).to.have.value('/');
  });

  it('allows to select "Identity" template', async function () {
    await renderAndSelectTemplate(this, 'identity');

    checkShowsTemplate('Identity proof');
    expect(this.$('.type-field .option-identity input').prop('checked')).to.be.true;
  });

  it('allows to select "Custom" template', async function () {
    await renderAndSelectTemplate(this, 'custom');

    checkShowsTemplate('Custom');
  });

  it('allows to come back from the form to templates list', async function () {
    await renderAndSelectTemplate(this, 'onezoneRest');
    await click('.content-back-link');

    expect(isSlideActive('templates')).to.be.true;
  });

  it(
    'resets form back to the templates default after user choose template, modified form, came back to templates list and selected the same template again',
    async function () {
      await renderAndSelectTemplate(this, 'onezoneRest');
      await click('.interface-field .option-oneclient');
      await click('.content-back-link');
      await selectTemplate('onezoneRest');

      expect(this.$('.interface-field .option-oneclient input').prop('checked'))
        .to.be.false;
    }
  );
});

async function renderAndSelectTemplate(testCase, templateName) {
  testCase.render(hbs `{{content-tokens-new}}`);
  await selectTemplate(templateName);
}

async function selectTemplate(templateName) {
  await click(`.template-${templateName}`);
}

function checkShowsTemplate(readableTemplateName) {
  expect(isSlideActive('form')).to.be.true;
  checkTemplateNameInHeader(readableTemplateName);
}

function checkTemplateNameInHeader(expectedName) {
  expect(getSlide('form').querySelector('.header-row .template-name').textContent)
    .to.contain(expectedName);
}
