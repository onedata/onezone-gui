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
import {
  sharedObjectName,
  sharedDataPropertyName,
} from 'onedata-gui-common/utils/one-embedded-common';

describe('Integration | Component | one embedded container', function () {
  setupComponentTest('one-embedded-container', {
    integration: true,
  });

  it('passes the property and action which can be invoked by iframe', function () {
    const hello = sinon.spy();
    const SomeEmbeddedContainer = OneEmbeddedContainer.extend({
      layout: oneEmbeddedContainerLayout,
      iframeInjectedProperties: Object.freeze(['iprop']),
      callParentActionNames: Object.freeze(['hello']),
      actions: {
        hello,
      },
    });
    this.register('component:some-embedded-container', SomeEmbeddedContainer);
    this.set('iframeElement', {});
    const s = document.createElement('script');
    s.type = 'text/javascript';
    const code =
      `frameElement.${sharedObjectName}.callParent('hello', frameElement.${sharedObjectName}.${sharedDataPropertyName}.iprop);`;
    s.appendChild(document.createTextNode(code));

    this.render(hbs `
      <div class="embedded-iframes-container"></div>
      {{some-embedded-container
        iframeId="testId"
        src="empty.html"
        iprop="world"
      }}
    `);
    const iframe = this.$('iframe')[0];
    iframe.contentDocument.body.appendChild(s);

    return wait().then(() => new Promise(resolve => {
      later(() => {
        expect(hello).to.be.calledOnce;
        expect(hello).to.be.calledWith('world');
        resolve();
      }, 10);
    }));
  });
});
