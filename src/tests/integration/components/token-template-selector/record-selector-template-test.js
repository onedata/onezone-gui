import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import { htmlSafe } from '@ember/template';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import { Promise, resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import suppressRejections from '../../../helpers/suppress-rejections';
import EmberObject, { set } from '@ember/object';

describe(
  'Integration | Component | token template selector/record selector template',
  function () {
    setupComponentTest('token-template-selector/record-selector-template', {
      integration: true,
    });

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

    it('renders template-tile dedicated for specified template', function () {
      this.render(hbs `{{token-template-selector/record-selector-template
        templateName="custom"
      }}`);

      expect(this.$('.template-custom')).to.exist;
      expect(this.$('.tile-title').text().trim()).to.equal('Custom');
    });

    it('renders first slide with template image, which is active on init', function () {
      this.render(hbs `{{token-template-selector/record-selector-template
        templateName="custom"
        imagePath="some-path.svg"
      }}`);

      expect(isSlideActive(this, 'intro')).to.be.true;
      expect(getSlide(this, 'intro').find('.main-image'))
        .to.have.attr('src', 'some-path.svg');
    });

    it('shows selector slide on click', async function () {
      this.render(hbs `{{token-template-selector/record-selector-template}}`);

      await click('.one-tile');
      expect(isSlideActive(this, 'selector')).to.be.true;
    });

    it('does not change slide on click when selector slide is active', async function () {
      this.render(hbs `{{token-template-selector/record-selector-template}}`);

      await click('.one-tile');
      await click('.one-tile');
      expect(isSlideActive(this, 'selector')).to.be.true;
    });

    it('allows to come back to the intro slide using "Back" link', async function () {
      this.render(hbs `{{token-template-selector/record-selector-template}}`);

      await click('.one-tile');
      const $link = getSlide(this, 'selector').find('.template-back');
      expect($link.text().trim()).to.equal('« Back');

      await click($link[0]);
      expect(isSlideActive(this, 'intro')).to.be.true;
    });

    it('does not render list of records, when the intro slide is active', function () {
      const fetchRecordsSpy = this.set('fetchRecordsSpy', sinon.spy());
      this.render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecordsSpy
      }}`);

      expect(fetchRecordsSpy).to.be.not.called;
      expect(getSlide(this, 'selector').find('.records-container')).to.not.exist;
    });

    it('shows spinner when records are being loaded', async function () {
      const fetchRecordsSpy = this.set(
        'fetchRecordsSpy',
        sinon.stub().returns(new Promise(() => {}))
      );

      this.render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecordsSpy
      }}`);

      await click('.one-tile');
      expect(fetchRecordsSpy).to.be.calledOnce;
      expect(getSlide(this, 'selector').find('.records-container .spinner')).to.exist;
    });

    it(
      'does not fetch records again when previous loading is still pending and user entered selector slide second time',
      async function () {
        const fetchRecordsSpy = this.set(
          'fetchRecordsSpy',
          sinon.stub().returns(new Promise(() => {}))
        );

        this.render(hbs `{{token-template-selector/record-selector-template
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

        this.render(hbs `{{token-template-selector/record-selector-template
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

      this.render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);

      await click('.one-tile');
      const $selectorSlide = getSlide(this, 'selector');
      const $records = $selectorSlide.find('.record-item');
      expect($records).to.have.length(2);
      expect($records.eq(0).text().trim()).to.equal('p1');
      expect($records.eq(1).text().trim()).to.equal('p2');
      expect($records.find('.oneicon-provider')).to.have.length(2);
      expect($selectorSlide.find('.no-records-info')).to.not.exist;
    });

    it('shows information about no records available', async function () {
      this.set('fetchRecords', () => resolve([]));

      this.render(hbs `{{token-template-selector/record-selector-template
        templateName="custom"
        fetchRecords=fetchRecords
      }}`);

      await click('.one-tile');
      const $selectorSlide = getSlide(this, 'selector');
      expect($selectorSlide.find('.record-item')).to.not.exist;
      expect($selectorSlide.find('.no-records-info').text().trim())
        .to.equal('No records');
    });

    it('notifies about record selection', async function () {
      const record = { name: 'p1' };
      const { selectedSpy } = this.setProperties({
        fetchRecords: () => resolve([record]),
        selectedSpy: sinon.spy(),
      });

      this.render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
        onRecordSelected=selectedSpy
      }}`);

      await click('.one-tile');
      await click('.record-item');
      expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(record);
    });

    it('comes back to intro slide after record selection', async function () {
      this.set('fetchRecords', () => resolve([{ name: 'p1' }]));

      this.render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);

      await click('.one-tile');
      await click('.record-item');
      expect(isSlideActive(this, 'intro')).to.be.true;
    });

    it('allows to filter records', async function () {
      this.set('fetchRecords', () => resolve([{
        name: 'p1',
      }, {
        name: 'p2',
      }]));

      this.render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);

      await click('.one-tile');
      const $selectorSlide = getSlide(this, 'selector');
      await fillIn($selectorSlide.find('.search-bar')[0], '2');
      const $records = $selectorSlide.find('.record-item');
      expect($records).to.have.length(1);
      expect($records.text().trim()).to.equal('p2');
      expect($selectorSlide.find('.no-records-after-filter-info')).to.not.exist;
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

      this.render(hbs `{{token-template-selector/record-selector-template
        filterMatcher=filterMatcher
        fetchRecords=fetchRecords
      }}`);

      await click('.one-tile');
      const $selectorSlide = getSlide(this, 'selector');
      await fillIn($selectorSlide.find('.search-bar')[0], '2');
      const $records = $selectorSlide.find('.record-item');
      expect($records).to.have.length(1);
      expect($records.text().trim()).to.equal('p1');
    });

    it('shows info when there are no records matching the filter', async function () {
      this.set('fetchRecords', () => resolve([{
        name: 'p1',
      }, {
        name: 'p2',
      }]));

      this.render(hbs `{{token-template-selector/record-selector-template
        fetchRecords=fetchRecords
      }}`);

      await click('.one-tile');
      const $selectorSlide = getSlide(this, 'selector');
      await fillIn($selectorSlide.find('.search-bar')[0], '3');
      expect($selectorSlide.find('.record-item')).to.have.length(0);
      expect($selectorSlide.find('.no-records-after-filter-info').text().trim())
        .to.equal('No results match your filter.');
    });

    it('recalculates filtered records on filtered field value change', async function () {
      const records = [EmberObject.create({
        name: 'p1',
        otherName: 'o2',
      }), EmberObject.create({
        name: 'p2',
        otherName: 'o1',
      })];
      this.setProperties({
        fetchRecords: () => resolve(records),
        filterMatcher: ({ otherName }, filter) => otherName.includes(filter),
      });

      this.render(hbs `{{token-template-selector/record-selector-template
        filterDependentKeys=(array "otherName")
        filterMatcher=filterMatcher
        fetchRecords=fetchRecords
      }}`);

      await click('.one-tile');
      const $selectorSlide = getSlide(this, 'selector');
      await fillIn($selectorSlide.find('.search-bar')[0], '3');
      set(records[0], 'otherName', 'o3');
      await wait();
      const $records = $selectorSlide.find('.record-item');
      expect($records).to.have.length(1);
      expect($records.text().trim()).to.equal('p1');
    });

    context('handles errors', function () {
      suppressRejections();

      it('shows error when records cannot be loaded', async function () {
        let rejectPromise;
        const fetchRecordsSpy = this.set(
          'fetchRecordsSpy',
          sinon.stub().returns(new Promise((resolve, reject) => rejectPromise = reject))
        );

        this.render(hbs `{{token-template-selector/record-selector-template
          fetchRecords=fetchRecordsSpy
        }}`);

        await click('.one-tile');
        rejectPromise('recordserror');
        await wait();

        expect(fetchRecordsSpy).to.be.calledOnce;
        expect(getSlide(this, 'selector')
          .find('.records-container .resource-load-error').text()
        ).to.contain('recordserror');
      });

      it('tries to fetch records again when the first time failed and user entered selector slide second time',
        async function () {
          let rejectPromise;
          const fetchRecordsSpy = this.set(
            'fetchRecordsSpy',
            sinon.stub().returns(new Promise((resolve, reject) => rejectPromise = reject))
          );

          this.render(hbs `{{token-template-selector/record-selector-template
          fetchRecords=fetchRecordsSpy
        }}`);

          await click('.one-tile');
          rejectPromise('recordserror');
          await wait();
          await click('.template-back');
          await click('.one-tile');

          expect(fetchRecordsSpy).to.be.calledTwice;
        });
    });
  }
);

function isSlideActive(testCase, slideName) {
  const slide = getSlide(testCase, slideName)[0];
  return [...slide.classList].any(cls => cls.startsWith('active'));
}

function getSlide(testCase, slideName) {
  return testCase.$(`[data-one-carousel-slide-id="${slideName}"]`);
}
