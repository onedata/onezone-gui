import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { getStorageOneproviderKey } from 'onezone-gui/mixins/choose-default-oneprovider';

describe('Integration | Component | oneprovider view container', function () {
  setupComponentTest('oneprovider-view-container', {
    integration: true,
  });

  it('renders container header and body content', function () {
    const oneproviderId = 'op1';
    const provider = {
      entityId: oneproviderId,
      name: 'Jabłonica Polska',
      versionProxy: promiseObject(resolve('20.02.1')),
      online: true,
    };
    const space = {
      providerList: promiseObject(resolve({
        list: promiseArray(resolve([provider])),
      })),
    };
    this.setProperties({
      space,
      oneproviderId,
    });
    this.render(hbs `
      {{#oneprovider-view-container
        space=space
        oneproviderId=oneproviderId
        mapSelectorEnabled=false
        oneproviderIdChanged=(action (mut oneproviderId))
        as |container|
      }}
        {{#container.header}}
          hello header
        {{/container.header}}
        {{#container.body}}
          hello body
        {{/container.body}}
      {{/oneprovider-view-container}}
    `);

    return wait().then(() => {
      expect(this.$('.content-header-section')).to.contain('hello header');
      expect(this.$('.oneprovider-view-container-inner')).to.contain('hello body');
    });
  });

  it('renders name of selected Oneprovider in tab bar mode', function () {
    const oneproviderId = 'op1';
    const oneproviderName = 'Cracow';
    const provider = {
      entityId: oneproviderId,
      name: oneproviderName,
      versionProxy: promiseObject(resolve('20.02.1')),
      online: true,
    };
    const space = {
      providerList: promiseObject(resolve({
        list: promiseArray(resolve([provider])),
      })),
    };
    this.setProperties({
      space,
      oneproviderId,
    });
    this.render(hbs `
      {{#oneprovider-view-container
        space=space
        oneproviderId=oneproviderId
        mapSelectorEnabled=false
        isTabBarCollapsed=true
        oneproviderIdChanged=(action (mut oneproviderId))
      }}
      {{/oneprovider-view-container}}
    `);

    return wait().then(() => {
      expect(this.$('.current-oneprovider-name')).to.contain(oneproviderName);
    });
  });

  it('renders container header and no body if all Oneproviders are offline', function () {
    const oneproviderId = 'op1';
    const provider = {
      entityId: oneproviderId,
      name: 'Cracow',
      versionProxy: promiseObject(resolve('20.02.1')),
      online: false,
    };
    const space = {
      providerList: promiseObject(resolve({
        list: promiseArray(resolve([provider])),
      })),
    };
    this.setProperties({
      space,
      oneproviderId,
    });
    this.render(hbs `
      {{#oneprovider-view-container
        space=space
        oneproviderId=undefined
        mapSelectorEnabled=false
        oneproviderIdChanged=(action (mut oneproviderId))
        as |container|
      }}
        {{#container.header}}
          hello header
        {{/container.header}}
        {{#container.body}}
          hello body
        {{/container.body}}
      {{/oneprovider-view-container}}
    `);

    return wait().then(() => {
      expect(this.$('.content-header-section'), 'header')
        .to.contain('hello header');
      expect(this.$('.oneprovider-view-container-inner'), 'body')
        .to.not.contain('hello body');
    });
  });

  it('renders space providers tab bar if all Oneproviders are offline', function () {
    const oneproviderId = 'op1';
    const provider = {
      entityId: oneproviderId,
      name: 'Cracow',
      versionProxy: promiseObject(resolve('20.02.1')),
      online: false,
    };
    const space = {
      providerList: promiseObject(resolve({
        list: promiseArray(resolve([provider])),
      })),
    };
    this.setProperties({
      space,
      oneproviderId,
    });
    this.render(hbs `
      {{#oneprovider-view-container
        space=space
        oneproviderId=undefined
        mapSelectorEnabled=false
        oneproviderIdChanged=(action (mut oneproviderId))
        as |container|
      }}
        {{#container.header}}
          hello header
        {{/container.header}}
        {{#container.body}}
          hello body
        {{/container.body}}
      {{/oneprovider-view-container}}
    `);

    return wait().then(() => {
      expect(this.$('.space-providers-tab-bar'), 'space-providers-tab-bar')
        .to.exist;
    });
  });

  it('changes yielded Oneprovider data when tab bar item selected', function () {
    const oneproviderId1 = 'op1';
    const oneproviderId2 = 'op2';
    const provider1 = {
      entityId: oneproviderId1,
      name: 'Alpha',
      versionProxy: promiseObject(resolve('20.02.1')),
      online: true,
      onezoneHostedBaseUrl: 'https://op1.onedata.org',
    };
    const provider2 = {
      entityId: oneproviderId2,
      name: 'Beta',
      versionProxy: promiseObject(resolve('20.02.1')),
      online: true,
      onezoneHostedBaseUrl: 'https://op2.onedata.org',
    };
    const space = {
      providerList: promiseObject(resolve({
        list: promiseArray(resolve([provider1, provider2])),
      })),
    };
    const changeOneproviderId = sinon.stub().callsFake((id) => {
      return this.set('oneproviderId', id);
    });
    this.on('changeOneproviderId', changeOneproviderId);
    this.setProperties({
      space,
      oneproviderId: oneproviderId1,
    });
    this.render(hbs `
      {{#oneprovider-view-container
        space=space
        oneproviderId=oneproviderId
        mapSelectorEnabled=false
        isTabBarCollapsed=false
        oneproviderIdChanged=(action "changeOneproviderId")
        as |container|
      }}
        {{#container.body}}
          <span class="selected-provider-entity-id">
            {{container.selectedProvider.entityId}}
          </span>
          <span class="content-iframe-base-url">
            {{container.contentIframeBaseUrl}}
          </span>
        {{/container.body}}
      {{/oneprovider-view-container}}
    `);

    return wait()
      .then(() => {
        expect(this.$('.selected-provider-entity-id'), 'selected op id before change')
          .to.contain(provider1.entityId);
        expect(this.$('.content-iframe-base-url'))
          .to.contain(provider1.onezoneHostedBaseUrl);
        return click(
          `.space-providers-tab-bar .tab-bar-li.item-${provider2.entityId} .nav-link`
        );
      })
      .then(() => {
        expect(changeOneproviderId).to.be.calledOnce;
        expect(changeOneproviderId).to.be.calledWith('op2');
        expect(this.$('.selected-provider-entity-id'), 'selected op id after change')
          .to.contain(provider2.entityId);
        expect(this.$('.content-iframe-base-url'))
          .to.contain(provider2.onezoneHostedBaseUrl);
      });
  });

  it('gets and sets default space Oneprovider using localStorage', function () {
    const provider1 = {
      entityId: 'op1',
      name: 'Alpha',
      versionProxy: promiseObject(resolve('20.02.1')),
      online: true,
      onezoneHostedBaseUrl: 'https://op1.onedata.org',
    };
    const provider2 = {
      entityId: 'op2',
      name: 'Beta',
      versionProxy: promiseObject(resolve('20.02.1')),
      online: true,
      onezoneHostedBaseUrl: 'https://op2.onedata.org',
    };
    const space = {
      entityId: 's1',
      providerList: promiseObject(resolve({
        list: promiseArray(resolve([provider1, provider2])),
      })),
    };
    const storageKey = getStorageOneproviderKey(space.entityId);
    const _localStorage = {
      getItem(id) {
        return this[id];
      },
      setItem(id, value) {
        this[id] = value;
      },
      [storageKey]: provider2.entityId,
    };
    this.setProperties({
      space,
      _localStorage,
    });
    this.render(hbs `
      {{#oneprovider-view-container
        _localStorage=_localStorage
        space=space
        oneproviderId=undefined
        mapSelectorEnabled=false
        isTabBarCollapsed=false
        oneproviderIdChanged=(action (mut oneproviderId))
        as |container|
      }}
        {{#container.body}}
          <span class="selected-provider-entity-id">
            {{container.selectedProvider.entityId}}
          </span>
          <span class="content-iframe-base-url">
            {{container.contentIframeBaseUrl}}
          </span>
        {{/container.body}}
      {{/oneprovider-view-container}}
    `);

    return wait()
      .then(() => {
        expect(_localStorage[storageKey], 'initial storage oneproviderId')
          .to.equal(provider2.entityId);
        expect(this.get('oneproviderId'), 'initial context oneproviderId')
          .to.equal(provider2.entityId);
        return click(
          `.space-providers-tab-bar .tab-bar-li.item-${provider1.entityId} .nav-link`
        );
      })
      .then(() => {
        expect(_localStorage[storageKey], 'changed storage oneproviderId')
          .to.equal(provider1.entityId);
        expect(this.get('oneproviderId'), 'changed context oneproviderId')
          .to.equal(provider1.entityId);
      });
  });
});
