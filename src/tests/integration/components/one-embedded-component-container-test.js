import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Component | one embedded component container', function () {
  setupComponentTest('one-embedded-component-container', {
    integration: true,
  });

  it('passes the action which can be invoked by iframe', function () {
    const hello = sinon.spy();
    const iframeActions = {
      hello,
    };
    this.set('windowActions', iframeActions);
    this.render(hbs `{{one-embedded-component-container
      src="external-component-1.html"
    }}`);
    return wait().then(() => new Promise(resolve => {
      setTimeout(() => {
        expect(hello).to.be.calledOnce;
        expect(hello).to.be.calledWith('world');
        resolve();
      }, 1000);
    }));
  });
});
