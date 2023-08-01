import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import { assert } from '@ember/debug';
import UserSpaceHelper from '../../helpers/user-space-helper';
import sinon from 'sinon';

describe('Integration | Component | space-details-tile', function () {
  setupRenderingTest();
  clearStoreAfterEach();

  it('renders "Space details" in title', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.element.textContent).to.contain('Space details');
  });

  it('renders "No details provided" if there are no details', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.element.textContent).to.contain('No details provided');
  });

  it('does not render "No details provided" if there are some details', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      description: 'hello world',
    });

    await helper.render();

    expect(helper.element.textContent).to.not.contain('No details provided');
  });

  it('renders organization name and "No tags or description" message if there is only an organization name provided',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        organizationName: 'onedata.org',
      });

      await helper.render();

      expect(helper.element.textContent).to.contain('onedata.org');
      expect(helper.element.textContent).to.contain('No tags or description');
    }
  );

  it('renders organization name, tags and "No description" message if organization name and tags are provided',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        organizationName: 'onedata.org',
        tags: ['hello', 'world'],
      });

      await helper.render();

      expect(helper.element.textContent).to.contain('onedata.org');
      const tagElements = [...helper.element.querySelectorAll('.tag-item')];
      expect(tagElements[0]).to.have.trimmed.text('hello');
      expect(tagElements[1]).to.have.trimmed.text('world');
      expect(helper.element.textContent).to.contain('No description');
    }
  );

  it('renders tags and "unknown organization..." message if only tags are provided',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        tags: ['hello', 'world'],
      });

      await helper.render();

      const tagElements = [...helper.element.querySelectorAll('.tag-item')];
      expect(tagElements[0]).to.have.trimmed.text('hello');
      expect(tagElements[1]).to.have.trimmed.text('world');
      expect(helper.element.textContent).to.contain(
        'Unknown organization, no description'
      );
    }
  );

  it('renders "unknown organization..." message on top if only tags and description are provided',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        tags: ['hello', 'world'],
        description: 'foo bar',
      });

      await helper.render();

      expect(helper.element.textContent).to.contain(
        'Unknown organization'
      );
    }
  );

  it('renders "No tags" message on top if only organization name and description are provided',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        organizationName: 'onedata.org',
        description: 'foo bar',
      });

      await helper.render();

      expect(helper.element.textContent).to.contain(
        'No tags'
      );
    }
  );

  it('renders "Unknown organization, no tags" message on top if only description is provided',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        description: 'foo bar',
      });

      await helper.render();

      expect(helper.element.textContent).to.contain(
        'Unknown organization, no tags'
      );
    }
  );
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.userSpaceHelper = new UserSpaceHelper(this.mochaContext);
    sinon.stub(lookupService(this.mochaContext, 'router'), 'urlFor').returns('#/url');
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  /** @returns {HTMLElement|null} */
  get element() {
    return find('.space-details-tile');
  }
  get space() {
    return this.userSpaceHelper.space;
  }
  get user() {
    return this.userSpaceHelper.user;
  }
  setUser() {
    return this.userSpaceHelper.setUser(...arguments);
  }
  setSpace() {
    return this.userSpaceHelper.setSpace(...arguments);
  }
  async beforeRender() {
    await this.userSpaceHelper.ensureData();
    this.mochaContext.setProperties({
      space: this.space,
    });
  }
  async render() {
    await this.beforeRender();
    await render(hbs `{{space-details-tile
      space=space
    }}`);
  }
}
