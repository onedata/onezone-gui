import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject, { set } from '@ember/object';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService } from '../../../helpers/stub-service';
import { resolve } from 'rsvp';

describe(
  'Integration | Component | groups hierarchy visualiser/group box',
  function () {
    setupRenderingTest();

    beforeEach(function beforeEach() {
      registerService(this, 'i18n', I18nStub);
    });

    it('shows group name', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
        }),
      });

      this.set('groupBox', groupBox);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
      `);
      expect(find('.group-box .group-name')).to.have.trimmed.text('testname');
    });

    it('allows to edit group name', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
          isEffectiveMember: true,
        }),
      });

      this.set('groupBox', groupBox);
      this.set('renameGroup', (newName) => {
        set(groupBox, 'group.name', newName);
        return resolve();
      });
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box
          groupBox=groupBox
          renameGroup=(action renameGroup)}}
      `);

      const groupBoxElem = find('.group-box');
      await click(groupBoxElem.querySelector('.group-actions-trigger'));
      await click(document.querySelector('.webui-popover.in .rename-group-action'));
      const editor = groupBoxElem.querySelector('.one-inline-editor');
      expect(editor).to.exist;
      await fillIn(editor.querySelector('input'), 'newname');
      await click(groupBoxElem.querySelector('.save-icon'));
      expect(groupBoxElem.querySelector('.group-name')).to.have.trimmed.text('newname');
    });

    it('shows lines', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
        }),
        leftLine: EmberObject.create({
          isVisible: true,
        }),
        rightLine: EmberObject.create({
          isVisible: true,
        }),
      });

      this.set('groupBox', groupBox);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
      `);
      expect(findAll('.group-box-line')).to.have.length(2);
    });

    it('hides lines', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
        }),
        leftLine: EmberObject.create({
          isVisible: false,
        }),
        rightLine: EmberObject.create({
          isVisible: false,
        }),
      });

      this.set('groupBox', groupBox);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
      `);
      expect(find('.group-box-line')).to.not.exist;
    });

    it('shows relations', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
          hasViewPrivilege: true,
          childList: EmberObject.create({
            isFulfilled: true,
            length: 2,
          }),
          parentList: EmberObject.create({
            isFulfilled: true,
            length: 3,
          }),
        }),
      });

      this.set('groupBox', groupBox);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
      `);
      expect(find('.group-box-relation.children .relations-number'))
        .to.have.trimmed.text('2');
      expect(find('.group-box-relation.parents .relations-number'))
        .to.have.trimmed.text('3');
    });

    it('shows direct membership icon', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
          directMembership: true,
        }),
      });

      this.set('groupBox', groupBox);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
      `);
      expect(find('.direct-membership-icon')).to.exist;
    });

    it('hides direct membership icon', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
          directMembership: false,
        }),
      });

      this.set('groupBox', groupBox);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
      `);
      expect(find('.direct-membership-icon')).to.not.exist;
    });

    it(
      'shows "join" instead of "leave" action if directMembership is false',
      async function () {
        const groupBox = EmberObject.create({
          group: EmberObject.create({
            name: 'testname',
            isEffectiveMember: true,
            directMembership: false,
          }),
        });

        this.set('groupBox', groupBox);
        await render(hbs `
          {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
        `);

        const groupBoxElem = find('.group-box');
        await click(groupBoxElem.querySelector('.group-actions-trigger'));
        expect(document.querySelector('.webui-popover.in .leave-group-action'))
          .to.not.exist;
        expect(document.querySelector('.webui-popover.in .join-group-action'))
          .to.exist;
      }
    );

    it(
      'shows "leave" instead of "join" action if directMembership is true',
      async function () {
        const groupBox = EmberObject.create({
          group: EmberObject.create({
            name: 'testname',
            isEffectiveMember: true,
            directMembership: true,
          }),
        });

        this.set('groupBox', groupBox);
        await render(hbs `
          {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
        `);

        const groupBoxElem = find('.group-box');
        await click(groupBoxElem.querySelector('.group-actions-trigger'));
        expect(document.querySelector('.webui-popover.in .leave-group-action'))
          .to.exist;
        expect(document.querySelector('.webui-popover.in .join-group-action'))
          .to.not.exist;
      }
    );

    it(
      'does not show actions trigger for groups with membership == false',
      async function () {
        const groupBox = EmberObject.create({
          group: EmberObject.create({
            name: 'testname',
            isEffectiveMember: false,
          }),
        });

        this.set('groupBox', groupBox);
        await render(hbs `
          {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
        `);
        expect(find('.group-box .group-actions-trigger')).to.not.exist;
      }
    );

    it('closes actions popover after action click', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
          isEffectiveMember: true,
          directMembership: true,
        }),
      });

      this.set('groupBox', groupBox);
      this.set('leaveGroup', () => {});
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box
          groupBox=groupBox
          leaveGroup=(action leaveGroup)}}
      `);
      await click(find('.group-box .group-actions-trigger'));
      const popover = document.querySelector('.webui-popover.in');
      await click(popover.querySelector('.leave-group-action'));
      expect(popover).to.not.have.class('in');
    });

    it('renders box in proper position', async function () {
      const groupBox = EmberObject.create({
        group: EmberObject.create({
          name: 'testname',
        }),
        x: 1,
        y: 2,
        width: 100,
        marginBottom: 3,
      });

      this.set('groupBox', groupBox);
      await render(hbs `
        {{groups-hierarchy-visualiser/group-box groupBox=groupBox}}
      `);

      const groupBoxElem = find('.group-box');
      expect(groupBoxElem.style.left).to.be.equal('1px');
      expect(groupBoxElem.style.top).to.be.equal('2px');
      expect(groupBoxElem.style.width).to.be.equal('100px');
      expect(groupBoxElem.style.marginBottom).to.be.equal('3px');
    });
  }
);
