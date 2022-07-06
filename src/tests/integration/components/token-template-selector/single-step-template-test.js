import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import { htmlSafe } from '@ember/template';
import sinon from 'sinon';

describe(
  'Integration | Component | token template selector/single step template',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const tStub = sinon.stub(lookupService(this, 'i18n'), 't');
      tStub.callsFake(function (...args) {
        if (args[0] === 'components.tokenTemplateSelector.templates.custom.title') {
          return htmlSafe('Custom');
        } else {
          return tStub.wrappedMethod.apply(this, args);
        }
      });
    });

    it('renders template-tile dedicated for specified template', async function () {
      await render(hbs `{{token-template-selector/single-step-template
        templateName="custom"
      }}`);

      expect(find('.template-custom')).to.exist;
      expect(find('.tile-title')).to.have.trimmed.text('Custom');
    });

    it('renders template image', async function () {
      await render(hbs `{{token-template-selector/single-step-template
        templateName="custom"
        imagePath="some-path.svg"
      }}`);

      expect(find('.main-image')).to.have.attr('src', 'some-path.svg');
    });

    it('notifies about selection', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      await render(hbs `{{token-template-selector/single-step-template
        templateName="custom"
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      expect(selectedSpy).to.be.calledOnce;
    });
  }
);
