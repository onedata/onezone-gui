import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import ToggleBeingOwnerAction from 'onezone-gui/utils/user-actions/toggle-being-owner-action';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject } from 'rsvp';
import { A } from '@ember/array';

describe('Integration | Utility | user-actions/toggle-being-owner-action', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    this.action?.destroy();
  });

  beforeEach(function () {
    const currentUser = {
      entityId: 'currentUserId',
    };
    const ownerRecord = {
      entityId: 'ownerRecordId',
      name: 'user1',
    };
    this.setProperties({
      currentUser,
      ownerRecord,
      context: {
        recordBeingOwned: {
          constructor: {
            modelName: 'space',
          },
          name: 'space1',
        },
        ownerRecord,
        owners: A([ownerRecord, currentUser, {}]),
      },
    });
    sinon.stub(lookupService(this, 'record-manager'), 'getCurrentUserRecord')
      .returns(currentUser);
  });

  it('has className "toggle-being-owner-trigger"', function () {
    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner });

    expect(get(this.action, 'className')).to.equal('toggle-being-owner-trigger');
  });

  it('has title "Make an owner" when ownerRecord is not an owner', function () {
    const context = this.get('context');
    context.owners = context.owners.without(context.ownerRecord);

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    expect(String(get(this.action, 'title'))).to.equal('Make an owner');
  });

  it('has title "Remove ownership" when ownerRecord is an owner', function () {
    const {
      context,
      ownerRecord,
    } = this.getProperties('context', 'ownerRecord');
    context.owners = [ownerRecord];

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    expect(String(get(this.action, 'title'))).to.equal('Remove ownership');
  });

  it('is not disabled when `owners` is not provided', function () {
    const context = this.get('context');
    context.owners = null;

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    expect(get(this.action, 'disabled')).to.be.false;
  });

  it(
    'is not disabled when `owners` has at least two users (including ownerRecord)',
    function () {
      const {
        context,
        ownerRecord,
        currentUser,
      } = this.getProperties('context', 'ownerRecord', 'currentUser');
      context.owners = [ownerRecord, currentUser, {}];

      this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

      expect(get(this.action, 'disabled')).to.be.false;
    }
  );

  it('is disabled when `owners` has one user equal to ownerRecord', function () {
    const {
      context,
      currentUser,
    } = this.getProperties('context', 'currentUser');
    context.ownerRecord = currentUser;
    context.owners = A([currentUser]);

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    expect(get(this.action, 'disabled')).to.be.true;
    expect(String(get(this.action, 'tip')))
      .to.equal('Cannot revoke this ownership ‐ there must be at least one owner.');
  });

  it('is not disabled when `owners` has one user not equal to ownerRecord', function () {
    const {
      context,
      currentUser,
    } = this.getProperties('context', 'currentUser');
    context.owners = A([currentUser]);

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    expect(get(this.action, 'disabled')).to.be.false;
  });

  it('is disabled when current user is not an owner', function () {
    const context = this.get('context');
    context.owners = A([context.ownerRecord, {}]);

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    expect(get(this.action, 'disabled')).to.be.true;
    expect(String(get(this.action, 'tip')))
      .to.equal('Ownership can only be managed by owners.');
  });

  it('has icon "role-holders"', function () {
    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner });

    expect(get(this.action, 'icon')).to.equal('role-holders');
  });

  it('notifies success on adding owner action success', function () {
    const context = this.get('context');
    context.owners = context.owners.without(context.ownerRecord);

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'addOwnerToRecord'
    ).withArgs(context.recordBeingOwned, context.ownerRecord).resolves();
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    return this.action.execute()
      .then(actionResult => {
        expect(addOwnerStub).to.be.calledOnce;
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string', 'User "user1" has become an owner of space "space1".'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      });
  });

  it('notifies success on removing owner action success', function () {
    const context = this.get('context');

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'removeOwnerFromRecord'
    ).withArgs(context.recordBeingOwned, context.ownerRecord).resolves();
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    return this.action.execute()
      .then(actionResult => {
        expect(addOwnerStub).to.be.calledOnce;
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string', 'User "user1" is no longer an owner of space "space1".'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      });
  });

  it('notifies failure on adding owner action failure', function () {
    const error = { id: 'err' };
    const context = this.get('context');
    context.owners = context.owners.without(context.ownerRecord);

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'addOwnerToRecord'
    ).callsFake((recordBeingOwned, ownerRecord) => {
      if (recordBeingOwned === context.recordBeingOwned &&
        ownerRecord === context.ownerRecord) {
        return reject(error);
      }
    });
    const failureNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'backendError'
    );

    return this.action.execute()
      .then(actionResult => {
        expect(addOwnerStub).to.be.calledOnce;
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'granting ownership'),
          error
        );
        expect(get(actionResult, 'status')).to.equal('failed');
      });
  });

  it('notifies failure on removing owner action failure', function () {
    const error = { id: 'err' };
    const context = this.get('context');

    this.action = ToggleBeingOwnerAction.create({ ownerSource: this.owner, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'removeOwnerFromRecord'
    ).callsFake((recordBeingOwned, ownerRecord) => {
      if (recordBeingOwned === context.recordBeingOwned &&
        ownerRecord === context.ownerRecord) {
        return reject(error);
      }
    });
    const failureNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'backendError'
    );

    return this.action.execute()
      .then(actionResult => {
        expect(addOwnerStub).to.be.calledOnce;
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'revoking ownership'),
          error
        );
        expect(get(actionResult, 'status')).to.equal('failed');
      });
  });
});
