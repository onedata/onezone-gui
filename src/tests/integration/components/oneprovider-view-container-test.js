import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';

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
});
