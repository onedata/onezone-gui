import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { get } from '@ember/object';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { lookupService } from '../../helpers/stub-service';
import clearStore from '../../helpers/clear-store';
import { all as allFulfilled } from 'rsvp';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as clusterEntityType } from 'onezone-gui/models/cluster';

describe('Integration | Component | sidebar-tokens', function () {
  const { beforeEach, afterEach } = setupRenderingTest();

  beforeEach(async function () {
    const store = lookupService(this, 'store');
    const clusterId = '48ece7a0376745413e58e14c225e196fchee7a';
    const onedataConnection = lookupService(this, 'onedataConnection');
    onedataConnection.set('zoneName', 'cluster1');
    const cluster1 = store.createRecord('cluster', {
      id: gri({
        entityType: clusterEntityType,
        entityId: clusterId,
        aspect: 'instance',
        scope: 'auto',
      }),
      type: 'zone',
    });
    await cluster1.save();
    const tokenSpecs = [{
      name: 'invite token 2',
      type: {
        inviteToken: {
          parameters: {},
          inviteType: 'userJoinGroup',
          groupId: 'admins',
        },
      },
      revoked: false,
    }, {
      name: 'access token',
      type: { accessToken: {} },
      revoked: false,
    }, {
      name: 'identity token',
      type: { identityToken: {} },
      revoked: false,
    }, {
      name: 'invite token 1 cluster cluster1',
      type: {
        inviteToken: {
          parameters: {},
          inviteType: 'userJoinCluster',
          clusterId: cluster1.entityId,
        },
      },
      revoked: false,
    }, {
      name: 'invite disabled cluster unknown',
      type: {
        inviteToken: {
          parameters: {},
          inviteType: 'userJoinCluster',
        },
      },
      revoked: true,
    }, {
      name: 'access disabled',
      type: {
        accessToken: {
          parameters: {},
          inviteType: 'userJoinCluster',
        },
      },
      revoked: true,
    }];

    const tokens = await allFulfilled(tokenSpecs.map(spec =>
      createTokenRecord(store, spec).save()
    ));

    const tokenList = await store.createRecord('token-list', {
      list: tokens,
    }).save();

    this.setProperties({
      model: {
        collection: tokenList,
      },
      tokensOrder: [1, 2, 3, 0, 5, 4],
    });
  });

  afterEach(function () {
    clearStore();
  });

  it('renders all tokens', async function () {
    const tokens = await this.get('model.collection.list');

    await render(hbs `{{sidebar-tokens model=model}}`);

    const renderedTokens = findAll('.token-item');
    expect(renderedTokens).to.have.length(tokens.length);
  });

  it('renders tokens in correct order', async function () {
    const tokens = await this.get('model.collection.list');
    const tokensOrder = this.get('tokensOrder');

    await render(hbs `{{sidebar-tokens model=model}}`);
    findAll('.token-item').forEach((element, index) => {
      const originIndex = tokensOrder[index];
      expect(element.querySelector('.token-name'))
        .to.contain.text(get(tokens.objectAt(originIndex), 'name'));
    });
  });

  it('shows advanced token filters by default', async function () {
    await render(hbs `{{sidebar-tokens model=model}}`);

    expect(find('.advanced-filters-collapse.in .advanced-token-filters'))
      .to.exist;
  });

  [{
    type: 'access',
    count: 2,
  }, {
    type: 'identity',
    count: 1,
  }, {
    type: 'invite',
    count: 3,
  }].forEach(({ type, count }) => {
    it(`shows only ${type} tokens, when type filter is "${type}"`, async function () {
      await render(hbs `{{sidebar-tokens model=model}}`);

      await click(`.btn-${type}`);
      const renderedTokens = findAll('.token-item');
      expect(renderedTokens).to.have.length(count);
      renderedTokens.forEach((element) => {
        expect(element).to.contain.text(type);
      });
    });
  });

  it(
    'shows only cluster invite tokens, when type filter is "invite" and target filter is "cluster - all"',
    async function () {
      await render(hbs `{{sidebar-tokens model=model}}`);

      await click('.btn-invite');
      await selectChoose('.target-model-filter', 'Cluster');
      const renderedTokens = findAll('.token-item');
      expect(renderedTokens).to.have.length(2);
      renderedTokens.forEach((element) => {
        expect(element).to.contain.text('invite');
        expect(element).to.contain.text('cluster');
      });
    }
  );

  it(
    'shows only cluster invite tokens, when type filter is "invite" and target filter is "cluster - cluster1"',
    async function () {
      await render(hbs `{{sidebar-tokens model=model}}`);

      await click('.btn-invite');
      await selectChoose('.target-model-filter', 'Cluster');
      await selectChoose('.target-record-filter', 'cluster1');
      const renderedTokens = findAll('.token-item');
      expect(renderedTokens).to.have.length(1);
      expect(renderedTokens[0]).to.contain.text('invite');
      expect(renderedTokens[0]).to.contain.text('cluster1');
    }
  );

  it(
    'does not take "invite" dedicated filters into account after change from "invite" to "access" filter',
    async function () {
      await render(hbs`{{sidebar-tokens model=model}}`);

      await click('.btn-invite');
      await selectChoose('.target-model-filter', 'Cluster');
      await selectChoose('.target-record-filter', 'cluster1');
      await click('.btn-access');
      const renderedTokens = findAll('.token-item');
      expect(renderedTokens).to.have.length(2);
      renderedTokens.forEach((element) => {
        expect(element).to.contain.text('access');
      });
    }
  );
});

function createTokenRecord(store, data = {}) {
  return store.createRecord('token', data);
}
