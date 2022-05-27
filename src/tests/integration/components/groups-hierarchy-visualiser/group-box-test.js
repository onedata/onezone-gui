import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { set } from '@ember/object';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService } from '../../../helpers/stub-service';
import { click, fillIn } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';
import $ from 'jquery';

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
      expect(this.$('.group-box .group-name').text().trim()).to.equal('testname');
    });

    it('allows to edit group name', async function (done) {
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

      const $groupBox = this.$('.group-box');
      click($groupBox.find('.group-actions-trigger')[0]).then(() => {
        click($('body .webui-popover.in .rename-group-action')[0]).then(() => {
          const $editor = $groupBox.find('.one-inline-editor');
          expect($editor).to.exist;
          fillIn($editor.find('input')[0], 'newname').then(() => {
            click($groupBox.find('.save-icon')[0]).then(() => {
              expect($groupBox.find('.group-name').text().trim())
                .to.equal('newname');
              done();
            });
          });
        });
      });
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
      expect(this.$('.group-box-line')).to.have.length(2);
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
      expect(this.$('.group-box-line')).to.not.exist;
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
      expect(this.$('.group-box-relation.children .relations-number').text().trim())
        .to.equal('2');
      expect(this.$('.group-box-relation.parents .relations-number').text().trim())
        .to.equal('3');
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
      expect(this.$('.direct-membership-icon')).to.exist;
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
      expect(this.$('.direct-membership-icon')).to.not.exist;
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

        const $groupBox = this.$('.group-box');
        return click($groupBox.find('.group-actions-trigger')[0]).then(() => {
          expect($('body .webui-popover.in .leave-group-action')).to.not.exist;
          expect($('body .webui-popover.in .join-group-action')).to.exist;
        });
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

        const $groupBox = this.$('.group-box');
        return click($groupBox.find('.group-actions-trigger')[0]).then(() => {
          expect($('body .webui-popover.in .leave-group-action')).to.exist;
          expect($('body .webui-popover.in .join-group-action')).to.not.exist;
        });
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
        expect(this.$('.group-box .group-actions-trigger')).to.not.exist;
      }
    );

    it('closes actions popover after action click', async function (done) {
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
      click(this.$('.group-box .group-actions-trigger')[0]).then(() => {
        const $popover = $('body .webui-popover.in');
        click($popover.find('.leave-group-action')[0]).then(() => {
          expect($popover).to.not.have.class('in');
          done();
        });
      });
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

      const $groupBox = this.$('.group-box');
      expect($groupBox.css('left')).to.be.equal('1px');
      expect($groupBox.css('top')).to.be.equal('2px');
      expect($groupBox.css('width')).to.be.equal('100px');
      expect($groupBox.css('margin-bottom')).to.be.equal('3px');
    });
  }
);
