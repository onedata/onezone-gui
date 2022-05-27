import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe(
  'Integration | Component | token template selector/oneclient template',
  function () {
    setupRenderingTest();

    it(
      'renders tile with "template-oneclient" class, correct title and image',
      async function () {
        await render(hbs `{{token-template-selector/oneclient-template}}`);

        const $tile = this.$('.one-tile');
        expect($tile).to.have.class('template-oneclient');
        expect($tile.find('.tile-title').text().trim()).to.equal('Oneclient access');
        expect($tile.find('.main-image'))
          .to.have.attr('src', 'assets/images/token-templates/oneclient.svg');
      }
    );

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      await render(hbs `{{token-template-selector/oneclient-template
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
        'oneclient',
        sinon.match({
          name: sinon.match(/Oneclient .+/),
          caveats: [
            sinon.match({
              type: 'interface',
              interface: 'oneclient',
            }),
          ],
        })
      );
    });
  }
);
