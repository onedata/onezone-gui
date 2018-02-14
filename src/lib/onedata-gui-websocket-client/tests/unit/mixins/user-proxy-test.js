import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EmberObject from '@ember/object';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import sinon from 'sinon';

describe('Unit | Mixin | user proxy', function () {
  beforeEach(function () {
    this.currentUserStub = EmberObject.create({
      getCurrentUserRecord() {},
    });
  });

  it('adds userProxy field that resolves to current user record', function () {
    const UserProxyObject = EmberObject.extend(UserProxyMixin, {
      currentUser: this.currentUserStub,
    });
    const userRecord = {};
    sinon.stub(this.currentUserStub, 'getCurrentUserRecord').resolves(userRecord);

    const subject = UserProxyObject.create();

    return subject.get('userProxy').then(user => {
      expect(user).to.equal(userRecord);
    });
  });
});
