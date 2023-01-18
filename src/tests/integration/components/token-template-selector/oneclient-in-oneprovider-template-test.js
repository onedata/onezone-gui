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
  'Integration | Component | token template selector/oneclient in oneprovider template',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const oneproviders = [{
        constructor: {
          modelName: 'provider',
        },
        name: 'p2',
        entityId: 'p2id',
      }, {
        constructor: {
          modelName: 'provider',
        },
        name: 'p1',
        entityId: 'p1id',
      }];
      const recordManagerService = lookupService(this, 'record-manager');
      sinon.stub(recordManagerService, 'getUserRecordList')
        .withArgs('provider')
        .returns(promiseObject(resolve({
          list: promiseArray(resolve(oneproviders)),
        })));
      this.set('oneproviders', oneproviders);
    });

    it(
      'renders tile with "template-oneclientInOneprovider" class, correct title and image',
      async function () {
        await render(hbs `{{token-template-selector/oneclient-in-oneprovider-template}}`);

        const tile = find('.one-tile');
        expect(tile).to.have.class('template-oneclientInOneprovider');
        expect(tile.querySelector('.tile-title'))
          .to.have.trimmed.text('Oneclient access in specific Oneprovider');
        expect(tile.querySelector('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/oneclient-in-oneprovider.svg');
      }
    );

    it('shows list of oneproviders', async function () {
      await render(hbs `{{token-template-selector/oneclient-in-oneprovider-template}}`);

      await click('.one-tile');
      const records = findAll('.record-item');
      expect(records).to.have.length(2);
      expect(records[0]).to.have.trimmed.text('p1');
      expect(records[1]).to.have.trimmed.text('p2');
      expect(records[0].querySelector('.oneicon-provider')).to.exist;
    });

    it('shows information about no oneproviders to choose', async function () {
      this.get('oneproviders').clear();

      await render(hbs `{{token-template-selector/oneclient-in-oneprovider-template}}`);

      await click('.one-tile');
      expect(find('.no-records-info')).to.have.trimmed.text('You have no providers.');
    });

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      await render(hbs `{{token-template-selector/oneclient-in-oneprovider-template
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      await click('.record-item:first-child');
      expect(selectedSpy)
        .to.be.calledOnce.and.to.be.calledWith('oneclientInOneprovider', sinon.match({
          name: sinon.match(/Oneclient in p1 .+/),
          caveats: [
            sinon.match({
              type: 'interface',
              interface: 'oneclient',
            }),
            sinon.match({
              type: 'service',
              whitelist: ['opw-p1id'],
            }),
          ],
        }));
    });
  }
);
