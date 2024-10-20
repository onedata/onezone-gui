import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import DumpAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-lambda-revision-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get, getProperties } from '@ember/object';
import { settled } from '@ember/test-helpers';
import { suppressRejections } from '../../../helpers/suppress-rejections';

const atmLambdaId = 'lmdId';

describe(
  'Integration | Utility | workflow-actions/dump-atm-lambda-revision-action',
  function () {
    const { afterEach } = setupRenderingTest();

    beforeEach(function () {
      const downloadSpy = sinon.spy();
      this.setProperties({
        action: DumpAtmLambdaRevisionAction.create({
          ownerSource: this.owner,
          context: {
            atmLambda: {
              entityId: atmLambdaId,
            },
            revisionNumber: 3,
          },
          downloadData: downloadSpy,
        }),
        downloadSpy,
      });
    });

    afterEach(function () {
      this.action?.destroy();
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('dump-atm-lambda-revision-action-trigger');
      expect(icon).to.equal('browser-download');
      expect(String(title)).to.equal('Download (json)');
    });

    it('executes dumping lambda (success scenario)', async function () {
      const dumpStub = sinon
        .stub(lookupService(this, 'workflow-manager'), 'getAtmLambdaDump')
        .resolves(123);

      const actionResultPromise = this.get('action').execute();
      const actionResult = await actionResultPromise;

      expect(dumpStub).to.be.calledOnce
        .and.to.be.calledWith(atmLambdaId, 3);
      expect(this.get('downloadSpy')).to.be.calledOnce
        .and.to.be.calledWith(sinon.match({ dataString: '123' }));
      expect(get(actionResult, 'status')).to.equal('done');
    });

    it('executes dumping lambda revision (failure scenario)', async function () {
      suppressRejections();
      let rejectDump;
      sinon.stub(lookupService(this, 'workflow-manager'), 'getAtmLambdaDump')
        .returns(new Promise((resolve, reject) => rejectDump = reject));
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      const actionResultPromise = this.get('action').execute();
      rejectDump('someError');
      await settled();
      const actionResult = await actionResultPromise;

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'dumping lambda revision'),
        'someError'
      );
      expect(this.get('downloadSpy')).not.to.be.called;
      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
    });
  }
);
