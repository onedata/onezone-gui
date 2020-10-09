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
  'Integration | Component | token template selector/restricted data template',
  function () {
    setupComponentTest('token-template-selector/restricted-data-template', {
      integration: true,
    });

    beforeEach(function () {
      const spaces = [{
        constructor: {
          modelName: 'space',
        },
        name: 's1',
        entityId: 's1id',
      }, {
        constructor: {
          modelName: 'space',
        },
        name: 's2',
        entityId: 's2id',
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
      function () {
        this.render(hbs `{{token-template-selector/restricted-data-template}}`);

        const $tile = this.$('.one-tile');
        expect($tile).to.have.class('template-restrictedData');
        expect($tile.find('.tile-title').text().trim())
          .to.equal('Restricted data access');
        expect($tile.find('.main-image'))
          .to.have.attr('src', 'assets/images/space-data.svg');
      }
    );

    it('shows list of spaces', async function () {
      this.render(hbs `{{token-template-selector/restricted-data-template}}`);

      await click('.one-tile');
      const $records = this.$('.record-item');
      expect($records).to.have.length(2);
      expect($records.eq(0).text().trim()).to.equal('s1');
      expect($records.eq(1).text().trim()).to.equal('s2');
      expect($records.find('.oneicon-space')).to.exist;
    });

    it('shows information about no spaces to choose', async function () {
      this.get('spaces').clear();

      this.render(hbs `{{token-template-selector/restricted-data-template}}`);

      await click('.one-tile');
      expect(this.$('.no-records-info').text().trim()).to.equal('You have no spaces.');
    });

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      this.render(hbs `{{token-template-selector/restricted-data-template
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      await click('.record-item:first-child');
      expect(selectedSpy)
        .to.be.calledOnce.and.to.be.calledWith('restrictedData', sinon.match({
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
