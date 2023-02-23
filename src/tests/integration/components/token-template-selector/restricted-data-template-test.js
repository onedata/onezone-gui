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
  'Integration | Component | token-template-selector/restricted-data-template',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const spaces = [{
        constructor: {
          modelName: 'space',
        },
        name: 's2',
        entityId: 's2id',
      }, {
        constructor: {
          modelName: 'space',
        },
        name: 's1',
        entityId: 's1id',
      }];
      const recordManagerService = lookupService(this, 'record-manager');
      sinon.stub(recordManagerService, 'getUserRecordList')
        .withArgs('space')
        .returns(promiseObject(resolve({
          list: promiseArray(resolve(spaces)),
        })));
      this.set('spaces', spaces);
    });

    it(
      'renders tile with "template-restrictedData" class, correct title and image',
      async function () {
        await render(hbs `{{token-template-selector/restricted-data-template}}`);

        const tile = find('.one-tile');
        expect(tile).to.have.class('template-restrictedData');
        expect(tile.querySelector('.tile-title'))
          .to.have.trimmed.text('Restricted data access');
        expect(tile.querySelector('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/restricted-data-access.svg');
      }
    );

    it('shows list of spaces', async function () {
      await render(hbs `{{token-template-selector/restricted-data-template}}`);

      await click('.one-tile');
      const records = findAll('.record-item');
      expect(records).to.have.length(2);
      expect(records[0]).to.have.trimmed.text('s1');
      expect(records[1]).to.have.trimmed.text('s2');
      expect(records[0].querySelector('.oneicon-space')).to.exist;
    });

    it('shows information about no spaces to choose', async function () {
      this.get('spaces').clear();

      await render(hbs `{{token-template-selector/restricted-data-template}}`);

      await click('.one-tile');
      expect(find('.no-records-info')).to.have.trimmed.text('You have no spaces.');
    });

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      await render(hbs `{{token-template-selector/restricted-data-template
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      await click('.record-item:first-child');
      expect(selectedSpy)
        .to.be.calledOnce.and.to.be.calledWith('restrictedData', sinon.match({
          name: sinon.match(/Restricted data acc\. s1 .+/),
          caveats: [
            sinon.match({
              type: 'data.path',
              whitelist: ['L3MxaWQ='], // /s1id
            }),
          ],
        }));
    });
  }
);
