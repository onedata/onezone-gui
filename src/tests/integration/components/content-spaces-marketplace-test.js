import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { assert } from '@ember/debug';
import { lookupService } from '../../helpers/stub-service';
import { render, find } from '@ember/test-helpers';
import sinon from 'sinon';

describe('Integration | Component | content-spaces-marketplace', function () {
  setupRenderingTest();

  it('renders empty marketplace message with "Refresh" action button in header when there are no advertised spaces',
    async function () {
      const helper = new Helper(this);
      helper.stubEmptyMarketplaceInfoList();
      await helper.render();

      expect(helper.element).to.exist;
      expect(helper.element).to.contain.text('No spaces in the marketplace');
      expect(helper.element).to.contain.text(
        'There are no spaces added to the marketplace. You can add your space.'
      );
      const buttons = [...helper.headerElement.querySelectorAll('button')];
      expect(buttons).to.have.lengthOf(1);
      expect(buttons[0]).to.contain.text('Refresh');
    }
  );
});

/**
 * Contains helpers for model and logic without rendering.
 */
export class BaseHelper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
  }
  get spaceManager() {
    return lookupService(this.mochaContext, 'spaceManager');
  }
  stubEmptyMarketplaceInfoList() {
    sinon.stub(this.spaceManager, 'fetchSpacesMarkeplaceInfoRecords').resolves({
      array: [],
      isLast: true,
    });
  }
}

export class Helper extends BaseHelper {
  get element() {
    return find('.content-spaces-marketplace');
  }
  get headerElement() {
    return this.element.querySelector('.spaces-marketplace-header');
  }
  async render() {
    await render(hbs`{{content-spaces-marketplace}}`);
  }
}
