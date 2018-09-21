import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { set } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import $ from 'jquery';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService } from '../../../helpers/stub-service';

describe(
  'Integration | Component | groups hierarchy visualiser/group box line',
  function () {
    setupComponentTest('groups-hierarchy-visualiser/group-box-line', {
      integration: true,
    });

    beforeEach(function beforeEach() {
      registerService(this, 'i18n', I18nStub);
    });

    it('renders line in proper position', function () {
      const line = EmberObject.create({
        x: 100,
        y: 200,
        length: 50,
      });

      this.set('line', line);
      this.render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);

      const $line = this.$('.group-box-line');
      expect($line.css('top')).to.be.equal('200px');
      expect($line.css('left')).to.be.equal('100px');
      expect($line.css('width')).to.be.equal('50px');
    });

    it('renders actions on demand', function (done) {
      const line = EmberObject.create({
        x: 100,
        y: 100,
        length: 100,
        actionsEnabled: true,
        hovered: false,
        relation: {
          parent: {
            canViewPrivileges: true,
          },
        },
      });

      this.set('line', line);
      this.render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);
      const $line = this.$('.group-box-line');
      expect($line.find('.actions-trigger')).to.not.exist;
      set(line, 'hovered', true);
      wait().then(() => {
        const $actionsTrigger = $line.find('.actions-trigger');
        expect($actionsTrigger).to.exist;
        expect($('body .webui-popover')).to.not.exist;
        click($actionsTrigger[0]).then(() => {
          expect($('body .webui-popover.in')).to.exist;
          done();
        });
      });
    });

    it('does not render actions if actionsEnabled is false', function () {
      const line = EmberObject.create({
        x: 100,
        y: 100,
        length: 100,
        actionsEnabled: false,
        hovered: true,
      });

      this.set('line', line);
      this.render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);
      expect(this.$('.group-box-line .actions-trigger')).to.not.exist;
    });

    it(
      'does not show "modify privileges" action if canViewPrivileges is false',
      function () {
        const line = EmberObject.create({
          x: 100,
          y: 100,
          length: 100,
          actionsEnabled: true,
          hovered: true,
          relation: {
            parent: {
              canViewPrivileges: false,
            },
          },
        });

        this.set('line', line);
        this.render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);
        return click(this.$('.group-box-line .actions-trigger')[0]).then(() => {
          const $popover = $('body .webui-popover.in');
          expect($popover.find('.modify-privileges-action')).to.not.exist;
        });
      }
    );

    it('closes actions popover after action click', function (done) {
      const line = EmberObject.create({
        x: 100,
        y: 100,
        length: 100,
        actionsEnabled: true,
        hovered: true,
        relation: {
          parent: {
            canViewPrivileges: true,
          },
        },
      });

      this.set('line', line);
      this.set('dummyCallback', () => {});
      this.render(hbs `
        {{groups-hierarchy-visualiser/group-box-line
          line=line
          modifyPrivileges=dummyCallback}}
      `);
      click(this.$('.group-box-line .actions-trigger')[0]).then(() => {
        const $popover = $('body .webui-popover.in');
        click($popover.find('.modify-privileges-action')[0]).then(() => {
          expect($popover).to.not.have.class('in');
          done();
        });
      });
    });
  }
);
