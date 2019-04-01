import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import moment from 'moment';
import Service from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { registerService } from '../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';

const OnedataGraph = Service.extend({
  request: notImplementedReject,
});

describe('Integration | Component | content clusters deregister', function () {
  setupComponentTest('content-clusters-deregister', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'onedataGraph', OnedataGraph);
  });

  it(
    'does not allow to click the deregister button when warning checkbox is not checked',
    function () {
      this.set('cluster', {});
      const deregister = sinon.spy();
      this.set('deregister', deregister);

      this.render(hbs `{{content-clusters-deregister
        cluster=cluster
        deregister=deregister
      }}`);

      return wait().then(() => {
        expect($('.content-clusters-deregister .btn-deregister'))
          .to.have.attr('disabled');
        return click('.content-clusters-deregister .btn-deregister')
          .then(() => {
            expect(deregister).to.be.notCalled;
          });
      });
    }
  );

  it(
    'invokes deregister procedure when clicking deregister button',
    function () {
      this.set('cluster', {});
      const deregister = sinon.stub().resolves();
      const afterDeregister = sinon.spy();
      this.set('deregister', deregister);
      this.set('afterDeregister', afterDeregister);

      this.render(hbs `{{content-clusters-deregister
        cluster=cluster
        deregister=deregister
        afterDeregister=afterDeregister
      }}`);

      click('.content-clusters-deregister .one-checkbox-understand');

      return wait().then(() => {
        return click('.content-clusters-deregister .btn-deregister')
          .then(() => {
            expect(deregister).to.be.calledOnce;
            return wait().then(() => {
              expect(afterDeregister).to.be.calledOnce;
            });
          });
      });
    }
  );

  it(
    'shows statistics info when cluster has canViewPrivateData',
    function () {
      this.set('cluster', {
        creationTime: moment('2019-03-13 12:00').unix(),
        canViewPrivateData: true,
      });
      const deregister = sinon.stub().resolves();
      const afterDeregister = sinon.spy();
      const getOneproviderClusterResourceStats = sinon.stub().resolves({
        usersCount: 2,
        groupsCount: 3,
        spacesCount: 4,
      });
      this.set('deregister', deregister);
      this.set('afterDeregister', afterDeregister);
      this.set(
        'getOneproviderClusterResourceStats',
        getOneproviderClusterResourceStats
      );

      this.render(hbs `{{content-clusters-deregister
        cluster=cluster
        deregister=deregister
        afterDeregister=afterDeregister
        getOneproviderClusterResourceStats=getOneproviderClusterResourceStats
      }}`);

      return wait().then(() => {
        expect($('.row-cluster-oneprovider-stats')).to.exist;
        expect($('.li-creation-time-count .active-since-date').text())
          .to.match(/13 Mar 2019/);
        expect($('.li-spaces-count .spaces-count-number').text())
          .to.match(/4/);
        expect($('.li-groups-count .groups-count-number').text())
          .to.match(/3/);
        expect($('.li-users-count .users-count-number').text())
          .to.match(/2/);
      });
    }
  );
});
