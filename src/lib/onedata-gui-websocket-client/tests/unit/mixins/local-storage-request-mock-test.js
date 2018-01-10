import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import LocalStorageRequestMockMixin from 'onedata-gui-websocket-client/mixins/local-storage-request-mock';

describe('Unit | Mixin | local storage request mock', function() {
  // Replace this with your real tests.
  it('works', function() {
    let LocalStorageRequestMockObject = Ember.Object.extend(LocalStorageRequestMockMixin);
    let subject = LocalStorageRequestMockObject.create();
    expect(subject).to.be.ok;
  });
});
