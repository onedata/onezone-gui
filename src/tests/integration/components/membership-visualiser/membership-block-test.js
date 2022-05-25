import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

const icons = {
  user: 'user',
  group: 'team',
  space: 'space',
  provider: 'provider',
  cluster: 'cluster',
  harvester: 'light-bulb',
  atmInventory: 'atm-inventory',
};

describe(
  'Integration | Component | membership visualiser/membership block',
  function () {
    setupRenderingTest();

    it('renders record name', async function () {
      const testName = 'testName';
      this.set('record', EmberObject.create({
        constructor: {
          modelName: 'group',
        },
        name: testName,
      }));
      await render(hbs `{{membership-visualiser/membership-block record=record}}`);
      expect(this.$('.record-name').text().trim()).to.be.equal(testName);
    });

    Object.keys(icons).forEach(modelType => {
      it(`renders icon for ${modelType}`, async function () {
        this.set('record', EmberObject.create({
          constructor: {
            modelName: modelType,
          },
          type: 'team',
        }));
        await render(hbs `
          {{membership-visualiser/membership-block record=record}}
        `);
        expect(this.$(`.oneicon-${icons[modelType]}`)).to.exist;
      });
    });
  }
);
