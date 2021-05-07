import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ModifyAtmLambdaAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-action';
import sinon from 'sinon';
import { resolve, reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';

describe(
  'Unit | Utility | workflow actions/modify atm lambda action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    it('executes modifying lambda (success scenario)', function () {
      const atmLambdaDiff = {
        name: 'lambda2',
      };
      const atmLambda = {
        name: 'lambda1',
        save: sinon.stub().callsFake(() => {
          if (atmLambda.name === atmLambdaDiff.name) {
            return resolve();
          }
        }),
      };
      const action = ModifyAtmLambdaAction.create({
        ownerSource: this,
        context: {
          atmLambda,
          atmLambdaDiff,
        },
      });
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      return action.execute()
        .then(actionResult => {
          expect(atmLambda.save).to.be.calledOnce;
          expect(atmLambda.name).to.equal('lambda2');
          expect(successNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'Lambda has been modified successfully.')
          );
          expect(get(actionResult, 'status')).to.equal('done');
          expect(get(actionResult, 'result')).to.equal(atmLambda);
        });
    });

    it('executes modifying lambda (failure scenario)', function () {
      const atmLambdaDiff = {
        name: 'lambda2',
      };
      const atmLambda = {
        name: 'lambda1',
        save: sinon.stub().callsFake(() => {
          if (atmLambda.name === atmLambdaDiff.name) {
            return reject('error');
          }
        }),
        rollbackAttributes() {
          atmLambda.name = 'lambda1';
        },
      };
      const action = ModifyAtmLambdaAction.create({
        ownerSource: this,
        context: {
          atmLambda,
          atmLambdaDiff,
        },
      });
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      return action.execute()
        .then(actionResult => {
          expect(atmLambda.name).to.equal('lambda1');
          expect(failureNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'modifying lambda'),
            'error'
          );
          expect(get(actionResult, 'status')).to.equal('failed');
          expect(get(actionResult, 'error')).to.equal('error');
        });
    });
  }
);
