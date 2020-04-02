import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject, Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import suppressRejections from '../../helpers/suppress-rejections';

describe('Integration | Component | content spaces harvesters', function () {
  setupComponentTest('content-spaces-harvesters', {
    integration: true,
  });

  suppressRejections();

  beforeEach(function () {
    this.set('space', {
      harvesterList: promiseObject(resolve({
        list: promiseArray(resolve([{
          name: 'harvester1',
        }, {
          name: 'harvester2',
        }])),
      })),
    });
  });

  it('has class "content-spaces-harvesters"', function () {
    this.render(hbs `{{content-spaces-harvesters}}`);

    expect(this.$('.content-spaces-harvesters')).to.exist;
  });

  it('shows spinner when harvesters are being loaded', function () {
    this.set('space.harvesterList', promiseObject(new Promise(() => {})));

    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    return wait()
      .then(() => {
        expect(this.$('.spinner')).to.exist;
        expect(this.$('.resources-list')).to.not.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
      });
  });

  it('shows error when harvesters cannot be loaded', function () {
    this.set('space.harvesterList', promiseObject(reject('someError')));

    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    return wait()
      .then(() => {
        expect(this.$('.spinner')).to.not.exist;
        expect(this.$('.resources-list')).to.not.exist;
        const $loadError = this.$('.resource-load-error');
        expect($loadError).to.exist;
        expect($loadError.text()).to.contain('someError');
      });
  });

  it('shows list of space harvesters', function () {
    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    return wait()
      .then(() => {
        expect(this.$('.spinner')).to.not.exist;
        expect(this.$('.resource-load-error')).to.not.exist;
        const $harvesterItems = this.$('.resource-item');
        expect($harvesterItems).to.have.length(2);
        expect($harvesterItems.find('.oneicon-light-bulb')).to.exist;
        expect($harvesterItems.eq(0).text()).to.contain('harvester1');
        expect($harvesterItems.eq(1).text()).to.contain('harvester2');
      });
  });
});
