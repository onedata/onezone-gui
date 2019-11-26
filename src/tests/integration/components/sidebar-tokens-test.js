import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { get } from '@ember/object';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';

class TargetModelHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.target-model-filter');
  }
}

class TargetRecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.target-record-filter');
  }
}

describe('Integration | Component | sidebar tokens', function () {
  setupComponentTest('sidebar-tokens', {
    integration: true,
  });

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
      tokensOrder: [1, 2, 0, 4, 3],
    });
  });

  it('renders all tokens', function () {
    const tokens = this.get('model.collection.list');

    this.render(hbs `{{sidebar-tokens model=model}}`);

    const renderedTokens = this.$('.token-item');
    expect(renderedTokens).to.have.length(tokens.length);
  });

  it('renders tokens in correct order', function () {
    const tokens = this.get('model.collection.list');
    const tokensOrder = this.get('tokensOrder');

    this.render(hbs `{{sidebar-tokens model=model}}`);

    this.$('.token-item').each((index, element) => {
      const originIndex = tokensOrder[index];
      expect($(element).find('.token-name'))
        .to.contain(get(tokens[originIndex], 'name'));
    });
  });

  it('shows advanced token filters', function () {
    this.render(hbs `{{sidebar-tokens model=model}}`);

    expect(this.$('.advanced-filters-collapse.in .advanced-token-filters'))
      .to.exist;
  });

  [{
    type: 'access',
    count: 2,
  }, {
    type: 'invite',
    count: 3,
  }].forEach(({ type, count }) => {
    it(`shows only ${type} tokens, when type filter is "${type}"`, function () {
      this.render(hbs `{{sidebar-tokens model=model}}`);

      return click(`.btn-${type}`)
        .then(() => {
          const renderedTokens = this.$('.token-item');
          expect(renderedTokens).to.have.length(count);
          renderedTokens.each((i, element) => {
            expect($(element).text()).to.contain(type);
          });
        });
    });
  });

  it(
    'shows only cluster invite tokens, when target filter is "cluster - all"',
    function () {
      this.render(hbs `{{sidebar-tokens model=model}}`);

      const targetModelHelper = new TargetModelHelper();
      return click('.btn-invite')
        .then(() => targetModelHelper.selectOption(2))
        .then(() => {
          const renderedTokens = this.$('.token-item');
          expect(renderedTokens).to.have.length(2);
          renderedTokens.each((i, element) => {
            expect($(element).text()).to.contain('invite');
            expect($(element).text()).to.contain('cluster');
          });
        });
    }
  );

  it(
    'shows only cluster invite tokens, when target filter is "cluster - cluster1"',
    function () {
      this.render(hbs `{{sidebar-tokens model=model}}`);

      const targetModelHelper = new TargetModelHelper();
      const targetRecordHelper = new TargetRecordHelper();
      return click('.btn-invite')
        .then(() => targetModelHelper.selectOption(2))
        .then(() => targetRecordHelper.selectOption(2))
        .then(() => {
          const renderedTokens = this.$('.token-item');
          expect(renderedTokens).to.have.length(1);
          expect(renderedTokens.text()).to.contain('invite');
          expect(renderedTokens.text()).to.contain('cluster1');
        });
    }
  );

  it(
    'does not take "invite" dedicated filters into account after change from "invite" to "access" filter',
    function () {
      this.render(hbs `{{sidebar-tokens model=model}}`);

      const targetModelHelper = new TargetModelHelper();
      const targetRecordHelper = new TargetRecordHelper();
      return click('.btn-invite')
        .then(() => targetModelHelper.selectOption(2))
        .then(() => targetRecordHelper.selectOption(2))
        .then(() => click('.btn-access'))
        .then(() => {
          const renderedTokens = this.$('.token-item');
          expect(renderedTokens).to.have.length(2);
          renderedTokens.each((i, element) => {
            expect($(element).text()).to.contain('access');
          });
        });
    }
  );
});
