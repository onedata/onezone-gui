import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { get } from '@ember/object';
import { selectChoose } from 'ember-power-select/test-support/helpers';

describe('Integration | Component | sidebar tokens', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      model: {
        collection: {
          list: [{
            name: 'invite token 2',
            typeName: 'invite',
            isActive: true,
          }, {
            name: 'access token',
            typeName: 'access',
            isActive: true,
          }, {
            name: 'identity token',
            typeName: 'identity',
            isActive: true,
          }, {
            name: 'invite token 1 cluster cluster1',
            typeName: 'invite',
            isActive: true,
            targetModelName: 'cluster',
            tokenTarget: {
              name: 'cluster1',
            },
          }, {
            name: 'invite disabled cluster unknown',
            typeName: 'invite',
            isActive: false,
            targetModelName: 'cluster',
          }, {
            name: 'access disabled',
            typeName: 'access',
            isActive: false,
          }],
        },
      },
      tokensOrder: [1, 2, 3, 0, 5, 4],
    });
  });

  it('renders all tokens', async function () {
    const tokens = this.get('model.collection.list');

    await render(hbs `{{sidebar-tokens model=model}}`);

    const renderedTokens = findAll('.token-item');
    expect(renderedTokens).to.have.length(tokens.length);
  });

  it('renders tokens in correct order', async function () {
    const tokens = this.get('model.collection.list');
    const tokensOrder = this.get('tokensOrder');

    await render(hbs `{{sidebar-tokens model=model}}`);

    findAll('.token-item').forEach((element, index) => {
      const originIndex = tokensOrder[index];
      expect(element.querySelector('.token-name'))
        .to.contain.text(get(tokens[originIndex], 'name'));
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
