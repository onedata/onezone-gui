import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject, Promise } from 'rsvp';
import { suppressRejections } from '../../helpers/suppress-rejections';
import sinon from 'sinon';
import RemoveHarvesterFromSpaceAction from 'onezone-gui/utils/space-actions/remove-harvester-from-space-action';
import AddHarvesterToSpaceAction from 'onezone-gui/utils/space-actions/add-harvester-to-space-action';
import GenerateInviteTokenAction from 'onezone-gui/utils/token-actions/generate-invite-token-action';
import EmberObject from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';

const Router = Service.extend({
  urlFor() {
    return '#/url';
  },
});

describe('Integration | Component | content spaces harvesters', function () {
  setupRenderingTest();

  beforeEach(function () {
    const harvesterListPromise = promiseObject(resolve(EmberObject.create({
      list: promiseArray(resolve([{
        name: 'harvester1',
        id: 'harvester.harvester1id.instance:auto',
      }, {
        name: 'harvester2',
        id: 'harvester.harvester2id.instance:auto',
      }])),
    })));
    this.set('space', EmberObject.create({
      name: 'space1',
      harvesterList: harvesterListPromise,
      getRelation: (name) => {
        if (name === 'harvesterList') {
          return this.get('space.harvesterList');
        }
      },
    }));
    registerService(this, 'router', Router);
  });

  afterEach(function () {
    // Reset stubbed actions
    [
      AddHarvesterToSpaceAction,
      GenerateInviteTokenAction,
      RemoveHarvesterFromSpaceAction,
    ].forEach(action => {
      if (action.prototype.execute.restore) {
        action.prototype.execute.restore();
      }
    });
  });

  it('has class "content-spaces-harvesters"', async function () {
    await render(hbs `{{content-spaces-harvesters}}`);

    expect(find('.content-spaces-harvesters')).to.exist;
  });

  it('shows spinner when harvesters are being loaded', async function () {
    sinon.stub(this.get('space'), 'getRelation').withArgs('harvesterList').returns(
      promiseObject(new Promise(() => {}))
    );

    await render(hbs `{{content-spaces-harvesters space=space}}`);

    expect(find('.spinner')).to.exist;
    expect(find('.resources-list')).to.not.exist;
    expect(find('.resource-load-error')).to.not.exist;
    expect(find('.content-info')).to.not.exist;
  });

  it('shows info page when there are no harvesters yet', async function () {
    mockEmptyHarvestersList(this);

    await render(hbs `{{content-spaces-harvesters space=space}}`);

    expect(find('.spinner')).to.not.exist;
    expect(find('.resources-list')).to.not.exist;
    expect(find('.resource-load-error')).to.not.exist;
    expect(find('.content-info')).to.exist;
    expect(find('h1')).to.have.trimmed.text('Space harvesters');
    expect(find('.lead')).to.have.trimmed.text(
      'This space does not provide metadata to any harvester. To start indexing process, add a harvester.'
    );
    const buttons = findAll('.action-buttons button.btn-primary');
    expect(buttons).to.have.length(2);
    expect(buttons[0]).to.have.class('add-harvester-to-space-trigger');
    expect(buttons[0]).to.have.trimmed.text('Add one of your harvesters');
    expect(buttons[1]).to.have.class('generate-invite-token-action');
    expect(buttons[1]).to.have.trimmed.text('Invite harvester using token');
  });

  it('allows to add harvester through empty content info', function () {
    mockEmptyHarvestersList(this);

    return testAddingHarvester(() =>
      click('.action-buttons .add-harvester-to-space-trigger')
    );
  });

  it('allows to invite harvester using token through empty content info', function () {
    mockEmptyHarvestersList(this);

    return testInvitingHarvesterUsingToken(() =>
      click('.action-buttons .generate-invite-token-action')
    );
  });

  it('shows list of space harvesters', async function () {
    await render(hbs `{{content-spaces-harvesters space=space}}`);

    expect(find('.spinner')).to.not.exist;
    expect(find('.resource-load-error')).to.not.exist;
    const harvesterItems = findAll('.resource-item');
    expect(harvesterItems).to.have.length(2);
    expect(harvesterItems[0].querySelector('.oneicon-light-bulb')).to.exist;
    expect(harvesterItems[0]).to.contain.text('harvester1');
    expect(harvesterItems[1]).to.contain.text('harvester2');
  });

  it('performs removing harvester from space', async function () {
    await render(hbs `{{content-spaces-harvesters space=space}}`);

    const executeStub = sinon.stub(RemoveHarvesterFromSpaceAction.prototype, 'execute')
      .callsFake(function () {
        expect(this.get('space.name')).to.equal('space1');
        expect(this.get('harvester.name')).to.equal('harvester1');
      });

    await click('.resource-item:first-child .btn-menu-toggle');
    await click(document.querySelector('.remove-harvester-from-space-trigger'));
    expect(executeStub).to.be.calledOnce;
  });

  it(
    'changes empty info view to list view when harvesters have been added',
    async function () {
      mockEmptyHarvestersList(this);

      await render(hbs `{{content-spaces-harvesters space=space}}`);

      this.get('space.harvesterList.content.list.content').pushObjects([{
        name: 'harvester1',
      }, {
        name: 'harvester2',
      }]);
      await settled();

      expect(find('.content-info')).to.not.exist;
      expect(find('.resources-list')).to.exist;
    }
  );

  it(
    'changes list view to empty info view when harvesters have been removed',
    async function () {
      await render(hbs `{{content-spaces-harvesters space=space}}`);

      this.get('space.harvesterList.content.list.content').clear();
      await settled();

      expect(find('.resources-list')).to.not.exist;
      expect(find('.content-info')).to.exist;
    }
  );

  it('executes adding harvester from list view', async function () {
    await testAddingHarvester(async () => {
      await click('h1 .collapsible-toolbar-toggle');
      await click(document.querySelector(
        '.dropdown-menu .add-harvester-to-space-trigger'
      ));
    });
  });

  it('executes inviting harvester using token from list view', async function () {
    await testInvitingHarvesterUsingToken(async () => {
      await click('h1 .collapsible-toolbar-toggle');
      await click(document.querySelector(
        '.dropdown-menu .generate-invite-token-action'
      ));
    });
  });

  it('has correct link', async function () {
    const router = lookupService(this, 'router');
    sinon.stub(router, 'urlFor')
      .withArgs(
        'onedata.sidebar.content.aspect',
        'harvesters',
        'harvester1id',
        'plugin',
      ).returns('#correct-url');

    await render(hbs `{{content-spaces-harvesters space=space}}`);

    const harvesterItems = findAll('.resource-item a');
    expect(harvesterItems).to.have.length(1);
    expect(harvesterItems[0]).to.have.attr('href', '#correct-url');
  });

  it('shows error when harvesters cannot be loaded', async function () {
    suppressRejections();
    this.set('space.harvesterList', promiseObject(reject('someError')));

    await render(hbs `{{content-spaces-harvesters space=space}}`);

    expect(find('.spinner')).to.not.exist;
    expect(find('.resources-list')).to.not.exist;
    expect(find('.content-info')).to.not.exist;
    const loadError = find('.resource-load-error');
    expect(loadError).to.exist;
    expect(loadError).to.contain.text('someError');
  });
});

function mockEmptyHarvestersList(testSuite) {
  const empty = promiseObject(resolve(EmberObject.create({
    list: promiseArray(resolve([])),
  })));
  testSuite.set('space.harvesterList', empty);
  sinon.stub(testSuite.get('space'), 'getRelation').withArgs('harvesterList')
    .returns(empty);
}

async function testAddingHarvester(triggerActionCallback) {
  await render(hbs `{{content-spaces-harvesters space=space}}`);

  const executeStub = sinon.stub(AddHarvesterToSpaceAction.prototype, 'execute')
    .callsFake(function () {
      expect(this.get('context.space.name')).to.equal('space1');
    });

  await triggerActionCallback();
  expect(executeStub).to.be.calledOnce;
}

async function testInvitingHarvesterUsingToken(triggerActionCallback) {
  await render(hbs `{{content-spaces-harvesters space=space}}`);

  const executeStub = sinon.stub(GenerateInviteTokenAction.prototype, 'execute')
    .callsFake(function () {
      expect(this.get('context.inviteType')).to.equal('harvesterJoinSpace');
      expect(this.get('context.targetRecord.name')).to.equal('space1');
    });

  await triggerActionCallback();
  expect(executeStub).to.be.calledOnce;
}
