import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';

describe(
  'Integration | Component | token template selector/onepanel rest template',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const clusters = [{
        constructor: {
          modelName: 'cluster',
        },
        name: 'oneprovider1',
        entityId: 'oneprovider1id',
        type: 'oneprovider',
      }, {
        constructor: {
          modelName: 'cluster',
        },
        name: 'onezone2',
        entityId: 'onezone2id',
        type: 'onezone',
      }];
      const clusterManagerService = lookupService(this, 'cluster-manager');
      sinon.stub(clusterManagerService, 'getClusters')
        .returns(promiseObject(resolve({
          list: promiseArray(resolve(clusters)),
        })));
      this.set('clusters', clusters);
    });

    it(
      'renders tile with "template-onepanelRest" class, correct title and image',
      async function () {
        await render(hbs `{{token-template-selector/onepanel-rest-template}}`);

        const tile = find('.one-tile');
        expect(tile).to.have.class('template-onepanelRest');
        expect(tile.querySelector('.tile-title'))
          .to.have.trimmed.text('Onepanel REST access');
        expect(tile.querySelector('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/onepanel-rest.svg');
      }
    );

    it('shows list of clusters', async function () {
      await render(hbs `{{token-template-selector/onepanel-rest-template}}`);

      await click('.one-tile');
      const records = findAll('.record-item');
      expect(records).to.have.length(2);
      expect(records[0]).to.have.trimmed.text('onezone2');
      expect(records[1]).to.have.trimmed.text('oneprovider1');
      expect(records[0].querySelector('.oneicon-onezone')).to.exist;
      expect(records[1].querySelector('.oneicon-provider')).to.exist;
    });

    it('passes template name and  template for oneprovider via selection handler',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        await render(hbs `{{token-template-selector/onepanel-rest-template
          onSelected=selectedSpy
        }}`);

        await click('.one-tile');
        await click('.record-item:last-child');
        expect(selectedSpy)
          .to.be.calledOnce.and.to.be.calledWith('onepanelRest', sinon.match({
            name: sinon.match(/Onepanel REST .+/),
            caveats: [
              sinon.match({
                type: 'service',
                whitelist: ['opp-oneprovider1id'],
              }),
              sinon.match({
                type: 'interface',
                interface: 'rest',
              }),
            ],
          }));
      });

    it('passes template name and template for onezone via selection handler',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        await render(hbs `{{token-template-selector/onepanel-rest-template
          onSelected=selectedSpy
        }}`);

        await click('.one-tile');
        await click('.record-item:first-child');
        expect(selectedSpy)
          .to.be.calledOnce.and.to.be.calledWith('onepanelRest', sinon.match({
            name: sinon.match(/Onepanel REST .+/),
            caveats: [
              sinon.match({
                type: 'service',
                whitelist: ['ozp-onezone'],
              }),
              sinon.match({
                type: 'interface',
                interface: 'rest',
              }),
            ],
          }));
      });
  }
);
