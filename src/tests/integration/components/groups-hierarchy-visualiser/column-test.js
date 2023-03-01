import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject, { set } from '@ember/object';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService, lookupService } from '../../../helpers/stub-service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { createEmptyColumnModel } from 'onezone-gui/utils/groups-hierarchy-visualiser/column';

describe(
  'Integration | Component | groups-hierarchy-visualiser/column',
  function () {
    setupRenderingTest();

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

    it('shows spinner when data is loading', async function () {
      const column = EmberObject.create({
        model: EmberObject.create({
          isPending: true,
        }),
      });

      this.set('column', column);
      await render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(find('.column .spinner')).to.exist;
    });

    it('shows group name in header for startPoint type', async function () {
      const column = EmberObject.create({
        relationType: 'startPoint',
        model: PromiseObject.create({
          promise: resolve(EmberObject.create({
            list: PromiseArray.create({
              promise: resolve(A([
                EmberObject.create({
                  name: 'testname',
                }),
              ])),
            }),
          })),
        }),
      });

      this.set('column', column);
      await render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(find('.column-header')).to.contain.text('testname');
    });

    it('shows group name in header for children type', async function () {
      const column = EmberObject.create({
        relationType: 'children',
        relatedGroup: EmberObject.create({
          name: 'testname',
        }),
        model: createEmptyColumnModel(),
      });

      this.set('column', column);
      await render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(find('.column-header'))
        .to.have.trimmed.text('Children of testname');
    });

    it('shows group name in header for parents type', async function () {
      const column = EmberObject.create({
        relationType: 'parents',
        relatedGroup: EmberObject.create({
          name: 'testname',
        }),
        model: createEmptyColumnModel(),
      });

      this.set('column', column);
      await render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(find('.column-header'))
        .to.have.trimmed.text('Parents of testname');
    });

    it('shows empty header for empty type', async function () {
      const column = EmberObject.create({
        relationType: 'empty',
      });

      this.set('column', column);
      await render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      expect(find('.column-header')).to.have.trimmed.text('');
    });

    it('renders column in proper position', async function () {
      const column = EmberObject.create({
        relationType: 'empty',
        width: 100,
        x: 50,
      });

      this.set('column', column);
      await render(hbs `{{groups-hierarchy-visualiser/column column=column}}`);
      const columnElem = find('.column');
      expect(columnElem.style.width).to.equal('100px');
      expect(columnElem.style.left).to.equal('50px');
    });
  }
);
