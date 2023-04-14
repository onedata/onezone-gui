import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | providers-list', function () {
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

    const list = find('.one-collapsible-list');
    expect(list.children).to.have.length(4);
    const firstItem = list.children[1];
    expect(firstItem).to.be.displayed;
    expect(firstItem).to.contain.text('provider1');
  });

  it('sets icon colors according to provider object setting', async function () {
    await render(hbs `{{providers-list providersData=providersData}}`);

    const firstItemIcon =
      find('.one-collapsible-list-item:nth-child(2) .one-icon');
    expect(firstItemIcon.getAttribute('style'))
      .to.contain(this.get('providersData')[0].color);
  });

  it('triggers providers filter state changed action on init', async function () {
    const providersFilterSpy = sinon.spy();
    this.set('providersFilter', providersFilterSpy);

    await render(hbs `{{providers-list
      providersData=providersData
      providersFilterAction=(action providersFilter)
    }}`);
    expect(providersFilterSpy).to.be.calledOnce;
    expect(providersFilterSpy).to.be.calledWith(
      sinon.match.array.deepEquals(
        _.map(this.get('providersData'), 'provider')
      )
    );
  });

  it('triggers providers filter state changed action after query input',
    async function () {
      const providersFilterSpy = sinon.spy();
      this.set('providersFilter', providersFilterSpy);

      await render(hbs `{{providers-list
        providersData=providersData
        providersFilterAction=(action providersFilter)
      }}`);

      await fillIn('.search-bar', '1');
      expect(providersFilterSpy).to.be.calledTwice;
      expect(providersFilterSpy).to.be.calledWith(
        sinon.match.array.deepEquals([this.get('providersData')[0].provider])
      );
    }
  );

  it('handles with custom provider actions', async function () {
    const actionSpy = sinon.spy();
    this.set('actions', [{
      text: 'Action',
      action: actionSpy,
      class: 'action-trigger',
    }]);

    await render(hbs `{{providers-list
      providersData=providersData
      providerActions=actions
    }}`);
    await click('.one-collapsible-list-item:nth-child(2) .provider-menu-toggle');
    await click(globals.document.querySelector('.webui-popover.in .action-trigger'));
    expect(actionSpy).to.be.calledOnce;
    expect(actionSpy).to.be.calledWith(this.get('providersData')[0].provider);
  });

  it('shows information about supported spaces', async function () {
    await render(hbs `{{providers-list
      providersData=providersData
      selectedSpace=selectedSpace
    }}`);

    const firstProviderItem = find(
      '.one-collapsible-list-item:nth-child(2)'
    );
    expect(firstProviderItem.querySelector('.supported-spaces'))
      .to.contain.text('2');
    expect(firstProviderItem.querySelector('.space-support-size'))
      .to.contain.text('2 MiB');
  });
});
