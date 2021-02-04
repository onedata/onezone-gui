import { expect } from 'chai';
import { describe, context, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject, Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import suppressRejections from '../../helpers/suppress-rejections';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import RemoveHarvesterFromSpaceAction from 'onezone-gui/utils/space-actions/remove-harvester-from-space-action';
import AddHarvesterToSpaceAction from 'onezone-gui/utils/space-actions/add-harvester-to-space-action';
import GenerateInviteTokenAction from 'onezone-gui/utils/token-actions/generate-invite-token-action';
import $ from 'jquery';
import EmberObject from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';

const Router = Service.extend({
  urlFor() {
    return '#/url';
  },
});

describe('Integration | Component | content spaces harvesters', function () {
  setupComponentTest('content-spaces-harvesters', {
    integration: true,
  });

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
      getRelation(name) {
        if (name === 'harvesterList') {
          return harvesterListPromise;
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

  it('has class "content-spaces-harvesters"', function () {
    this.render(hbs `{{content-spaces-harvesters}}`);

    expect(this.$('.content-spaces-harvesters')).to.exist;
  });

  it('shows spinner when harvesters are being loaded', function () {
    sinon.stub(this.get('space'), 'getRelation').withArgs('harvesterList').returns(
      promiseObject(new Promise(() => {}))
    );

    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    return wait()
      .then(() => {
        expect(this.$('.spinner')).to.exist;
        expect(this.$('.resources-list')).to.not.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
        expect(this.$('.content-info')).to.not.exist;
      });
  });

  it('shows info page when there are no harvesters yet', function () {
    mockEmptyHarvestersList(this);

    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    return wait()
      .then(() => {
        expect(this.$('.spinner')).to.not.exist;
        expect(this.$('.resources-list')).to.not.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
        expect(this.$('.content-info')).to.exist;
        expect(this.$('h1').text().trim()).to.equal('Space harvesters');
        expect(this.$('.lead').text().trim()).to.equal(
          'This space does not provide metadata to any harvester. To start indexing process, add a harvester.'
        );
        const $buttons = this.$('.action-buttons button.btn-primary');
        expect($buttons).to.have.length(2);
        expect($buttons.eq(0)).to.have.class('add-harvester-to-space-trigger');
        expect($buttons.eq(0).text().trim()).to.equal('Add one of your harvesters');
        expect($buttons.eq(1)).to.have.class('generate-invite-token-action');
        expect($buttons.eq(1).text().trim()).to.equal('Invite harvester using token');
      });
  });

  it('allows to add harvester through empty content info', function () {
    mockEmptyHarvestersList(this);

    return testAddingHarvester(this, () =>
      click('.action-buttons .add-harvester-to-space-trigger')
    );
  });

  it('allows to invite harvester using token through empty content info', function () {
    mockEmptyHarvestersList(this);

    return testInvitingHarvesterUsingToken(this, () =>
      click('.action-buttons .generate-invite-token-action')
    );
  });

  it('shows list of space harvesters', function () {
    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    return wait()
      .then(() => {
        expect(this.$('.spinner')).to.not.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
        const $harvesterItems = this.$('.resource-item');
        expect($harvesterItems).to.have.length(2);
        expect($harvesterItems.find('.oneicon-light-bulb')).to.exist;
        expect($harvesterItems.eq(0).text()).to.contain('harvester1');
        expect($harvesterItems.eq(1).text()).to.contain('harvester2');
      });
  });

  it('performs removing harvester from space', function () {
    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    const executeStub = sinon.stub(RemoveHarvesterFromSpaceAction.prototype, 'execute')
      .callsFake(function () {
        expect(this.get('space.name')).to.equal('space1');
        expect(this.get('harvester.name')).to.equal('harvester1');
      });

    return wait()
      .then(() => click(this.$('.resource-item:first-child .btn-menu-toggle')[0]))
      .then(() => click(document.querySelector('.remove-harvester-from-space-trigger')))
      .then(() => expect(executeStub).to.be.calledOnce);
  });

  it(
    'changes empty info view to list view when harvesters have been added',
    function () {
      mockEmptyHarvestersList(this);

      this.render(hbs `{{content-spaces-harvesters space=space}}`);

      return wait()
        .then(() => {
          this.get('space.harvesterList.content.list.content').pushObjects([{
            name: 'harvester1',
          }, {
            name: 'harvester2',
          }]);
          return wait();
        })
        .then(() => {
          expect(this.$('.content-info')).to.not.exist;
          expect(this.$('.resources-list')).to.exist;
        });
    }
  );

  it(
    'changes list view to empty info view when harvesters have been removed',
    function () {
      this.render(hbs `{{content-spaces-harvesters space=space}}`);

      return wait()
        .then(() => {
          this.get('space.harvesterList.content.list.content').clear();
          return wait();
        })
        .then(() => {
          expect(this.$('.resources-list')).to.not.exist;
          expect(this.$('.content-info')).to.exist;
        });
    }
  );

  it('executes adding harvester from list view', function () {
    return testAddingHarvester(this, () =>
      click('h1 .collapsible-toolbar-toggle')
      .then(() => click($('.dropdown-menu .add-harvester-to-space-trigger')[0]))
    );
  });

  it('executes inviting harvester using token from list view', function () {
    return testInvitingHarvesterUsingToken(this, () =>
      click('h1 .collapsible-toolbar-toggle')
      .then(() => click($('.dropdown-menu .generate-invite-token-action')[0]))
    );
  });

  it('has correct link', function () {
    const router = lookupService(this, 'router');
    sinon.stub(router, 'urlFor')
      .withArgs(
        'onedata.sidebar.content.aspect',
        'harvesters',
        'harvester1id',
        'plugin',
      ).returns('#correct-url');

    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    return wait()
      .then(() => {
        const $harvesterItems = this.$('.resource-item a');
        expect($harvesterItems).to.have.length(1);
        expect($harvesterItems.eq(0)).to.have.attr('href', '#correct-url');
      });
  });

  context('handles errors', function () {
    suppressRejections();

    it('shows error when harvesters cannot be loaded', function () {
      this.set('space.harvesterList', promiseObject(reject('someError')));

      this.render(hbs `{{content-spaces-harvesters space=space}}`);

      return wait()
        .then(() => {
          expect(this.$('.spinner')).to.not.exist;
          expect(this.$('.resources-list')).to.not.exist;
          expect(this.$('.content-info')).to.not.exist;
          const $loadError = this.$('.resource-load-error');
          expect($loadError).to.exist;
          expect($loadError.text()).to.contain('someError');
        });
    });
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

function testAddingHarvester(testSuite, triggerActionCallback) {
  testSuite.render(hbs `{{content-spaces-harvesters space=space}}`);

  const executeStub = sinon.stub(AddHarvesterToSpaceAction.prototype, 'execute')
    .callsFake(function () {
      expect(this.get('context.space.name')).to.equal('space1');
    });

  return wait()
    .then(triggerActionCallback)
    .then(() => expect(executeStub).to.be.calledOnce);
}

function testInvitingHarvesterUsingToken(testSuite, triggerActionCallback) {
  testSuite.render(hbs `{{content-spaces-harvesters space=space}}`);

  const executeStub = sinon.stub(GenerateInviteTokenAction.prototype, 'execute')
    .callsFake(function () {
      expect(this.get('context.inviteType')).to.equal('harvesterJoinSpace');
      expect(this.get('context.targetRecord.name')).to.equal('space1');
    });

  return wait()
    .then(triggerActionCallback)
    .then(() => expect(executeStub).to.be.calledOnce);
}
