import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, click, settled, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import { isSlideActive, getSlide } from '../../helpers/one-carousel';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, Promise } from 'rsvp';
import { set } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';

describe('Integration | Component | content tokens new', function () {
  setupRenderingTest();

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
    sinon.stub(lookupService(this, 'navigation-state'), 'changeRouteAspectOptions')
      .callsFake(function (newOptions) {
        this.set('aspectOptions', newOptions);
      });
  });

  it('has class "content-tokens-new', async function () {
    await render(hbs `{{content-tokens-new}}`);

    expect(find('.content-tokens-new')).to.exist;
  });

  it('shows list of token templates at the beginning', async function () {
    await render(hbs `{{content-tokens-new}}`);

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

      await renderAndSelectTemplate('custom');
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

      await renderAndSelectTemplate('custom');
      await fillIn('.name-field input', 'abc');
      await click('.submit-token');

      expect(find('.submit-token [role="progressbar"]')).to.exist;
      resolveSubmit();
      await settled();

      expect(find('.submit-token [role="progressbar"]')).to.not.exist;
    }
  );

  it(
    'injects values passed via aspectOptions to form',
    async function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        tokenTemplate: btoa(JSON.stringify({
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

      await render(hbs `{{content-tokens-new}}`);

      checkShowsTemplate('Custom');
      expect(find('.type-field .option-invite input')).to.have.property('checked', true);
      expect(find('.inviteType-field')).to.contain.text('Invite user to harvester');
      expect(find('.target-field')).to.contain.text('harvester1');
      expect(find('.expire-field input').value).to.contain('2020/03/18');
    }
  );

  it(
    'does not show selected template name on token template selector slide',
    async function () {
      await render(hbs `{{content-tokens-new}}`);

      expect(getSlide('templates').querySelector('.header-row .template-name'))
        .to.not.exist;
    }
  );

  it('allows to select "Onezone REST" template', async function () {
    await renderAndSelectTemplate('onezoneRest');

    checkShowsTemplate('Onezone REST');
    checkTokenEditorHasName(/Onezone REST .+/);
    const serviceCaveatTags = findAll('.service-field .tag-item');
    expect(serviceCaveatTags).to.have.length(1);
    expect(serviceCaveatTags[0]).to.have.trimmed.text('onezone');
    expect(find('.interface-field .option-rest input')).to.have.property('checked', true);
  });

  it('allows to select "Oneprovider REST" template', async function () {
    await renderAndSelectTemplate('oneproviderRest');

    checkShowsTemplate('Oneprovider REST/CDMI');
    checkTokenEditorHasName(/Oneprovider REST .+/);
    const serviceCaveatTags = findAll('.service-field .tag-item');
    expect(serviceCaveatTags).to.have.length(1);
    expect(serviceCaveatTags[0]).to.have.trimmed.text('Any Oneprovider');
    expect(find('.interface-field .option-rest input')).to.have.property('checked', true);
  });

  it('allows to select "Oneclient" template', async function () {
    await renderAndSelectTemplate('oneclient');

    checkShowsTemplate('Oneclient access');
    checkTokenEditorHasName(/Oneclient .+/);
    expect(find('.interface-field .option-oneclient input'))
      .to.have.property('checked', true);
  });

  it('allows to select "Oneclient in Oneprovider" template', async function () {
    await renderAndSelectTemplate('oneclientInOneprovider');
    await click('.record-item:first-child');

    checkShowsTemplate('Oneclient access in specific Oneprovider');
    checkTokenEditorHasName(/Oneclient in provider0 .+/);
    const serviceCaveatTags = findAll('.service-field .tag-item');
    expect(serviceCaveatTags).to.have.length(1);
    expect(serviceCaveatTags[0]).to.have.trimmed.text('provider0');
    expect(find('.interface-field .option-oneclient input'))
      .to.have.property('checked', true);
  });

  it('allows to select "Read-only data" template', async function () {
    await renderAndSelectTemplate('readonlyData');

    checkShowsTemplate('Read‐only data access');
    checkTokenEditorHasName(/Read-only data .+/);
    expect(find('.readonlyEnabled-field .one-way-toggle')).to.have.class('checked');
  });

  it('allows to select "Read-only data for user" template', async function () {
    await renderAndSelectTemplate('readonlyDataForUser');
    await click('.record-item:first-child');

    checkShowsTemplate('Read‐only data access for specific user');
    checkTokenEditorHasName(/Read-only data for me .+/);
    const consumerCaveatTags = findAll('.consumer-field .tag-item');
    expect(consumerCaveatTags).to.have.length(1);
    expect(consumerCaveatTags[0]).to.have.trimmed.text('me');
    expect(find('.readonlyEnabled-field .one-way-toggle')).to.have.class('checked');
  });

  it('allows to select "Restricted data" template', async function () {
    await renderAndSelectTemplate('restrictedData');
    await click('.record-item:first-child');

    checkShowsTemplate('Restricted data access');
    checkTokenEditorHasName(/Restricted data acc\. space0 .+/);
    const pathEntries = findAll('.pathEntry-field');
    expect(pathEntries).to.have.length(1);
    expect(pathEntries[0].querySelector('.pathSpace-field')).to.contain.text('space0');
    expect(pathEntries[0].querySelector('.pathString-field input')).to.have.value('/');
  });

  it('allows to select "Identity" template', async function () {
    await renderAndSelectTemplate('identity');

    checkShowsTemplate('Identity proof');
    checkTokenEditorHasName(/Identity .+/);
    expect(find('.type-field .option-identity input')).to.have.property('checked', true);
  });

  it('allows to select "Custom" template', async function () {
    await renderAndSelectTemplate('custom');

    checkShowsTemplate('Custom');
    checkTokenEditorHasName(/Access .+/);
  });

  it('allows to come back from the form to templates list', async function () {
    await renderAndSelectTemplate('onezoneRest');
    await click('.content-back-link');

    expect(isSlideActive('templates')).to.be.true;
  });

  it(
    'resets form back to the templates default after user chose template, modified form, came back to templates list and selected the same template again',
    async function () {
      await renderAndSelectTemplate('onezoneRest');
      await click('.interface-field .option-oneclient');
      await click('.content-back-link');
      await selectTemplate('onezoneRest');

      expect(find('.interface-field .option-oneclient input'))
        .to.have.property('checked', false);
    }
  );
});

async function renderAndSelectTemplate(templateName) {
  await render(hbs `{{content-tokens-new}}`);
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
  expect(getSlide('form').querySelector('.header-row .template-name'))
    .to.contain.text(expectedName);
}

function checkTokenEditorHasName(nameRegexp) {
  expect(find('.name-field input').value).to.match(nameRegexp);
}
