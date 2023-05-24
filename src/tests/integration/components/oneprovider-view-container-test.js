import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import { getStorageOneproviderKey } from 'onezone-gui/mixins/choose-default-oneprovider';
import { lookupService } from '../../helpers/stub-service';
import globals from 'onedata-gui-common/utils/globals';

const modernVersion = '21.02.1';

describe('Integration | Component | oneprovider-view-container', function () {
  setupRenderingTest();

  context('with single modern Oneprovider', function () {
    beforeEach(function () {
      const oneproviderId = 'op1';
      const oneproviderName = 'Jabłonica Polska';
      const provider = {
        entityId: oneproviderId,
        name: oneproviderName,
        version: modernVersion,
        online: true,
      };
      const providerListPromise = promiseObject(resolve({
        list: promiseArray(resolve([provider])),
      }));
      const space = {
        providerList: providerListPromise,
        getRelation(name) {
          if (name === 'providerList') {
            return providerListPromise;
          }
        },
      };
      const providerManager = lookupService(this, 'provider-manager');
      const getRecordByIdStub = sinon.stub(providerManager, 'getRecordById')
        .withArgs(oneproviderId)
        .resolves(provider);
      this.setProperties({
        provider,
        space,
        oneproviderId,
        oneproviderName,
        getRecordByIdStub,
      });
    });

    it('renders container header and body content', async function () {
      await render(hbs `
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

      expect(find('.content-header-section')).to.contain.text('hello header');
      expect(find('.oneprovider-view-container-inner')).to.contain.text('hello body');
    });

    it('renders name of selected Oneprovider in tab bar mode', async function () {
      await render(hbs `
        {{#oneprovider-view-container
          space=space
          oneproviderId=oneproviderId
          mapSelectorEnabled=false
          isTabBarCollapsed=true
          oneproviderIdChanged=(action (mut oneproviderId))
        }}
        {{/oneprovider-view-container}}
      `);

      expect(find('.oneprovider-name'), 'current oneprovider name')
        .to.contain.text(this.get('oneproviderName'));
    });

    it('renders container header and no body if all Oneproviders are offline',
      async function () {
        this.set('provider.online', false);

        await render(hbs `
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

        expect(find('.content-header-section'), 'header')
          .to.contain.text('hello header');
        expect(find('.oneprovider-view-container-inner'), 'body')
          .to.not.contain.text('hello body');
      }
    );

    it('renders space providers tab bar if all Oneproviders are offline', async function () {
      this.set('provider.online', false);

      await render(hbs `
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

      expect(find('.space-providers-tab-bar'), 'space-providers-tab-bar')
        .to.exist;
    });
  });

  context('with multiple modern Oneproviders', function () {
    beforeEach(function () {
      const oneproviderId1 = 'op1';
      const oneproviderId2 = 'op2';
      const provider1 = {
        entityId: oneproviderId1,
        name: 'Alpha',
        version: modernVersion,
        online: true,
        onezoneHostedBaseUrl: 'https://op1.onedata.org',
      };
      const provider2 = {
        entityId: oneproviderId2,
        name: 'Beta',
        version: modernVersion,
        online: true,
        onezoneHostedBaseUrl: 'https://op2.onedata.org',
      };

      const providerListPromise = promiseObject(resolve({
        list: promiseArray(resolve([provider1, provider2])),
      }));
      const space = {
        entityId: 's1',
        providerList: providerListPromise,
        getRelation(name) {
          if (name === 'providerList') {
            return providerListPromise;
          }
        },
      };
      const changeOneproviderId = sinon.stub().callsFake((id) => {
        return this.set('oneproviderId', id);
      });
      this.set('changeOneproviderId', changeOneproviderId);
      const providerManager = lookupService(this, 'provider-manager');
      const getRecordByIdStub = sinon.stub(providerManager, 'getRecordById')
        .withArgs(oneproviderId1)
        .resolves(provider1);
      this.setProperties({
        provider1,
        provider2,
        changeOneproviderId,
        space,
        oneproviderId: oneproviderId1,
        getRecordByIdStub,
      });
    });

    it('changes yielded Oneprovider data when tab bar item selected', async function () {
      const {
        provider1,
        provider2,
        changeOneproviderId,
      } = this.getProperties('provider1', 'provider2', 'changeOneproviderId');

      await render(hbs `
        {{#oneprovider-view-container
          space=space
          oneproviderId=oneproviderId
          mapSelectorEnabled=false
          isTabBarCollapsed=false
          oneproviderIdChanged=(action changeOneproviderId)
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

      expect(find('.selected-provider-entity-id'), 'selected op id before change')
        .to.contain.text(provider1.entityId);
      expect(find('.content-iframe-base-url'))
        .to.contain.text(provider1.onezoneHostedBaseUrl);
      await click(
        `.space-providers-tab-bar .tab-bar-li.item-${provider2.entityId} .nav-link`
      );
      expect(changeOneproviderId).to.be.calledOnce;
      expect(changeOneproviderId).to.be.calledWith('op2');
      expect(find('.selected-provider-entity-id'), 'selected op id after change')
        .to.contain.text(provider2.entityId);
      expect(find('.content-iframe-base-url'))
        .to.contain.text(provider2.onezoneHostedBaseUrl);
    });

    it('gets and sets default space Oneprovider using localStorage', async function () {
      const {
        space,
        provider1,
        provider2,
      } = this.getProperties('space', 'provider1', 'provider2');

      const storageKey = getStorageOneproviderKey(space.entityId);
      globals.mock('localStorage', {
        values: {
          [storageKey]: provider2.entityId,
        },
        getItem(id) {
          return this.values[id];
        },
        setItem(id, value) {
          this.values[id] = value;
        },
      });
      this.setProperties('space', space);
      await render(hbs `
        {{#oneprovider-view-container
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

      expect(globals.localStorage.getItem(storageKey), 'initial storage oneproviderId')
        .to.equal(provider2.entityId);
      expect(this.get('oneproviderId'), 'initial context oneproviderId')
        .to.equal(provider2.entityId);
      await click(
        `.space-providers-tab-bar .tab-bar-li.item-${provider1.entityId} .nav-link`
      );
      expect(globals.localStorage.getItem(storageKey), 'changed storage oneproviderId')
        .to.equal(provider1.entityId);
      expect(this.get('oneproviderId'), 'changed context oneproviderId')
        .to.equal(provider1.entityId);
    });
  });
});
