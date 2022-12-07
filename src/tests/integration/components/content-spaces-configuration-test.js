import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { assert } from '@ember/debug';
import { render, find } from '@ember/test-helpers';
import createSpace from '../../helpers/create-space';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Component | content-spaces-configuration', function () {
  setupRenderingTest();

  it('renders "Space configuration" in header', async function () {
    const helper = new Helper(this);
    await helper.initSpace();

    await helper.render();

    expect(helper.header).to.contain.text('Space configuration');
  });

  it('renders space name, organization name and tags values with labels', async function () {
    const helper = new Helper(this);
    await helper.initSpace({
      name: 'Hello world',
      organizationName: 'The Corporation',
      tags: ['hello', 'world', 'foo', 'bar'],
    });

    await helper.render();

    expect(helper.element.querySelector('.space-name-form-group').textContent)
      .to.match(/Space name:\s+Hello world/);
    expect(helper.element.querySelector('.organization-name-form-group').textContent)
      .to.match(/Organization name:\s+The Corporation/);
    expect(helper.element.querySelector('.space-tags-form-group').textContent)
      .to.match(/Tags:\s+hello\s+world\s+foo\s+\s+bar/);
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.store = lookupService(this.mochaContext, 'store');
  }

  async createSpace(data) {
    return await createSpace(this.store, data);
  }
  async initSpace(data) {
    this.space = await this.createSpace(data);
  }

  get element() {
    return find('.content-spaces-configuration');
  }
  get header() {
    return this.element.querySelector('.header-row');
  }

  async render() {
    this.mochaContext.setProperties({
      space: this.space,
    });
    await render(hbs`{{content-spaces-configuration space=space}}`);
  }
}
