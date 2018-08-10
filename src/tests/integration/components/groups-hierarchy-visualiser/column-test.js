import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { set } from '@ember/object';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService, lookupService } from '../../../helpers/stub-service';
import ArrayProxy from '@ember/array/proxy';

describe(
  'Integration | Component | groups hierarchy visualiser/column',
  function () {
    setupComponentTest('groups-hierarchy-visualiser/column', {
      integration: true,
    });

    beforeEach(function beforeEach() {
      registerService(this, 'i18n', I18nStub);
      set(lookupService(this, 'i18n'), 'translations', {
        components: {
          groupsHierarchyVisualiser: {
            column: {
              childrenOfGroup: 'Children of {{groupName}}',
              parentsOfGroup: 'Parents of {{groupName}}',
            },
          },
        },
      });
    });

    it('shows spinner when data is loading', function () {
      const column = EmberObject.create({
        model: EmberObject.create({
          isPending: true,
        }),
      });

      this.set('column', column);
      this.render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(this.$('.column .spinner')).to.exist;
    });

    it('shows group name in header for startPoint type', function () {
      const column = EmberObject.create({
        relationType: 'startPoint',
        model: ArrayProxy.create({
          content: [EmberObject.create({
            name: 'testname',
          })],
          isFulfilled: true,
        }),
      });

      this.set('column', column);
      this.render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(this.$('.column-header').text()).to.contain('testname');
    });

    it('shows group name in header for children type', function () {
      const column = EmberObject.create({
        relationType: 'children',
        relatedGroup: EmberObject.create({
          name: 'testname',
        }),
        model: ArrayProxy.create({
          content: [],
          isFulfilled: true,
        }),
      });

      this.set('column', column);
      this.render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(this.$('.column-header').text().trim())
        .to.equal('Children of testname');
    });

    it('shows group name in header for parents type', function () {
      const column = EmberObject.create({
        relationType: 'parents',
        relatedGroup: EmberObject.create({
          name: 'testname',
        }),
        model: ArrayProxy.create({
          content: [],
          isFulfilled: true,
        }),
      });

      this.set('column', column);
      this.render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(this.$('.column-header').text().trim())
        .to.equal('Parents of testname');
    });

    it('shows empty header for empty type', function () {
      const column = EmberObject.create({
        relationType: 'empty',
      });

      this.set('column', column);
      this.render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(this.$('.column-header').text().trim()).to.equal('');
    });

    it('renders column in proper position', function () {
      const column = EmberObject.create({
        relationType: 'empty',
        width: 100,
        x: 50,
      });

      this.set('column', column);
      this.render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      const $column = this.$('.column');
      expect($column.css('width')).to.equal('100px');
      expect($column.css('left')).to.equal('50px');
    });
  }
);
