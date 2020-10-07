import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe(
  'Integration | Component | token template selector/onezone rest template',
  function () {
    setupComponentTest('token-template-selector/onezone-rest-template', {
      integration: true,
    });

    it(
      'renders tile with "template-onezoneRest" class, correct title and image',
      function () {
        this.render(hbs `{{token-template-selector/onezone-rest-template}}`);

        const $tile = this.$('.one-tile');
        expect($tile).to.have.class('template-onezoneRest');
        expect($tile.find('.tile-title').text().trim()).to.equal('Onezone REST');
        expect($tile.find('.main-image'))
          .to.have.attr('src', 'assets/images/space-data.svg');
      }
    );

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      this.render(hbs `{{token-template-selector/onezone-rest-template
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
        'onezoneRest',
        sinon.match({
          caveats: [
            sinon.match({
              type: 'service',
              whitelist: ['ozw-onezone'],
            }),
            sinon.match({
              type: 'interface',
              interface: 'rest',
            }),
          ],
        })
      );
    });
  }
);
