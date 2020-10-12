import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { click } from 'ember-native-dom-helpers';

describe(
  'Integration | Component | token template selector/readonly data for user template',
  function () {
    setupComponentTest('token-template-selector/readonly-data-for-user-template', {
      integration: true,
    });

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
      function () {
        this.render(hbs `{{token-template-selector/readonly-data-for-user-template}}`);

        const $tile = this.$('.one-tile');
        expect($tile).to.have.class('template-readonlyDataForUser');
        expect($tile.find('.tile-title').text().trim())
          .to.equal('Read only data access for specific user');
        expect($tile.find('.main-image'))
          .to.have.attr('src', 'assets/images/space-data.svg');
      }
    );

    it('shows list of users', async function () {
      this.render(hbs `{{token-template-selector/readonly-data-for-user-template}}`);

      await click('.one-tile');
      const $records = this.$('.record-item');
      expect($records).to.have.length(3);
      expect($records.eq(0).text().trim()).to.equal('duplicated');
      expect($records.eq(1).text().trim()).to.equal('fromspaceonly');
      expect($records.eq(2).text().trim()).to.equal('me');
      expect($records.find('.oneicon-user')).to.exist;
    });

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      this.render(hbs `{{token-template-selector/readonly-data-for-user-template
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      await click('.record-item:first-child');
      expect(selectedSpy)
        .to.be.calledOnce.and.to.be.calledWith('readonlyDataForUser', sinon.match({
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
