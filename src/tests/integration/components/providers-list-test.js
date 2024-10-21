import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import _ from 'lodash';
import { all as allFulfilled } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';
import { lookupService } from '../../helpers/stub-service';
import clearStore from '../../helpers/clear-store';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as providerEntityType } from 'onezone-gui/models/provider';

describe('Integration | Component | providers-list', function () {
  const { beforeEach, afterEach } = setupRenderingTest();

  beforeEach(async function () {
    const store = lookupService(this, 'store');

    const space1 = store.createRecord('space', {
      name: 'space1',
      supportSizes: {
        1: 2097152,
        2: 1048576,
        3: 1048576,
      },
    });
    const space2 = store.createRecord('space', {
      name: 'space2',
      supportSizes: {
        1: 1048576,
        2: 2097152,
        3: 1048576,
      },
    });

    const spaces = await allFulfilled([space1.save(), space2.save()]);

    const spaceList = store.createRecord('space-list', {
      list: spaces,
    });

    await spaceList.save();

    const providers = [1, 2, 3].map(number => {
      return createProviderRecord(store, String(number), {
        name: `provider${number}`,
        spaceList,
      });
    });

    await allFulfilled(providers.map(provider => provider.save()));

    this.setProperties({
      providersData: A([{
          provider: providers[0],
          color: 'red',
        },
        {
          provider: providers[1],
          color: 'green',
        },
        {
          provider: providers[2],
          color: 'yellow',
        },
      ]),
      selectedSpace: spaces[0],
    });
  });

  afterEach(function afterEach() {
    clearStore();
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

function createProviderRecord(store, entityId, data = {}) {
  return store.createRecord('provider', {
    id: gri({
      entityType: providerEntityType,
      entityId,
      aspect: 'instance',
    }),
    ...data,
  });
}
