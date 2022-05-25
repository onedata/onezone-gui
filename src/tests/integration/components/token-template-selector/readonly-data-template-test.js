import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe(
  'Integration | Component | token template selector/readonly data template',
  function () {
    setupRenderingTest();

    it(
      'renders tile with "template-readonlyData" class, correct title and image',
      async function () {
        await render(hbs `{{token-template-selector/readonly-data-template}}`);

        const $tile = this.$('.one-tile');
        expect($tile).to.have.class('template-readonlyData');
        expect($tile.find('.tile-title').text().trim()).to.equal('Read‐only data access');
        expect($tile.find('.main-image'))
          .to.have.attr('src', 'assets/images/token-templates/readonly-data-access.svg');
      }
    );

    it('passes template name and template via selection handler', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      await render(hbs `{{token-template-selector/readonly-data-template
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
        'readonlyData',
        sinon.match({
          name: sinon.match(/Read-only data .+/),
          caveats: [
            sinon.match({
              type: 'data.readonly',
            }),
          ],
        })
      );
    });
  }
);
