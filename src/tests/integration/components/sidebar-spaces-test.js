import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, findAll, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import clearStore from '../../helpers/clear-store';
import { all as allFulfilled } from 'rsvp';
import { ChunkableListModelSidebarCollection } from 'onezone-gui/utils/chunkable-list-model-sidebar-collection';
import ChunkableListModel from 'onezone-gui/utils/chunkable-list-model';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

describe('Integration | Component | sidebar-spaces', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    this.helper?.destroy();
  });

  it('renders space items list start', async function () {
    this.helper = new Helper(this);
    await this.helper.initDefaultData({ spaceCount: 20 });

    await this.helper.render();

    const renderedSpaces = this.helper.getResourceItems();
    expect(renderedSpaces).to.have.lengthOf(20);
  });

  it('renders spaces pushed to list once in the component lifetime', async function () {
    this.helper = new Helper(this);
    await this.helper.initDefaultData({ spaceCount: 1 });
    await this.helper.render();

    this.helper.spaceList.list.content.pushObjects(await this.helper.createSpaces(20));
    await this.helper.spaceList.save();
    await settled();

    const renderedSpaces = this.helper.getResourceItems();
    expect(renderedSpaces).to.have.lengthOf(21);
  });

  /**
   * Checks fix for VFS-13018: after the first load, the chunksArray has endIndex set to
   * addedSpaces count, but it was not updated if user did not triggered scroll. Let the
   * addedSpaces to be 3. The standard indexMargin is 10, so after 5 iterations, the
   * sourceArray should contain 15 element, but the invalid endIndex was still set to 3 +
   * 10 = 13.
   */
  it('renders spaces pushed to list few times in the component lifetime', async function () {
    this.helper = new Helper(this);
    await this.helper.initDefaultData({ spaceCount: 0 });
    await this.helper.render();

    const iterations = 5;
    const addedSpaces = 3;
    for (let i = 0; i < iterations; ++i) {
      this.helper.spaceList.list.content.pushObjects(
        await this.helper.createSpaces(addedSpaces)
      );
      await this.helper.spaceList.save();
      await settled();
    }

    const renderedSpaces = this.helper.getResourceItems();
    expect(renderedSpaces).to.have.lengthOf(iterations * addedSpaces);
  });
});

class RenderContext {
  @tracked model;
}

class Helper {
  renderContext = new RenderContext();

  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    mochaContext.renderContext = this.renderContext;
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }

  get batchRequestRegistry() {
    return lookupService(this.mochaContext, 'batchRequestRegistry');
  }

  getResourceItems() {
    return findAll('.resource-item');
  }

  /**
   * @param {Object} options
   * @param {number} options.spaceCount
   */
  async initDefaultData({ spaceCount = 3 } = {}) {
    const spaces = await this.createSpaces(spaceCount);
    this.spaceList = await this.store.createRecord('space-list', {
      list: spaces,
    }).save();

    this.chunkableListModel = new ChunkableListModel({
      listModel: this.spaceList,
      batchRequestRegistry: this.batchRequestRegistry,
    });
    this.collection = new ChunkableListModelSidebarCollection(this.chunkableListModel);
    this.renderContext.model = { collection: this.collection };
  }

  async render() {
    await render(hbs`
      <PerfectScrollbarElement>
        <SidebarSpaces @model={{this.renderContext.model}} />
      </PerfectScrollbarElement>
    `);
  }

  async createSpaces(spaceCount) {
    const spaceData = _.range(spaceCount).map(i =>
      ({ name: `alpha-${String(i).padStart(3, '0')}` })
    );
    return await allFulfilled(spaceData.map(spec =>
      this.createSpaceRecord(spec).save()
    ));
  }

  createSpaceRecord(data = {}) {
    return this.store.createRecord('space', data);
  }

  destroy() {
    clearStore();
    this.chunkableListModel?.destroy();
  }
}
