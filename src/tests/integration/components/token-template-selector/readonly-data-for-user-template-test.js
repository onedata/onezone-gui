import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { clearStoreAfterEach } from '../../../helpers/clear-store';
import gri from 'onedata-gui-websocket-client/utils/gri';

describe(
  'Integration | Component | token-template-selector/readonly-data-for-user-template',
  function () {
    const { afterEach } = setupRenderingTest();

    clearStoreAfterEach(afterEach);

    beforeEach(async function () {
      const recordManagerService = lookupService(this, 'record-manager');
      const store = lookupService(this, 'store');
      const instance = {
        aspect: 'instance',
        scope: 'auto',
      };

      const currentUser = await store.createRecord('user', {
        id: gri({
          entityType: 'user',
          entityId: 'me',
          ...instance,
          scope: 'private',
        }),
        name: 'me',
      }).save();

      const userInSpaceAndGroup = await store.createRecord('user', {
        id: gri({
          entityType: 'user',
          entityId: 'duplicated',
          ...instance,
        }),
        name: 'duplicated',
      }).save();
      const userInSpaceOnly = await store.createRecord('user', {
        id: gri({
          entityType: 'user',
          entityId: 'fromspaceonly',
          ...instance,
        }),
        name: 'fromspaceonly',
      }).save();
      const groupEffUserList = await store.createRecord('userList', {
        list: [userInSpaceAndGroup],
      }).save();
      const spaceEffUserList = await store.createRecord('userList', {
        list: [userInSpaceAndGroup, userInSpaceOnly],
      }).save();
      const group = await store.createRecord('group', {
        effUserList: groupEffUserList,
      }).save();
      const space = await store.createRecord('space', {
        effUserList: spaceEffUserList,
      }).save();
      const currentUserGroupList = await store.createRecord('groupList', {
        list: [group],
      });
      const currentUserSpaceList = await store.createRecord('spaceList', {
        list: [space],
      });

      sinon.stub(recordManagerService, 'getCurrentUserRecord').returns(currentUser);
      sinon.stub(recordManagerService, 'getUserRecordList')
        .withArgs('group').resolves(currentUserGroupList)
        .withArgs('space').resolves(currentUserSpaceList);
    });

    it('renders tile with "template-readonlyDataForUser" class, correct title and image',
      async function () {
        await render(hbs `<TokenTemplateSelector::ReadonlyDataForUserTemplate />`);

        const tile = find('.one-tile');
        expect(tile).to.have.class('template-readonlyDataForUser');
        expect(tile.querySelector('.tile-title'))
          .to.have.trimmed.text('Read‐only data access for specific user');
        expect(tile.querySelector('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/readonly-user-data-access.svg');
      }
    );

    it('shows list of users', async function () {
      await render(hbs `<TokenTemplateSelector::ReadonlyDataForUserTemplate />`);

      await click('.one-tile');
      const records = findAll('.record-item');
      expect(records).to.have.length(3);
      expect(records[0]).to.have.trimmed.text('duplicated');
      expect(records[1]).to.have.trimmed.text('fromspaceonly');
      expect(records[2]).to.have.trimmed.text('me');
      expect(records[0].querySelector('.oneicon-user')).to.exist;
    });

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      await render(hbs `<TokenTemplateSelector::ReadonlyDataForUserTemplate
        @onSelected={{selectedSpy}}
      />`);

      await click('.one-tile');
      await click('.record-item:first-child');
      expect(selectedSpy)
        .to.be.calledOnce.and.to.be.calledWith('readonlyDataForUser', sinon.match({
          name: sinon.match(/Read-only data for duplicated .+/),
          caveats: [
            sinon.match({
              type: 'consumer',
              whitelist: ['usr-duplicated'],
            }),
            sinon.match({
              type: 'data.readonly',
            }),
          ],
        }));
    });
  }
);
