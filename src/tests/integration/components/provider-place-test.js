import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import GlobalNotifyStub from '../../helpers/global-notify-stub';
import I18nStub from '../../helpers/i18n-stub';
import { lookupService, registerService } from '../../helpers/stub-service';
import Service from '@ember/service';
import globals from 'onedata-gui-common/utils/globals';
import clearStore from '../../helpers/clear-store';
import gri from 'onedata-gui-websocket-client/utils/gri';
import sinon from 'sinon';

const COPY_SUCCESS_MSG = 'copySuccess';
const COPY_ERROR_MSG = 'copyError';

const GuiUtils = Service.extend({
  getRoutableIdFor(id) {
    return id;
  },
});

const Router = Service.extend({
  urlFor() {
    return '#/url';
  },
});

describe('Integration | Component | provider-place', function () {
  const { afterEach } = setupRenderingTest();

  beforeEach(async function () {
    const globalNotify = this.set(
      'globalNotify',
      registerService(this, 'globalNotify', GlobalNotifyStub)
    );
    const globalClipboardCopyStub =
      sinon.stub(lookupService(this, 'global-clipboard'), 'copy');
    registerService(this, 'guiUtils', GuiUtils);
    registerService(this, 'router', Router);
    this.set('i18n', registerService(this, 'i18n', I18nStub));

    globalNotify._clearMessages();

    this.set('i18n.translations', {
      components: {
        providerPlace: {
          drop: {
            hostnameCopySuccess: COPY_SUCCESS_MSG,
            hostnameCopyError: COPY_ERROR_MSG,
          },
        },
      },
    });

    const { spaces, provider, providers } = await createRecords(this);

    this.setProperties({
      spaces,
      provider,
      providers,
      globalClipboardCopyStub,
    });
  });

  afterEach(function () {
    clearStore();
  });

  it('shows provider status', async function () {
    // when
    await render(hbs`<ProviderPlace @provider={{this.provider}} />`);

    // then
    const providerPlace = find('.provider-place');
    expect(providerPlace).to.exist;
    expect(providerPlace).to.have.class('online');
  });

  it('resizes with parent one-atlas component', async function () {
    this.set('atlasWidth', 5000);
    await render(hbs `
      <ProviderPlace @provider={{provider}} @atlasWidth={{atlasWidth}} />`);
    const prevWidth = parseFloat(find('.circle').style.width);
    this.set('atlasWidth', 2500);
    expect(parseFloat(find('.circle').style.width))
      .to.be.equal(prevWidth / 2);
  });

  it('notifies about hostname copy to clipboard', async function () {
    await render(hbs `
      <ProviderPlace @provider={{provider}} />`);
    await click('.circle');
    await click('.provider-host-text');
    expect(this.globalClipboardCopyStub).to.be.calledOnce.and.to.be.calledWith(
      this.provider.domain
    );
  });

  it('shows list of supported spaces', async function () {
    await render(hbs `
      <ProviderPlace @provider={{provider}} />`);

    const spaces = this.get('spaces');
    await click('.circle');
    const drop = globals.document.querySelector('.provider-place-drop');
    expect(drop.querySelectorAll('.provider-place-drop-space'))
      .to.have.length(spaces.length);
    spaces.forEach((space) => {
      expect(drop.textContent).to.contain(space.name);
    });
    expect(drop.textContent).to.contain('1 MiB');
  });

  it('shows multiple providers if necessary', async function () {
    await render(hbs `
      <ProviderPlace @provider={{providers}} />`);

    await click('.circle');
    const dropContainer = globals.document.querySelector('.provider-place-drop-container');
    expect(dropContainer.querySelectorAll('.oneproviders-list-item'))
      .to.have.length(2);
    expect(dropContainer.querySelector('.oneproviders-list-item.active')).to.exist;
  });
});

async function createRecords(mochaContext) {
  const store = lookupService(mochaContext, 'store');
  const providerId1 = '1';
  const providerId2 = '2';
  const space1 = await store.createRecord('space', {
    name: 'space1',
    supportSizes: {
      [providerId1]: 1048576,
    },
  }).save();
  const space2 = await store.createRecord('space', {
    name: 'space2',
    supportSizes: {
      [providerId1]: 1048576,
      [providerId2]: 2097152,
    },
  }).save();
  const spaces = [space1, space2];
  const cluster = await store.createRecord('cluster', {
    workerVersion: {
      release: '20.02.0-alpha',
    },
  }).save();
  const spaceList1 = await store.createRecord('spaceList', {
    list: spaces,
  }).save();
  const spaceList2 = await store.createRecord('spaceList', {
    list: spaces,
  }).save();
  const provider1 = await store.createRecord('provider', {
    id: gri({
      entityType: 'provider',
      entityId: providerId1,
      aspect: 'instance',
    }),
    name: 'provider1',
    domain: 'provider1-domain',
    online: true,
    spaceList: spaceList1,
    cluster,
  }).save();
  const provider2 = await store.createRecord('provider', {
    id: gri({
      entityType: 'provider',
      entityId: providerId2,
      aspect: 'instance',
    }),
    name: 'provider2',
    domain: 'provider2-domain',
    online: true,
    spaceList: spaceList2,
    cluster,
  }).save();

  return { spaces, provider: provider1, providers: [provider1, provider2] };
}
