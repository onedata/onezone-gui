import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../../helpers/stub-service';
import { htmlSafe } from '@ember/template';
import sinon from 'sinon';
import { Promise, resolve } from 'rsvp';
import { suppressRejections } from '../../../helpers/suppress-rejections';
import EmberObject, { set } from '@ember/object';
import { isSlideActive, getSlide } from '../../../helpers/one-carousel';

describe(
  'Integration | Component | token template selector/record selector template',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const tStub = sinon.stub(lookupService(this, 'i18n'), 't');
      tStub.callsFake(function (...args) {
        switch (args[0]) {
          case 'components.tokenTemplateSelector.templates.custom.title':
            return htmlSafe('Custom');
          case 'components.tokenTemplateSelector.templates.custom.noRecordsInfo':
            return htmlSafe('No records');
          default:
            return tStub.wrappedMethod.apply(this, args);
        }
      });
    });

    it('renders template-tile dedicated for specified template', async function () {
      await render(hbs `{{token-template-selector/record-selector-template
        templateName="custom"
      }}`);

      expect(find('.template-custom')).to.exist;
      expect(find('.tile-title')).to.have.trimmed.text('Custom');
    });

    it('renders first slide with template image, which is active on init', async function () {
      await render(hbs `{{token-template-selector/record-selector-template
        templateName="custom"
        imagePath="some-path.svg"
      }}`);

      expect(isSlideActive('intro')).to.be.true;
      expect(getSlide('intro').querySelector('.main-image').getAttribute('src'))
        .to.equal('some-path.svg');
    });

    it('shows selector slide on click', async function () {
      await render(hbs `{{token-template-selector/record-selector-template}}`);
      await click('.one-tile');

      expect(isSlideActive('selector')).to.be.true;
    });

    it('does not change slide on click when selector slide is active', async function () {
      await render(hbs `{{token-template-selector/record-selector-template}}`);
      await click('.one-tile');
      await click('.one-tile');

      expect(isSlideActive('selector')).to.be.true;
    });

    it('allows to come back to the intro slide using "Back" link', async function () {
      await render(hbs `{{token-template-selector/record-selector-template}}`);
      await click('.one-tile');

      const link = getSlide('selector').querySelector('.template-back');
      expect(link.textContent.trim()).to.equal('« Back');
      await click(link);

      expect(isSlideActive('intro')).to.be.true;
    });

    it('does not render list of records, when the intro slide is active', async function () {
      const fetchRecordsSpy = this.set('fetchRecordsSpy', sinon.spy());

      await render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecordsSpy
      }}`);

      expect(fetchRecordsSpy).to.be.not.called;
      expect(getSlide('selector').querySelector('.records-container')).to.not.exist;
    });

    it('shows spinner when records are being loaded', async function () {
      const fetchRecordsSpy = this.set(
        'fetchRecordsSpy',
        sinon.stub().returns(new Promise(() => {}))
      );

      await render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecordsSpy
      }}`);
      await click('.one-tile');

      expect(fetchRecordsSpy).to.be.calledOnce;
      expect(getSlide('selector').querySelector('.records-container .spinner')).to.exist;
    });

    it(
      'does not fetch records again when previous loading is still pending and user entered selector slide second time',
      async function () {
        const fetchRecordsSpy = this.set(
          'fetchRecordsSpy',
          sinon.stub().returns(new Promise(() => {}))
        );

        await render(hbs `{{token-template-selector/record-selector-template
          fetchRecords=fetchRecordsSpy
        }}`);
        await click('.one-tile');
        await click('.template-back');
        await click('.one-tile');

        expect(fetchRecordsSpy).to.be.calledOnce;
      }
    );

    it(
      'does not fetch records again when records are loaded and user entered selector slide second time',
      async function () {
        const fetchRecordsSpy = this.set(
          'fetchRecordsSpy',
          sinon.stub().resolves([])
        );

        await render(hbs `{{token-template-selector/record-selector-template
          fetchRecords=fetchRecordsSpy
        }}`);
        await click('.one-tile');
        await click('.template-back');
        await click('.one-tile');

        expect(fetchRecordsSpy).to.be.calledOnce;
      }
    );

    it('shows records', async function () {
      this.set('fetchRecords', () => resolve([{
        constructor: {
          modelName: 'provider',
        },
        name: 'p1',
      }, {
        constructor: {
          modelName: 'provider',
        },
        name: 'p2',
      }]));

      await render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);
      await click('.one-tile');

      const selectorSlide = getSlide('selector');
      const records = selectorSlide.querySelectorAll('.record-item');
      expect(records).to.have.length(2);
      expect(records[0].textContent.trim()).to.equal('p1');
      expect(records[1].textContent.trim()).to.equal('p2');
      expect(selectorSlide.querySelectorAll('.record-item .oneicon-provider'))
        .to.have.length(2);
      expect(selectorSlide.querySelector('.no-records-info')).to.not.exist;
    });

    it('shows information about no records available', async function () {
      this.set('fetchRecords', () => resolve([]));

      await render(hbs `{{token-template-selector/record-selector-template
        templateName="custom"
        fetchRecords=fetchRecords
      }}`);
      await click('.one-tile');
      const selectorSlide = getSlide('selector');

      expect(selectorSlide.querySelector('.record-item')).to.not.exist;
      expect(selectorSlide.querySelector('.no-records-info').textContent.trim())
        .to.equal('No records');
    });

    it('notifies about record selection', async function () {
      const record = { name: 'p1' };
      const { selectedSpy } = this.setProperties({
        fetchRecords: () => resolve([record]),
        selectedSpy: sinon.spy(),
      });

      await render(hbs `{{token-template-selector/record-selector-template
        templateName="custom"
        fetchRecords=fetchRecords
        onSelected=selectedSpy
      }}`);
      await click('.one-tile');
      await click('.record-item');

      expect(selectedSpy).to.be.calledOnce
        .and.to.be.calledWith('custom', sinon.match({ record }));
    });

    it('comes back to intro slide after record selection', async function () {
      this.set('fetchRecords', () => resolve([{ name: 'p1' }]));

      await render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);
      await click('.one-tile');
      await click('.record-item');

      expect(isSlideActive('intro')).to.be.true;
    });

    it('allows to filter records', async function () {
      this.set('fetchRecords', () => resolve([{
        name: 'p1',
      }, {
        name: 'p2',
      }]));

      await render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);
      await click('.one-tile');
      const selectorSlide = getSlide('selector');
      await fillIn(selectorSlide.querySelector('.search-bar'), '2');

      const records = selectorSlide.querySelectorAll('.record-item');
      expect(records).to.have.length(1);
      expect(records[0].textContent.trim()).to.equal('p2');
      expect(selectorSlide.querySelector('.no-records-after-filter-info')).to.not.exist;
    });

    it('allows to filter records using custom matcher', async function () {
      this.setProperties({
        fetchRecords: () => resolve([{
          name: 'p1',
          otherName: 'o2',
        }, {
          name: 'p2',
          otherName: 'o1',
        }]),
        filterMatcher: ({ otherName }, filter) => otherName.includes(filter),
      });

      await render(hbs `{{token-template-selector/record-selector-template
        filterMatcher=filterMatcher
        fetchRecords=fetchRecords
      }}`);
      await click('.one-tile');
      const selectorSlide = getSlide('selector');
      await fillIn(selectorSlide.querySelector('.search-bar'), '2');

      const records = selectorSlide.querySelectorAll('.record-item');
      expect(records).to.have.length(1);
      expect(records[0].textContent.trim()).to.equal('p1');
    });

    it('shows info when there are no records matching the filter', async function () {
      this.set('fetchRecords', () => resolve([{
        name: 'p1',
      }, {
        name: 'p2',
      }]));

      await render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);
      await click('.one-tile');
      const selectorSlide = getSlide('selector');
      await fillIn(selectorSlide.querySelector('.search-bar'), '3');

      expect(selectorSlide.querySelectorAll('.record-item')).to.have.length(0);
      expect(
        selectorSlide.querySelector('.no-records-after-filter-info').textContent.trim()
      ).to.equal('No results match your filter.');
    });

    it('recalculates filtered records on filtered field value change', async function () {
      const recordEntries = [EmberObject.create({
        name: 'p1',
        otherName: 'o2',
      }), EmberObject.create({
        name: 'p2',
        otherName: 'o1',
      })];
      this.setProperties({
        fetchRecords: () => resolve(recordEntries),
        filterMatcher: ({ otherName }, filter) => otherName.includes(filter),
      });

      await render(hbs `{{token-template-selector/record-selector-template
        filterDependentKeys=(array "otherName")
        filterMatcher=filterMatcher
        fetchRecords=fetchRecords
      }}`);
      await click('.one-tile');
      const selectorSlide = getSlide('selector');
      await fillIn(selectorSlide.querySelector('.search-bar'), '3');
      set(recordEntries[0], 'otherName', 'o3');
      await settled();

      const records = selectorSlide.querySelectorAll('.record-item');
      expect(records).to.have.length(1);
      expect(records[0].textContent.trim()).to.equal('p1');
    });

    it('shows error when records cannot be loaded', async function () {
      suppressRejections();
      let rejectPromise;
      const fetchRecordsSpy = this.set(
        'fetchRecordsSpy',
        sinon.stub().returns(new Promise((resolve, reject) => rejectPromise = reject))
      );

      await render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecordsSpy
      }}`);
      await click('.one-tile');
      rejectPromise('recordserror');
      await settled();

      expect(fetchRecordsSpy).to.be.calledOnce;
      expect(getSlide('selector')
        .querySelector('.records-container .resource-load-error').textContent
      ).to.contain('recordserror');
    });

    it(
      'tries to fetch records again when the first time failed and user entered selector slide second time',
      async function () {
        suppressRejections();
        let rejectPromise;
        const fetchRecordsSpy = this.set(
          'fetchRecordsSpy',
          sinon.stub().returns(new Promise((resolve, reject) => rejectPromise = reject))
        );

        await render(hbs `{{token-template-selector/record-selector-template
          fetchRecords=fetchRecordsSpy
        }}`);
        await click('.one-tile');
        rejectPromise('recordserror');
        await settled();
        await click('.template-back');
        await click('.one-tile');

        expect(fetchRecordsSpy).to.be.calledTwice;
      }
    );
  }
);
