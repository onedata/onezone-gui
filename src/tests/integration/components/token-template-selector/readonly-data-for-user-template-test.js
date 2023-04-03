import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';

describe(
  'Integration | Component | token-template-selector/readonly-data-for-user-template',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const recordManagerService = lookupService(this, 'record-manager');
      const userConstructor = {
        modelName: 'user',
      };
      sinon.stub(recordManagerService, 'getCurrentUserRecord')
        .returns({
          constructor: userConstructor,
          entityId: 'me',
          name: 'me',
        });
      const userInSpaceAndGroup = {
        constructor: userConstructor,
        entityId: 'duplicated',
        name: 'duplicated',
      };
      sinon.stub(recordManagerService, 'getUserRecordList')
        .withArgs('group')
        .returns(promiseObject(resolve({
          list: promiseArray(resolve([{
            effUserList: promiseObject(resolve({
              list: promiseArray(resolve([userInSpaceAndGroup])),
            })),
          }])),
        })))
        .withArgs('space')
        .returns(promiseObject(resolve({
          list: promiseArray(resolve([{
            effUserList: promiseObject(resolve({
              list: promiseArray(resolve([userInSpaceAndGroup, {
                constructor: userConstructor,
                entityId: 'fromspaceonly',
                name: 'fromspaceonly',
              }])),
            })),
          }])),
        })));
    });

    it(
      'renders tile with "template-readonlyDataForUser" class, correct title and image',
      async function () {
        await render(hbs `{{token-template-selector/readonly-data-for-user-template}}`);

        const tile = find('.one-tile');
        expect(tile).to.have.class('template-readonlyDataForUser');
        expect(tile.querySelector('.tile-title'))
          .to.have.trimmed.text('Read‐only data access for specific user');
        expect(tile.querySelector('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/readonly-user-data-access.svg');
      }
    );

    it('shows list of users', async function () {
      await render(hbs `{{token-template-selector/readonly-data-for-user-template}}`);

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

      await render(hbs `{{token-template-selector/readonly-data-for-user-template
        onSelected=selectedSpy
      }}`);

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
