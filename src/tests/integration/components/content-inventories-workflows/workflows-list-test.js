import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn } from 'ember-native-dom-helpers';

describe('Integration | Component | content inventories workflows/workflows list',
  function () {
    setupComponentTest('content-inventories-workflows/workflows-list', {
      integration: true,
    });

    beforeEach(function () {
      this.set('collection', [{
        name: 'w1',
        description: 'w1 description',
      }, {
        name: 'w0',
        description: 'w0 description',
      }]);
    });

    it('has class "workflows-list"', function () {
      this.render(hbs `{{content-inventories-workflows/workflows-list}}`);

      expect(this.$().children()).to.have.class('workflows-list')
        .and.to.have.length(1);
    });

    it('shows list of workflows entries', async function () {
      await render(this);

      const $workflows = this.$('.workflows-list-entry');
      expect($workflows).to.have.length(2);
      [0, 1].forEach(idx => {
        expect($workflows.eq(idx).find('.name-field').text().trim()).to.equal(`w${idx}`);
        expect($workflows.eq(idx).find('.description-field').text().trim())
          .to.equal(`w${idx} description`);
      });
    });

    it('does not show description when workflow does not have any', async function () {
      this.get('collection').setEach('description', '');

      await render(this);

      expect(this.$('.description')).to.not.exist;
    });

    it('has empty search input on init', async function () {
      await render(this);

      expect(this.$('.search-bar')).to.have.value('');
    });

    it('filters workflows by name when search input is not empty', async function () {
      await render(this);

      await fillIn('.search-bar', 'w1');

      const $workflows = this.$('.workflows-list-entry');
      expect($workflows).to.have.length(1);
      expect($workflows.text()).to.contain('w1');
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-inventories-workflows/workflows-list
    collection=collection
  }}`);
  await wait();
}
