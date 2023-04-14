import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject, { set } from '@ember/object';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService } from '../../../helpers/stub-service';
import globals from 'onedata-gui-common/utils/globals';

describe(
  'Integration | Component | groups-hierarchy-visualiser/group-box-line',
  function () {
    setupRenderingTest();

    beforeEach(function beforeEach() {
      registerService(this, 'i18n', I18nStub);
    });

    it('renders line in proper position', async function () {
      const line = EmberObject.create({
        x: 100,
        y: 200,
        length: 50,
      });

      this.set('line', line);
      await render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);

      const lineElem = find('.group-box-line');
      expect(lineElem.style.top).to.be.equal('200px');
      expect(lineElem.style.left).to.be.equal('100px');
      expect(lineElem.style.width).to.be.equal('50px');
    });

    it('renders actions on demand', async function () {
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
      await render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);
      const lineElem = find('.group-box-line');
      expect(lineElem.querySelector('.actions-trigger')).to.not.exist;
      set(line, 'hovered', true);
      await settled();
      const actionsTrigger = lineElem.querySelector('.actions-trigger');
      expect(actionsTrigger).to.exist;
      expect(globals.document.querySelector('.webui-popover')).to.not.exist;
      await click(actionsTrigger);
      expect(globals.document.querySelector('.webui-popover.in')).to.exist;
    });

    it('does not render actions if actionsEnabled is false', async function () {
      const line = EmberObject.create({
        x: 100,
        y: 100,
        length: 100,
        actionsEnabled: false,
        hovered: true,
      });

      this.set('line', line);
      await render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);
      expect(find('.group-box-line .actions-trigger')).to.not.exist;
    });

    it(
      'disables "modify privileges" action if canViewPrivileges is false',
      async function () {
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
        await render(hbs `{{groups-hierarchy-visualiser/group-box-line line=line}}`);
        await click(find('.group-box-line .actions-trigger'));
        const popover = globals.document.querySelector('.webui-popover.in');
        expect(popover.querySelector('.disabled > .modify-privileges-action')).to.exist;
      }
    );

    it('closes actions popover after action click', async function () {
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
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box-line
          line=line
          modifyPrivileges=dummyCallback}}
      `);
      await click(find('.group-box-line .actions-trigger'));
      const popover = globals.document.querySelector('.webui-popover.in');
      await click(popover.querySelector('.modify-privileges-action'));
      expect(popover).to.not.have.class('in');
    });
  }
);
