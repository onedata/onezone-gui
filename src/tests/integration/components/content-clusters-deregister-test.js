import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import moment from 'moment';
import Service from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { registerService } from '../../helpers/stub-service';
import $ from 'jquery';

const OnedataGraph = Service.extend({
  request: notImplementedReject,
});

describe('Integration | Component | content clusters deregister', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'onedataGraph', OnedataGraph);
  });

  it(
    'does not allow to click the deregister button when warning checkbox is not checked',
    async function () {
      this.set('cluster', {});
      const deregister = sinon.spy();
      this.set('deregister', deregister);

      await render(hbs `{{content-clusters-deregister
        cluster=cluster
        deregister=deregister
      }}`);

      expect($('.content-clusters-deregister .btn-deregister'))
        .to.have.attr('disabled');
      await click('.content-clusters-deregister .btn-deregister');
      expect(deregister).to.be.not.called;
    }
  );

  it(
    'invokes deregister procedure when clicking deregister button',
    async function () {
      this.set('cluster', {});
      const deregister = sinon.stub().resolves();
      const afterDeregister = sinon.spy();
      this.set('deregister', deregister);
      this.set('afterDeregister', afterDeregister);

      await render(hbs `{{content-clusters-deregister
        cluster=cluster
        deregister=deregister
        afterDeregister=afterDeregister
      }}`);

      await click('.content-clusters-deregister .one-checkbox-understand');
      await click('.content-clusters-deregister .btn-deregister');
      expect(deregister).to.be.calledOnce;
      await settled();
      expect(afterDeregister).to.be.calledOnce;
    }
  );

  it(
    'shows statistics info when cluster has hasViewPrivilege',
    async function () {
      this.set('cluster', {
        creationTime: moment('2019-03-13 12:00').unix(),
        hasViewPrivilege: true,
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

      await render(hbs `{{content-clusters-deregister
        cluster=cluster
        deregister=deregister
        afterDeregister=afterDeregister
        getOneproviderClusterResourceStats=getOneproviderClusterResourceStats
      }}`);

      expect($('.row-cluster-oneprovider-stats')).to.exist;
      expect($('.li-creation-time-count .active-since-date').text())
        .to.match(/13 Mar 2019/);
      expect($('.li-spaces-count .spaces-count-number').text())
        .to.match(/4/);
      expect($('.li-groups-count .groups-count-number').text())
        .to.match(/3/);
      expect($('.li-users-count .users-count-number').text())
        .to.match(/2/);
    }
  );
});
