import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';

describe('Unit | Mixin | user proxy', function() {
  // Replace this with your real tests.
  it('works', function() {
    let UserProxyObject = Ember.Object.extend(UserProxyMixin);
    let subject = UserProxyObject.create();
    expect(subject).to.be.ok;
  });
});
