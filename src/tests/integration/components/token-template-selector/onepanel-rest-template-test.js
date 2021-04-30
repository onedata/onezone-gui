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
  'Integration | Component | token template selector/onepanel rest template',
  function () {
    setupComponentTest('token-template-selector/onepanel-rest-template', {
      integration: true,
    });

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
      function () {
        this.render(hbs `{{token-template-selector/onepanel-rest-template}}`);

        const $tile = this.$('.one-tile');
        expect($tile).to.have.class('template-onepanelRest');
        expect($tile.find('.tile-title').text().trim())
          .to.equal('Onepanel REST access');
        expect($tile.find('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/onepanel-rest.svg');
      }
    );

    it('shows list of clusters', async function () {
      this.render(hbs `{{token-template-selector/onepanel-rest-template}}`);

      await click('.one-tile');
      const $records = this.$('.record-item');
      expect($records).to.have.length(2);
      expect($records.eq(0).text().trim()).to.equal('oneprovider1');
      expect($records.eq(1).text().trim()).to.equal('onezone2');
      expect($records.find('.oneicon-cluster')).to.exist;
    });

    it('passes template name and template for oneprovider via selection handler',
      async function () {
        const selectedSpy = this.set('selectedSpy', sinon.spy());

        this.render(hbs `{{token-template-selector/onepanel-rest-template
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

        this.render(hbs `{{token-template-selector/onepanel-rest-template
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
                whitelist: ['ozp-onezone2id'],
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
