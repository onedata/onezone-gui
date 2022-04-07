// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ConsumeInviteTokenAction from 'onezone-gui/utils/token-actions/consume-invite-token-action';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject, Promise } from 'rsvp';
import { next } from '@ember/runloop';
import gri from 'onedata-gui-websocket-client/utils/gri';

describe('Integration | Util | token actions/consume invite token action', function () {
  setupComponentTest('global-modal-mounter', {
    integration: true,
  });

  beforeEach(function () {
    const token = 'abcd';
    const joiningRecordId = 'joiningid';
    this.setProperties({
      token,
      joiningRecordId,
      context: {
        joiningRecord: {
          constructor: {},
          name: 'abc',
          entityId: joiningRecordId,
        },
        // to test trimming
        token: token + ' !@ ',
      },
    });
  });

  [{
    targetModelName: 'group',
    joiningModels: [{
      modelName: 'group',
      notifyText: 'Group "abc" has joined to parent group "target" successfully.',
    }, {
      modelName: 'user',
      notifyText: 'You have joined to group "target" successfully.',
    }],
  }, {
    targetModelName: 'space',
    joiningModels: [{
      modelName: 'group',
      notifyText: 'Group "abc" has joined to space "target" successfully.',
    }, {
      modelName: 'user',
      notifyText: 'You have joined to space "target" successfully.',
    }, {
      modelName: 'harvester',
      notifyText: 'Harvester "abc" has joined to space "target" successfully.',
      transitionToAspect: true,
    }],
  }, {
    targetModelName: 'cluster',
    joiningModels: [{
      modelName: 'group',
      notifyText: 'Group "abc" has joined to cluster "target" successfully.',
    }, {
      modelName: 'user',
      notifyText: 'You have joined to cluster "target" successfully.',
    }],
  }, {
    targetModelName: 'harvester',
    joiningModels: [{
      modelName: 'group',
      notifyText: 'Group "abc" has joined to harvester "target" successfully.',
    }, {
      modelName: 'user',
      notifyText: 'You have joined to harvester "target" successfully.',
    }, {
      modelName: 'space',
      notifyText: 'Space "abc" has joined to harvester "target" successfully.',
      transitionToAspect: true,
    }],
  }, {
    targetModelName: 'atmInventory',
    targetRouteResourceType: 'atm-inventories',
    joiningModels: [{
      modelName: 'group',
      notifyText: 'Group "abc" has joined to automation inventory "target" successfully.',
    }, {
      modelName: 'user',
      notifyText: 'You have joined to automation inventory "target" successfully.',
    }],
  }].forEach(({
    targetModelName,
    targetRouteResourceType,
    joiningModels,
  }) => {
    targetRouteResourceType = targetRouteResourceType || targetModelName + 's';
    joiningModels.forEach(({
      modelName: joiningModelName,
      notifyText,
      transitionToAspect,
    }) => {
      it(
        `executes consuming invite token ${joiningModelName} -> ${targetModelName} (success scenario)`,
        function () {
          const {
            token,
            joiningRecordId,
            context,
          } = this.getProperties(
            'token',
            'joiningRecordId',
            'context'
          );
          const targetRecord = {
            id: `${targetModelName}.recordid.instance:private`,
            name: 'target',
          };
          this.set('context.targetModelName', targetModelName);
          this.set('context.joiningRecord.constructor.modelName', joiningModelName);
          this.set('context.joiningRecord.id', gri({
            entityType: joiningModelName,
            entityId: joiningRecordId,
            aspect: 'instance',
            scope: 'auto',
          }));
          const action = ConsumeInviteTokenAction.create({
            ownerSource: this,
            context,
          });
          const tokenManager = lookupService(this, 'token-manager');
          const router = lookupService(this, 'router');
          const consumeTokenStub = sinon
            .stub(tokenManager, 'consumeInviteToken')
            .withArgs(token, targetModelName, joiningModelName, joiningRecordId)
            .resolves(targetRecord);
          const transitionToStub = sinon.stub(router, 'transitionTo')
            .resolves();
          const successNotifySpy = sinon.spy(
            lookupService(this, 'global-notify'),
            'success'
          );

          return action.execute()
            .then(actionResult => {
              expect(consumeTokenStub).to.be.calledOnce;
              expect(consumeTokenStub).to.be
                .calledWith(token, targetModelName, joiningModelName, joiningRecordId);
              expect(successNotifySpy).to.be.calledWith(
                sinon.match.has('string', notifyText)
              );
              expect(get(actionResult, 'status')).to.equal('done');
              expect(get(actionResult, 'result')).to.equal(targetRecord);
              return new Promise(resolve => next(resolve));
            })
            .then(() => {
              expect(transitionToStub).to.be.calledWith(
                'onedata.sidebar.content.aspect',
                (transitionToAspect ? `${joiningModelName}s` : targetRouteResourceType),
                (transitionToAspect ? joiningRecordId : 'recordid'),
                (transitionToAspect ? targetRouteResourceType : 'index'),
              );
            });
        });
    });
  });

  it(
    'does not redirect to target record if dontRedirect is true',
    function () {
      this.set('context.targetModelName', 'group');
      this.set('context.joiningRecord.constructor.modelName', 'group');
      const action = ConsumeInviteTokenAction.create({
        ownerSource: this,
        context: Object.assign(this.get('context'), { dontRedirect: true }),
      });
      const tokenManager = lookupService(this, 'token-manager');
      const router = lookupService(this, 'router');
      sinon.stub(tokenManager, 'consumeInviteToken')
        .resolves({
          id: 'group.recordid.instance:private',
          name: 'target',
        });
      const transitionToStub = sinon.stub(router, 'transitionTo')
        .resolves();

      return action.execute()
        .then(() => new Promise(resolve => next(resolve)))
        .then(() => expect(transitionToStub).to.not.be.called);
    });

  it('executes consuming token (failure scenario)', function () {
    this.set('context.targetModelName', 'group');
    this.set('context.joiningRecord.constructor.modelName', 'group');
    const action = ConsumeInviteTokenAction.create({
      ownerSource: this,
      context: this.get('context'),
    });
    const tokenManager = lookupService(this, 'token-manager');
    sinon
      .stub(tokenManager, 'consumeInviteToken')
      .returns(reject('error'));
    const failureNotifySpy = sinon.spy(
      lookupService(this, 'global-notify'),
      'backendError'
    );

    return action.execute()
      .then(actionResult => {
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'consuming token'),
          'error'
        );
        expect(get(actionResult, 'status')).to.equal('failed');
        expect(get(actionResult, 'error')).to.equal('error');
      });
  });
});
