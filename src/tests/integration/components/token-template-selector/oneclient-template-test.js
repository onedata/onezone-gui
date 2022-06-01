import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe(
  'Integration | Component | token template selector/oneclient template',
  function () {
    setupRenderingTest();

    it(
      'renders tile with "template-oneclient" class, correct title and image',
      async function () {
        await render(hbs `{{token-template-selector/oneclient-template}}`);

        const tile = find('.one-tile');
        expect(tile).to.have.class('template-oneclient');
        expect(tile.querySelector('.tile-title'))
          .to.have.trimmed.text('Oneclient access');
        expect(tile.querySelector('.main-image')).to.have
          .attr('src', 'assets/images/token-templates/oneclient.svg');
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
