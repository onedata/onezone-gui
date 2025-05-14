import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';
import { lookupService } from '../../../helpers/stub-service';
import clearStore from '../../../helpers/clear-store';
import { all as allFulfilled } from 'rsvp';

describe('Integration | Component | sidebar-providers/provider-item', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    clearStore();
  });

  it('renders provider name and icon', async function () {
    // given
    const store = lookupService(this, 'store');
    const spaceList = await store.createRecord('space-list', {
      list: [],
    });
    const provider = await store.createRecord('provider', {
      name: 'hello world',
      online: true,
      spaceList,
    }).save();
    this.set('provider', provider);

    // when
    await render(hbs `<SidebarProviders::ProviderItem @item={{this.provider}} />`);

    // then
    expect(this.element).to.contain.text(provider.name);
    expect(find('.oneicon-provider')).to.exist;
  });

  it('renders number of supported spaces', async function () {
    // given
    const store = lookupService(this, 'store');
    const provider = await store.createRecord('provider', {
      name: 'hello world',
      online: true,
    }).save();
    const spaces = await allFulfilled(
      ['space1', 'space2'].map(name =>
        store.createRecord('space', {
          name,
          supportSizes: {
            [provider.entityId]: 1024,
          },
        })
      )
    );
    const spaceList = await store.createRecord('space-list', {
      list: spaces,
    });
    provider.set('spaceList', spaceList);
    await provider.save();

    this.set('provider', provider);

    // when
    await render(hbs `<SidebarProviders::ProviderItem @item={{this.provider}} />`);

    // then
    expect(this.element.querySelector('.supported-spaces-count')).to.contain.text('2');
  });

  it('reacts for change of number of supported spaces', async function () {
    // given
    const store = lookupService(this, 'store');
    const provider = await store.createRecord('provider', {
      name: 'hello world',
      online: true,
    }).save();
    const spaces = await allFulfilled(
      ['space1', 'space2'].map(name =>
        store.createRecord('space', {
          name,
          supportSizes: {
            [provider.entityId]: 1024,
          },
        })
      )
    );
    const spaceList = await store.createRecord('space-list', {
      list: spaces,
    });
    provider.set('spaceList', spaceList);
    await provider.save();
    this.set('provider', provider);
    await render(hbs `<SidebarProviders::ProviderItem @item={{this.provider}} />`);

    // when-then
    const countElement = this.element.querySelector('.supported-spaces-count');
    expect(countElement).to.contain.text('2');
    spaceList.set('list', [spaces[0]]);
    await spaceList.save();
    expect(countElement).to.contain.text('1');
  });

  it('renders total spaces support size', async function () {
    // given
    const store = lookupService(this, 'store');
    const provider = await store.createRecord('provider', {
      name: 'hello world',
      online: true,
    }).save();
    const spaces = await allFulfilled(
      ['space1', 'space2'].map(name =>
        store.createRecord('space', {
          name,
          supportSizes: {
            [provider.entityId]: 1024,
          },
        })
      )
    );
    const spaceList = await store.createRecord('space-list', {
      list: spaces,
    });
    provider.set('spaceList', spaceList);
    await provider.save();
    this.set('provider', provider);

    // when
    await render(hbs `<SidebarProviders::ProviderItem @item={{this.provider}} />`);

    // then
    const sizeElement = this.element.querySelector('.total-support-size');
    expect(sizeElement).to.contain.text('2 KiB');
  });

  it('updates total support size when a space is added to provider', async function () {
    // given
    const store = lookupService(this, 'store');
    const provider = await store.createRecord('provider', {
      name: 'hello world',
      online: true,
    }).save();
    const spaces = await allFulfilled(
      ['space1', 'space2'].map(name =>
        store.createRecord('space', {
          name,
          supportSizes: {
            [provider.entityId]: 1024,
          },
        })
      )
    );
    const spaceList = await store.createRecord('space-list', {
      list: [spaces[0]],
    });
    provider.set('spaceList', spaceList);
    await provider.save();
    this.set('provider', provider);
    await render(hbs `<SidebarProviders::ProviderItem @item={{this.provider}} />`);

    // when-then
    const sizeElement = this.element.querySelector('.total-support-size');
    expect(sizeElement).to.contain.text('1 KiB');
    spaceList.set('list', spaces);
    await spaceList.save();
    expect(sizeElement).to.contain.text('2 KiB');
  });
});
