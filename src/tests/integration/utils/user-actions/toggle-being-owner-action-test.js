import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ToggleBeingOwnerAction from 'onezone-gui/utils/user-actions/toggle-being-owner-action';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject } from 'rsvp';
import { A } from '@ember/array';

describe('Integration | Util | user actions/toggle-being-owner-action', function () {
  setupComponentTest('global-modal-mounter', {
    integration: true,
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
    const action = ToggleBeingOwnerAction.create({ ownerSource: this });

    expect(get(action, 'className')).to.equal('toggle-being-owner-trigger');
  });

  it('has title "Make an owner" when ownerRecord is not an owner', function () {
    const context = this.get('context');
    context.owners = context.owners.without(context.ownerRecord);

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    expect(String(get(action, 'title'))).to.equal('Make an owner');
  });

  it('has title "Remove ownership" when ownerRecord is an owner', function () {
    const {
      context,
      ownerRecord,
    } = this.getProperties('context', 'ownerRecord');
    context.owners = [ownerRecord];

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    expect(String(get(action, 'title'))).to.equal('Remove ownership');
  });

  it('is not disabled when `owners` is not provided', function () {
    const context = this.get('context');
    context.owners = null;

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    expect(get(action, 'disabled')).to.be.false;
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

      const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

      expect(get(action, 'disabled')).to.be.false;
    }
  );

  it('is disabled when `owners` has one user equal to ownerRecord', function () {
    const {
      context,
      currentUser,
    } = this.getProperties('context', 'currentUser');
    context.ownerRecord = currentUser;
    context.owners = A([currentUser]);

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    expect(get(action, 'disabled')).to.be.true;
    expect(String(get(action, 'tip')))
      .to.equal('Cannot remove this ownership ‐ there must be at least one owner.');
  });

  it('is not disabled when `owners` has one user not equal to ownerRecord', function () {
    const {
      context,
      currentUser,
    } = this.getProperties('context', 'currentUser');
    context.owners = A([currentUser]);

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    expect(get(action, 'disabled')).to.be.false;
  });

  it('is disabled when current user is not an owner', function () {
    const context = this.get('context');
    context.owners = A([context.ownerRecord, {}]);

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    expect(get(action, 'disabled')).to.be.true;
    expect(String(get(action, 'tip')))
      .to.equal('Only owners can modify ownership.');
  });

  it('has icon "role-holders"', function () {
    const action = ToggleBeingOwnerAction.create({ ownerSource: this });

    expect(get(action, 'icon')).to.equal('role-holders');
  });

  it('notifies success on adding owner action success', function () {
    const context = this.get('context');
    context.owners = context.owners.without(context.ownerRecord);

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'addOwnerToRecord'
    ).withArgs(context.recordBeingOwned, context.ownerRecord).resolves();
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    return action.execute()
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

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'removeOwnerFromRecord'
    ).withArgs(context.recordBeingOwned, context.ownerRecord).resolves();
    const successNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'success'
    );

    return action.execute()
      .then(actionResult => {
        expect(addOwnerStub).to.be.calledOnce;
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string', 'User "user1" has stopped being an owner of space "space1".'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      });
  });

  it('notifies failure on adding owner action failure', function () {
    const context = this.get('context');
    context.owners = context.owners.without(context.ownerRecord);

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'addOwnerToRecord'
    ).callsFake((recordBeingOwned, ownerRecord) => {
      if (recordBeingOwned === context.recordBeingOwned &&
        ownerRecord === context.ownerRecord) {
        return reject('err');
      }
    });
    const failureNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'backendError'
    );

    return action.execute()
      .then(actionResult => {
        expect(addOwnerStub).to.be.calledOnce;
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'assigning an owner'),
          'err'
        );
        expect(get(actionResult, 'status')).to.equal('failed');
      });
  });

  it('notifies failure on removing owner action failure', function () {
    const context = this.get('context');

    const action = ToggleBeingOwnerAction.create({ ownerSource: this, context });

    const addOwnerStub = sinon.stub(
      lookupService(this, 'record-manager'),
      'removeOwnerFromRecord'
    ).callsFake((recordBeingOwned, ownerRecord) => {
      if (recordBeingOwned === context.recordBeingOwned &&
        ownerRecord === context.ownerRecord) {
        return reject('err');
      }
    });
    const failureNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'backendError'
    );

    return action.execute()
      .then(actionResult => {
        expect(addOwnerStub).to.be.calledOnce;
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'unassigning an owner'),
          'err'
        );
        expect(get(actionResult, 'status')).to.equal('failed');
      });
  });
});
