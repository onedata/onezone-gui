import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { lookupService } from '../../helpers/stub-service';
import RemoveSpaceAction from 'onezone-gui/utils/space-actions/remove-space-action';
import sinon from 'sinon';
import { get } from '@ember/object';
import { settled } from '@ember/test-helpers';
import { resolve } from 'rsvp';

describe('Integration | Service | url-action-runner', function () {
  setupRenderingTest();

  afterEach(function () {
    if (get(RemoveSpaceAction.prototype, 'execute.restore')) {
      RemoveSpaceAction.prototype.execute.restore();
    }
  });

  it('allows to run "remove space" action from transition', async function () {
    const space = {};
    sinon.stub(lookupService(this, 'record-manager'), 'getRecordById')
      .withArgs('space', 'space1').resolves(space);

    // Create an empty instance of action to load methods of the class. Without this line
    // RemoveSpaceAction has no property 'prototype.execute'.
    RemoveSpaceAction.create().destroy();
    const executeStub = sinon.stub(RemoveSpaceAction.prototype, 'execute')
      .callsFake(function () {
        expect(this.get('context.space')).to.equal(space);
        return resolve();
      });

    const service = lookupService(this, 'url-action-runner');
    const transition = {
      to: {
        queryParams: {
          action_name: 'removeSpace',
          action_space_id: 'space1',
        },
      },
    };

    service.runFromTransition(transition);

    await settled();
    expect(executeStub).to.be.calledOnce;
  });
});
