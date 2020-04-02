import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject, Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import suppressRejections from '../../helpers/suppress-rejections';
import { click } from 'ember-native-dom-helpers';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import RemoveHarvesterFromSpaceAction from 'onezone-gui/utils/space-actions/remove-harvester-from-space-action';

describe('Integration | Component | content spaces harvesters', function () {
  setupComponentTest('content-spaces-harvesters', {
    integration: true,
  });

  suppressRejections();

  beforeEach(function () {
    this.set('space', {
      name: 'space1',
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

  it('performs removing harvester from space', function () {
    this.render(hbs `{{content-spaces-harvesters space=space}}`);

    const executeSpy = sinon.spy();
    sinon.stub(
      lookupService(this, 'space-actions'),
      'createRemoveHarvesterFromSpaceAction'
    ).callsFake(context =>
      RemoveHarvesterFromSpaceAction.create({
        ownerSource: this,
        execute() {
          executeSpy(context.space, context.harvester);
        },
      })
    );

    return wait()
      .then(() => click(this.$('.resource-item:first-child .btn-menu-toggle')[0]))
      .then(() => click(document.querySelector('.remove-harvester-from-space-trigger')))
      .then(() => {
        expect(executeSpy).to.be.calledOnce;
        expect(executeSpy).to.be.calledWith(
          sinon.match({ name: 'space1' }),
          sinon.match({ name: 'harvester1' })
        );
      });
  });
});
