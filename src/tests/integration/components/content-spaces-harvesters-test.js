import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { Promise, all as allFulfilled } from 'rsvp';
import { suppressRejections } from '../../helpers/suppress-rejections';
import sinon from 'sinon';
import RemoveHarvesterFromSpaceAction from 'onezone-gui/utils/space-actions/remove-harvester-from-space-action';
import AddHarvesterToSpaceAction from 'onezone-gui/utils/space-actions/add-harvester-to-space-action';
import GenerateInviteTokenAction from 'onezone-gui/utils/token-actions/generate-invite-token-action';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import globals from 'onedata-gui-common/utils/globals';
import { clearStoreAfterEach } from '../../helpers/clear-store';

const Router = Service.extend({
  urlFor() {
    return '#/url';
  },
});

describe('Integration | Component | content-spaces-harvesters', function () {
  const { afterEach } = setupRenderingTest();

  clearStoreAfterEach(afterEach);

  beforeEach(async function () {
    const userId = 'user_id';
    const store = lookupService(this, 'store');
    this.set('store', store);
    const user = await store.createRecord('user', {
      id: store.userGri(userId),
      username: 'testuser',
      fullName: 'Test User',
    }).save();
    const sessionService = lookupService(this, 'session');
    sessionService.set('data', {
      authenticated: {
        identity: {
          user: user.entityId,
        },
      },
    });

    const harvester1Promise = store.createRecord('harvester', {
      name: 'harvester1',
    }).save();
    const harvester2Promise = store.createRecord('harvester', {
      name: 'harvester2',
    }).save();
    const harvesters = await allFulfilled([harvester1Promise, harvester2Promise]);
    this.set('harvesters', harvesters);
    const harvesterList =
      await store.createRecord('harvesterList', { list: harvesters }).save();
    user.set('harvesterList', harvesterList);
    const space = await store.createRecord('space', {
      name: 'space1',
      harvesterList,
    }).save();
    this.set('space', space);
    const spaceList =
      await store.createRecord('spaceList', { list: [space] }).save();
    user.set('spaceList', spaceList);
    await user.save();
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
    await render(hbs `<ContentSpacesHarvesters />`);

    expect(find('.content-spaces-harvesters')).to.exist;
  });

  it('shows spinner when harvesters are being loaded', async function () {
    sinon.stub(this.get('space'), 'getRelation').withArgs('harvesterList').returns(
      promiseObject(new Promise(() => {}))
    );

    await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

    expect(find('.spinner')).to.exist;
    expect(find('.resources-list')).to.not.exist;
    expect(find('.resource-load-error')).to.not.exist;
    expect(find('.content-info')).to.not.exist;
  });

  it('shows info page when there are no harvesters yet', async function () {
    await mockEmptyHarvestersList(this);

    await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

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

  it('allows to add harvester through empty content info', async function () {
    await mockEmptyHarvestersList(this);

    return testAddingHarvester(() =>
      click('.action-buttons .add-harvester-to-space-trigger')
    );
  });

  it('allows to invite harvester using token through empty content info', async function () {
    await mockEmptyHarvestersList(this);

    return testInvitingHarvesterUsingToken(() =>
      click('.action-buttons .generate-invite-token-action')
    );
  });

  it('shows list of space harvesters', async function () {
    await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

    expect(find('.spinner')).to.not.exist;
    expect(find('.resource-load-error')).to.not.exist;
    const harvesterItems = findAll('.resource-item');
    expect(harvesterItems).to.have.length(2);
    expect(harvesterItems[0].querySelector('.oneicon-light-bulb')).to.exist;
    expect(harvesterItems[0]).to.contain.text('harvester1');
    expect(harvesterItems[1]).to.contain.text('harvester2');
  });

  it('performs removing harvester from space', async function () {
    await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

    const executeStub = sinon.stub(RemoveHarvesterFromSpaceAction.prototype, 'execute')
      .callsFake(function () {
        expect(this.get('space.name')).to.equal('space1');
        expect(this.get('harvester.name')).to.equal('harvester1');
      });

    await click('.resource-item:first-child .btn-menu-toggle');
    await click(globals.document.querySelector('.remove-harvester-from-space-trigger'));
    expect(executeStub).to.be.calledOnce;
  });

  it('changes empty info view to list view when harvesters have been added',
    async function () {
      await mockEmptyHarvestersList(this);

      await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

      this.get('space.harvesterList.content.list.content').pushObjects(this.harvesters);
      await settled();

      expect(find('.content-info')).to.not.exist;
      expect(find('.resources-list')).to.exist;
    }
  );

  it(
    'changes list view to empty info view when harvesters have been removed',
    async function () {
      await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

      this.get('space.harvesterList.content.list.content').clear();
      await settled();

      expect(find('.resources-list')).to.not.exist;
      expect(find('.content-info')).to.exist;
    }
  );

  it('executes adding harvester from list view', async function () {
    await testAddingHarvester(async () => {
      await click('h1 .collapsible-toolbar-toggle');
      await click(globals.document.querySelector(
        '.dropdown-menu .add-harvester-to-space-trigger'
      ));
    });
  });

  it('executes inviting harvester using token from list view', async function () {
    await testInvitingHarvesterUsingToken(async () => {
      await click('h1 .collapsible-toolbar-toggle');
      await click(globals.document.querySelector(
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
        this.harvesters[0].entityId,
        'plugin',
      ).returns('#correct-url');

    await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

    const harvesterItems = findAll('.resource-item a');
    expect(harvesterItems).to.have.length(1);
    expect(harvesterItems[0]).to.have.attr('href', '#correct-url');
  });

  it('shows error when harvesters cannot be loaded', async function () {
    suppressRejections();
    await (await this.space.harvesterList).destroyRecord();

    await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

    expect(find('.spinner'), 'spinner').to.not.exist;
    expect(find('.resources-list'), 'resources-list').to.not.exist;
    expect(find('.content-info'), 'content-info').to.not.exist;
    const loadError = find('.resource-load-error');
    expect(loadError, 'resource-load-error').to.exist;
    expect(loadError).to.contain.text('root.deleted.saved');
  });
});

async function mockEmptyHarvestersList(testSuite) {
  const emptyList =
    await testSuite.store.createRecord('harvesterList', { list: [] }).save();
  testSuite.set('space.harvesterList', emptyList);
  await testSuite.space.save();
}

async function testAddingHarvester(triggerActionCallback) {
  await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

  const executeStub = sinon.stub(AddHarvesterToSpaceAction.prototype, 'execute')
    .callsFake(function () {
      expect(this.get('context.relatedRecord.name')).to.equal('space1');
    });

  await triggerActionCallback();
  expect(executeStub).to.be.calledOnce;
}

async function testInvitingHarvesterUsingToken(triggerActionCallback) {
  await render(hbs `<ContentSpacesHarvesters @space={{space}} />`);

  const executeStub = sinon.stub(GenerateInviteTokenAction.prototype, 'execute')
    .callsFake(function () {
      expect(this.get('context.inviteType')).to.equal('harvesterJoinSpace');
      expect(this.get('context.targetRecord.name')).to.equal('space1');
    });

  await triggerActionCallback();
  expect(executeStub).to.be.calledOnce;
}
