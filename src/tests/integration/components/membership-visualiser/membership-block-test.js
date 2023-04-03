import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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
  'Integration | Component | membership-visualiser/membership-block',
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
      expect(find('.record-name')).to.have.trimmed.text(testName);
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
        expect(find(`.oneicon-${icons[modelType]}`)).to.exist;
      });
    });
  }
);
