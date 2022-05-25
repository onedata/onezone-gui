import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import _ from 'lodash';
import $ from 'jquery';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';

describe('Integration | Component | providers list', function () {
  setupRenderingTest();

  beforeEach(function () {
    const spaces = A([{
      name: 'space1',
      supportSizes: {
        1: 2097152,
        2: 1048576,
        3: 1048576,
      },
    }, {
      name: 'space2',
      supportSizes: {
        1: 1048576,
        2: 2097152,
        3: 1048576,
      },
    }]);
    const spaceList = PromiseObject.create({
      promise: Promise.resolve({
        list: spaces,
      }),
    });
    this.setProperties({
      providersData: A([{
          provider: {
            entityId: '1',
            name: 'provider1',
            spaceList,
          },
          color: 'red',
        },
        {
          provider: {
            entityId: '1',
            name: 'provider2',
            spaceList,
          },
          color: 'green',
        },
        {
          provider: {
            entityId: '1',
            name: 'provider3',
            spaceList,
          },
          color: 'yellow',
        },
      ]),
      selectedSpace: spaces[0],
    });
  });

  it('renders list of providers', async function () {
    await render(hbs `{{providers-list providersData=providersData}}`);

    const list = this.$('.one-collapsible-list');
    expect(list.children()).to.have.length(4);
    const firstItem = $(list.children()[1]);
    expect(firstItem).to.be.visible;
    expect(firstItem).to.contain('provider1');
  });

  it('sets icon colors according to provider object setting', async function () {
    await render(hbs `{{providers-list providersData=providersData}}`);

    const firstItemIcon =
      this.$('.one-collapsible-list-item:nth-child(2) .one-icon');
    expect(firstItemIcon.attr('style'))
      .to.contain(this.get('providersData')[0].color);
  });

  it('triggers providers filter state changed action on init', async function () {
    const providersFilterSpy = sinon.spy();
    this.set('providersFilter', providersFilterSpy);

    await render(hbs `
        {{providers-list
          providersData=providersData
          providersFilterAction=(action providersFilter)}}
      `);
    return wait().then(() => {
      expect(providersFilterSpy).to.be.calledOnce;
      expect(providersFilterSpy).to.be.calledWith(
        sinon.match.array.deepEquals(
          _.map(this.get('providersData'), 'provider')
        )
      );
    });
  });

  it('triggers providers filter state changed action after query input',
    async function (done) {
      const providersFilterSpy = sinon.spy();
      this.set('providersFilter', providersFilterSpy);

      await render(hbs `
            {{providers-list
              providersData=providersData
              providersFilterAction=(action providersFilter)}}
          `);
      wait().then(() => {
        fillIn('.search-bar', '1').then(() => {
          expect(providersFilterSpy).to.be.calledTwice;
          expect(providersFilterSpy).to.be.calledWith(
            sinon.match.array.deepEquals([this.get('providersData')[0].provider])
          );
          done();
        });
      });
    }
  );

  it('handles with custom provider actions', async function (done) {
    const actionSpy = sinon.spy();
    this.set('actions', [{
      text: 'Action',
      action: actionSpy,
      class: 'action-trigger',
    }]);

    await render(hbs `
            {{providers-list
              providersData=providersData
              providerActions=actions}}
          `);
    click('.one-collapsible-list-item:nth-child(2) .provider-menu-toggle').then(() => {
      click($('.webui-popover.in .action-trigger')[0]).then(() => {
        expect(actionSpy).to.be.calledOnce;
        expect(actionSpy).to.be.calledWith(this.get('providersData')[0].provider);
        done();
      });
    });
  });

  it('shows information about supported spaces', async function () {
    await render(hbs `
              {{providers-list
                providersData=providersData
                selectedSpace=selectedSpace
              }}
            `);
    return wait().then(() => {
      const firstProviderItem = this.$(
        '.one-collapsible-list-item:nth-child(2)'
      );
      expect(firstProviderItem.find('.supported-spaces')).to.contain('2');
      expect(firstProviderItem.find('.space-support-size')).to.contain('2 MiB');
    });

  });
});
