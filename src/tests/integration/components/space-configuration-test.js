import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { assert } from '@ember/debug';
import { render, find, click, fillIn } from '@ember/test-helpers';
import createSpace from '../../helpers/create-space';
import { lookupService } from '../../helpers/stub-service';
import { get } from '@ember/object';
import ToggleHelper from '../../helpers/toggle';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import sinon from 'sinon';
import CurrentUser from '../../helpers/mixins/current-user';
import OneDropdownHelper from '../../helpers/one-dropdown';

describe('Integration | Component | space-configuration', function () {
  setupRenderingTest();
  clearStoreAfterEach();

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

  it('has disabled advertised toggle if all required fields are empty', async function () {
    const helper = new Helper(this);
    await helper.initSpace({
      advertisedInMarketplace: false,
      organizationName: '',
      tags: [],
      description: '',
    });

    await helper.render();

    expect(helper.advertisedToggle.isDisabled()).to.be.true;
  });

  [
    ['organizationName', ''],
    ['description', ''],
  ].forEach(([fieldName, emptyValue]) => {
    it(`has disabled advertised toggle if ${fieldName} field is empty`, async function () {
      const helper = new Helper(this);
      const spaceData = {
        advertisedInMarketplace: false,
        organizationName: 'hello',
        tags: ['world'],
        description: 'foo',
      };
      // override specific field value to be empty
      spaceData[fieldName] = emptyValue;
      await helper.initSpace(spaceData);

      await helper.render();

      expect(helper.advertisedToggle.isDisabled()).to.be.true;
    });
  });

  it('has non-disabled advertised toggle if all required fields are filled', async function () {
    const helper = new Helper(this);
    await helper.initSpace({
      advertisedInMarketplace: false,
      organizationName: 'hello',
      tags: [],
      description: 'foo',
    });

    await helper.render();

    expect(helper.advertisedToggle.isDisabled()).to.be.false;
  });

  it('does not renders validation error for tags input in edit mode when it contains only tags', async function () {
    const helper = new Helper(this);
    await helper.initSpace({
      name: 'Hello world',
      organizationName: 'The Corporation',
      tags: ['hello', 'world'],
    });

    sinon.stub(helper.spaceManager, 'getAvailableSpaceTags').returns({
      firstCategory: ['hello', 'world'],
    });

    await helper.render();
    await click(helper.spaceTagsInlineEditor);

    const tagItems = [...helper.spaceTagsInlineEditor.querySelectorAll('.tag-item')];
    expect(helper.spaceTagsFormGroup).to.not.have.class('has-error');
    expect(helper.spaceTagsInlineEditor).to.not.have.class('save-disabled');
    for (const tagItem of tagItems) {
      expect(tagItem).to.not.have.class('tag-item-danger');
    }
  });

  it('renders validation error for tags input in edit mode when it contains unsupported tags', async function () {
    const helper = new Helper(this);
    await helper.initSpace({
      name: 'Hello world',
      organizationName: 'The Corporation',
      tags: ['hello', 'world'],
    });

    sinon.stub(helper.spaceManager, 'getAvailableSpaceTags').returns({
      firstCategory: ['hello'],
    });

    await helper.render();
    await click(helper.spaceTagsInlineEditor);
    const tagItems = [...helper.spaceTagsInlineEditor.querySelectorAll('.tag-item')];

    expect(helper.spaceTagsFormGroup).to.have.class('has-error');
    expect(helper.spaceTagsInlineEditor).to.have.class('save-disabled');
    expect(tagItems[0]).to.not.have.class('tag-item-danger');
    expect(tagItems[1]).to.have.class('tag-item-danger');
  });

  it('allows to enter and save custom email address if advertising is enabled', async function () {
    const helper = new Helper(this);
    const space = await helper.initSpace({
      advertisedInMarketplace: true,
      marketplaceContactEmail: 'first@example.com',
    });
    sinon.stub(helper.router, 'urlFor').returns('http://example.com');

    await helper.render();
    await click(helper.emailInlineEditor.querySelector('.one-label'));

    const dropdown = new OneDropdownHelper(
      helper.emailInlineEditor.querySelector('.ember-power-select-trigger')
    );
    await dropdown.selectOptionByText('Custom value...');
    const input = helper.emailInlineEditor.querySelector(
      '.ember-power-select-trigger input'
    );
    const saveButton = helper.emailInlineEditor.querySelector('.save-icon');
    expect(input, 'input').to.exist;
    expect(saveButton, 'saveButton').to.exist;
    await fillIn(input, 'second@example.com');
    await click(saveButton);
    expect(space.get('marketplaceContactEmail')).to.equal('second@example.com');
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.store = lookupService(this.mochaContext, 'store');
    this.currentUser = new CurrentUser(mochaContext);
  }

  async createSpace(data) {
    return await createSpace(this.store, data);
  }
  async initSpace(data) {
    this.space = await this.createSpace({
      privileges: {
        update: true,
        manageMarketplace: true,
      },
      ...data,
    });
    return this.space;
  }

  get element() {
    return find('.space-configuration');
  }
  get spaceNameEditor() {
    return this.element.querySelector('.space-name');
  }
  get organizationNameEditor() {
    return this.element.querySelector('.organization-name');
  }
  get advertisedToggle() {
    return new ToggleHelper(this.element.querySelector('.advertised-toggle'));
  }
  get emailInlineEditor() {
    return this.element.querySelector('.one-inline-editor.contact-email');
  }
  get spaceTagsFormGroup() {
    return this.element.querySelector('.space-tags-form-group');
  }
  get spaceTagsInlineEditor() {
    return this.spaceTagsFormGroup.querySelector('.one-inline-editor.space-tags');
  }

  get spaceManager() {
    return lookupService(this.mochaContext, 'spaceManager');
  }
  get router() {
    return lookupService(this.mochaContext, 'router');
  }

  async render() {
    await this.currentUser.ensureStub();
    this.mochaContext.setProperties({
      space: this.space,
    });
    await render(hbs`{{space-configuration space=space}}`);
  }
}
