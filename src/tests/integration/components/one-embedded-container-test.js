import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { later } from '@ember/runloop';
import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import oneEmbeddedContainerLayout from 'onezone-gui/templates/components/one-embedded-container';

describe('Integration | Component | one embedded container', function () {
  setupComponentTest('one-embedded-container', {
    integration: true,
  });

  it('passes the property and action which can be invoked by iframe', function () {
    const hello = sinon.spy();
    const SomeEmbeddedContainer = OneEmbeddedContainer.extend({
      layout: oneEmbeddedContainerLayout,
      actions: {
        hello,
      },
    });
    this.register('component:some-embedded-container', SomeEmbeddedContainer);
    this.set('iframeElement', {});
    this.render(hbs `{{some-embedded-container
      iframeInjectedProperties=(array "iprop")
      src="external-component-1.html"
      iprop="world"
    }}`);
    return wait().then(() => new Promise(resolve => {
      later(() => {
        expect(hello).to.be.calledOnce;
        expect(hello).to.be.calledWith('world');
        resolve();
      }, 10);
    }));
  });
});
