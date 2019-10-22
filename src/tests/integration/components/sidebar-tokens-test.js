import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { get } from '@ember/object';
import $ from 'jquery';

describe('Integration | Component | sidebar tokens', function() {
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
            name: 'invite token 1',
            typeName: 'invite',
            isActive: true,
          }, {
            name: 'invite disabled',
            typeName: 'invite',
            isActive: false,
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

    this.render(hbs`{{sidebar-tokens model=model}}`);
    
    const renderedTokens = this.$('.token-item');
    expect(renderedTokens).to.have.length(tokens.length);
  });

  it('renders tokens in correct order', function () {
    const tokens = this.get('model.collection.list');
    const tokensOrder = this.get('tokensOrder');

    this.render(hbs`{{sidebar-tokens model=model}}`);

    this.$('.token-item').each((index, element) => {
      const originIndex = tokensOrder[index];
      expect($(element).find('.token-name')).to.contain(get(tokens[originIndex], 'name'));
    });
  });
});
