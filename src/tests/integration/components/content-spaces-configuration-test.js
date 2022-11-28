import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { assert } from '@ember/debug';
import { render, find, click, fillIn } from '@ember/test-helpers';
import createSpace from '../../helpers/create-space';
import { lookupService } from '../../helpers/stub-service';
import { get } from '@ember/object';

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

  it('allows space name edition and save', async function () {
    const helper = new Helper(this);
    await helper.initSpace({
      name: 'Hello world',
    });

    await helper.render();
    await click(helper.spaceNameEditor.querySelector('.one-label'));
    await fillIn(helper.spaceNameEditor.querySelector('input'), 'Foo bar');
    await click(helper.spaceNameEditor.querySelector('.save-icon'));

    expect(helper.spaceNameEditor).to.contain.text('Foo bar');
    expect(get(helper.space, 'name')).to.equal('Foo bar');
  });

  it('allows organization name edition and save', async function () {
    const helper = new Helper(this);
    await helper.initSpace({
      organizationName: 'The Corporation',
    });

    await helper.render();
    await click(helper.organizationNameEditor.querySelector('.one-label'));
    await fillIn(
      helper.organizationNameEditor.querySelector('input'),
      'The Software House'
    );
    await click(helper.organizationNameEditor.querySelector('.save-icon'));

    expect(helper.organizationNameEditor).to.contain.text('The Software House');
    expect(get(helper.space, 'organizationName')).to.equal('The Software House');
  });

  // FIXME: display organization name with tooltip "display name of the organization that manages the space"
  // FIXME: it shows error on name save failure
  // FIXME: jakiś napis, jak nie ma organization name (not set?)
  // FIXME: enter w formularzu czasami powoduje przeładowanie strony
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
  get spaceConfiguration() {
    return this.element.querySelector('.space-configuration');
  }
  get spaceNameEditor() {
    return this.spaceConfiguration.querySelector('.space-name');
  }
  get organizationNameEditor() {
    return this.spaceConfiguration.querySelector('.organization-name');
  }

  async render() {
    this.mochaContext.setProperties({
      space: this.space,
    });
    await render(hbs`{{content-spaces-configuration space=space}}`);
  }
}
