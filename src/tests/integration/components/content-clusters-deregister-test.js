import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import moment from 'moment';
import Service from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { registerService } from '../../helpers/stub-service';

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

      expect(find('.btn-deregister')).to.have.attr('disabled');
      await click('.btn-deregister');
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

      await click('.one-checkbox-understand');
      await click('.btn-deregister');
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

      expect(find('.row-cluster-oneprovider-stats')).to.exist;
      expect(find('.li-creation-time-count .active-since-date').textContent)
        .to.match(/13 Mar 2019/);
      expect(find('.li-spaces-count .spaces-count-number').textContent)
        .to.match(/4/);
      expect(find('.li-groups-count .groups-count-number').textContent)
        .to.match(/3/);
      expect(find('.li-users-count .users-count-number').textContent)
        .to.match(/2/);
    }
  );
});
