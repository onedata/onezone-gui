import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { get, set } from '@ember/object';
import { triggerEvent } from 'ember-native-dom-helpers';
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
    setupComponentTest('groups-hierarchy-visualiser/group-box-relation', {
      integration: true,
    });

    beforeEach(function beforeEach() {
      registerService(this, 'i18n', I18nStub);
      registerService(this, 'global-notify', GlobalNotifyStub);
      set(lookupService(this, 'global-notify'), 'spy', sinon.spy());
    });

    it('renders information about insufficient privileges', function () {
      const group = EmberObject.create({
        hasViewPrivilege: false,
      });

      this.set('group', group);
      this.render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          group=group}}
      `);
      const $relation = this.$('.group-box-relation');
      expect($relation).to.have.class('no-view');
      expect($relation.find('.oneicon-no-view')).to.exist;
    });

    it('shows spinner when loading relation', function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isPending: true,
        }),
      });

      this.set('group', group);
      this.render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      const $relation = this.$('.group-box-relation');
      expect($relation).to.have.class('loading');
      expect($relation.find('.spinner')).to.exist;
    });

    it('shows error icon on error', function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isRejected: true,
        }),
      });

      this.set('group', group);
      this.render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      const $relation = this.$('.group-box-relation');
      expect($relation).to.have.class('error');
      expect($relation.find('.oneicon-ban-left')).to.exist;
    });

    it('shows error details on double click', function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isRejected: true,
          reason: 'error',
        }),
      });

      this.set('group', group);
      this.render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      return triggerEvent('.group-box-relation', 'dblclick').then(() => {
        const notifySpy = get(lookupService(this, 'global-notify'), 'spy');
        expect(notifySpy).to.be.calledOnce;
        expect(notifySpy.args[0][1]).to.equal('error');
      });
    });

    it('shows children relation', function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        childList: EmberObject.create({
          isFulfilled: true,
          length: 5,
        }),
      });

      this.set('group', group);
      this.render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="children"
          group=group}}
      `);
      const $relation = this.$('.group-box-relation');
      expect($relation).to.have.class('loaded');
      expect($relation.find('.oneicon-arrow-right')).to.exist;
      expect($relation.find('.relations-number').text()).to.equal('5');
    });

    it('shows parents relation', function () {
      const group = EmberObject.create({
        hasViewPrivilege: true,
        parentList: EmberObject.create({
          isFulfilled: true,
          length: 5,
        }),
      });

      this.set('group', group);
      this.render(hbs `
        {{groups-hierarchy-visualiser/group-box-relation
          relationType="parents"
          group=group}}
      `);
      const $relation = this.$('.group-box-relation');
      expect($relation).to.have.class('loaded');
      expect($relation.find('.oneicon-arrow-left')).to.exist;
      expect($relation.find('.relations-number').text()).to.equal('5');
    });
  }
);
