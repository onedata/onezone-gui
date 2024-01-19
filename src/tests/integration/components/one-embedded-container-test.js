import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import oneEmbeddedContainerLayout from 'onezone-gui/templates/components/one-embedded-container';
import {
  sharedObjectName,
  sharedDataPropertyName,
} from 'onedata-gui-common/utils/one-embedded-common';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | one-embedded-container', function () {
  setupRenderingTest();

  it('passes the property and action which can be invoked by iframe', async function () {
    const hello = sinon.spy();
    const SomeEmbeddedContainer = OneEmbeddedContainer.extend({
      layout: oneEmbeddedContainerLayout,
      iframeInjectedProperties: Object.freeze(['iprop']),
      callParentActionNames: Object.freeze(['hello']),
      src: 'empty.html',
      actions: {
        hello,
      },
    });
    this.owner.register('component:some-embedded-container', SomeEmbeddedContainer);
    this.set('iframeElement', {});
    const s = globals.document.createElement('script');
    s.type = 'text/javascript';
    const code =
      `frameElement.${sharedObjectName}.callParent('hello', frameElement.${sharedObjectName}.${sharedDataPropertyName}.iprop);`;
    s.appendChild(globals.document.createTextNode(code));

    await render(hbs `
      <div class="embedded-iframes-container"></div>
      {{some-embedded-container
        iframeId="testId"
        iprop="world"
      }}
    `);
    const iframe = find('iframe');
    await waitUntil(() => iframe.contentDocument.readyState === 'complete');
    iframe.contentDocument.body.appendChild(s);

    await waitUntil(() => hello.callCount > 0);
    expect(hello).to.be.calledOnce;
    expect(hello).to.be.calledWith('world');
  });
});
