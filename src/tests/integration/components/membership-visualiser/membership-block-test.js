import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

const icons = {
  user: 'user',
  group: 'groups',
  space: 'space',
  provider: 'provider',
};

describe(
  'Integration | Component | membership visualiser/membership block',
  function () {
    setupComponentTest('membership-visualiser/membership-block', {
      integration: true,
    });

    it('renders record name', function () {
      const testName = 'testName';
      this.set('record', EmberObject.create({
        entityType: 'group',
        name: testName,
      }));
      this.render(hbs `{{membership-visualiser/membership-block record=record}}`);
      expect(this.$('.record-name').text().trim()).to.be.equal(testName);
    });

    Object.keys(icons).forEach(modelType => {
      it(`renders icon for ${modelType}`, function () {
        this.set('record', EmberObject.create({
          entityType: modelType,
        }));
        this.render(hbs `{{membership-visualiser/membership-block record=record}}`);
        expect(this.$(`.oneicon-${icons[modelType]}`)).to.exist;
      });
    });
  }
);
