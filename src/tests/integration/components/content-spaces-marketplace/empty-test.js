import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { assert } from '@ember/debug';
import { lookupService } from '../../../helpers/stub-service';
import { render, find } from '@ember/test-helpers';
import sinon from 'sinon';

describe('Integration | Component | content-spaces-marketplace/empty', function () {
  setupRenderingTest();

  it('renders empty marketplace message with action button when there are no advertised spaces', async function () {
    const helper = new Helper(this);
    helper.stubEmptyMarketplaceInfoList();
    await helper.render();

    expect(helper.element).to.contain.text('No spaces in the marketplace');
    expect(helper.element).to.contain.text(
      'There are no spaces added to marketplace. You can add your space.'
    );
    const button = helper.element.querySelector('button');
    expect(button).to.exist;
    expect(button).to.contain.text('Advertise your space');
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.store = lookupService(this.mochaContext, 'store');
  }
  get spaceManager() {
    return lookupService(this.mochaContext, 'spaceManager');
  }
  get element() {
    return find('.spaces-marketplace-empty');
  }
  stubEmptyMarketplaceInfoList() {
    const emptyListRecord = this.store.createRecord('spaceMarketplaceInfoList', {
      list: [],
    });
    sinon.stub(this.spaceManager, 'getSpacesMarketplaceList').resolves(emptyListRecord);
  }
  async render() {
    await render(hbs`{{content-spaces-marketplace/empty}}`);
  }
}
