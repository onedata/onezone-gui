import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject, { get, set } from '@ember/object';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService, lookupService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';

const GlobalNotifyStub = Service.extend({
  spy: undefined,
  backendError() {
    this.get('spy')(...arguments);
  },
});

describe(
  'Integration | Component | groups hierarchy visualiser/group box relation',
  function () {
    setupRenderingTest();

    beforeEach(function beforeEach() {
      registerService(this, 'i18n', I18nStub);
      registerService(this, 'global-notify', GlobalNotifyStub);
      set(lookupService(this, 'global-notify'), 'spy', sinon.spy());
    });

    it('renders information about insufficient privileges', async function () {
      const group = EmberObject.create({
        hasViewPrivilege: false,
      });

      this.set('group', group);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          group=group}}
      `);
      const relation = find('.group-box-relation');
      expect(relation).to.have.class('no-view');
      expect(relation).to.contain('.oneicon-no-view');
    });

    it('shows spinner when loading relation', async function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isPending: true,
        }),
      });

      this.set('group', group);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      const relation = find('.group-box-relation');
      expect(relation).to.have.class('loading');
      expect(relation).to.contain('.spinner');
    });

    it('shows error icon on error', async function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isRejected: true,
        }),
      });

      this.set('group', group);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      const relation = find('.group-box-relation');
      expect(relation).to.have.class('error');
      expect(relation).to.contain('.oneicon-ban-left');
    });

    it('shows error details on double click', async function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isRejected: true,
          reason: 'error',
        }),
      });

      this.set('group', group);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      await triggerEvent('.group-box-relation', 'dblclick');
      const notifySpy = get(lookupService(this, 'global-notify'), 'spy');
      expect(notifySpy).to.be.calledOnce;
      expect(notifySpy.args[0][1]).to.equal('error');
    });

    it('shows children relation', async function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isFulfilled: true,
          length: 5,
        }),
      });

      this.set('group', group);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      const relation = find('.group-box-relation');
      expect(relation).to.have.class('loaded');
      expect(relation).to.contain('.oneicon-arrow-right');
      expect(relation.querySelector('.relations-number')).to.have.trimmed.text('5');
    });

    it('shows parents relation', async function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        parentList: EmberObject.create({
          isFulfilled: true,
          length: 5,
        }),
      });

      this.set('group', group);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="parents"
          group=group}}
      `);
      const relation = find('.group-box-relation');
      expect(relation).to.have.class('loaded');
      expect(relation).to.contain('.oneicon-arrow-left');
      expect(relation.querySelector('.relations-number')).to.have.trimmed.text('5');
    });
  }
);
