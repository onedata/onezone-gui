import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
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

        const $tile = this.$('.one-tile');
        expect($tile).to.have.class('template-oneclientInOneprovider');
        expect($tile.find('.tile-title').text().trim())
          .to.equal('Oneclient access in specific Oneprovider');
        expect($tile.find('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/oneclient-in-oneprovider.svg');
      }
    );

    it('shows list of oneproviders', async function () {
      await render(hbs `{{token-template-selector/oneclient-in-oneprovider-template}}`);

      await click('.one-tile');
      const $records = this.$('.record-item');
      expect($records).to.have.length(2);
      expect($records.eq(0).text().trim()).to.equal('p1');
      expect($records.eq(1).text().trim()).to.equal('p2');
      expect($records.find('.oneicon-provider')).to.exist;
    });

    it('shows information about no oneproviders to choose', async function () {
      this.get('oneproviders').clear();

      await render(hbs `{{token-template-selector/oneclient-in-oneprovider-template}}`);

      await click('.one-tile');
      expect(this.$('.no-records-info').text().trim()).to.equal('You have no providers.');
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
