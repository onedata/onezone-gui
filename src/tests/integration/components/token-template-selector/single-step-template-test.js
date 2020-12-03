import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import { htmlSafe } from '@ember/template';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe(
  'Integration | Component | token template selector/single step template',
  function () {
    setupComponentTest('token-template-selector/single-step-template', {
      integration: true,
    });

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

    it('renders template-tile dedicated for specified template', function () {
      this.render(hbs `{{token-template-selector/single-step-template
        templateName="custom"
      }}`);

      expect(this.$('.template-custom')).to.exist;
      expect(this.$('.tile-title').text().trim()).to.equal('Custom');
    });

    it('renders template image', function () {
      this.render(hbs `{{token-template-selector/single-step-template
        templateName="custom"
        imagePath="some-path.svg"
      }}`);

      expect(this.$('.main-image')).to.have.attr('src', 'some-path.svg');
    });

    it('notifies about selection', async function () {
      const selectedSpy = this.set('selectedSpy', sinon.spy());

      this.render(hbs `{{token-template-selector/single-step-template
        templateName="custom"
        onSelected=selectedSpy
      }}`);

      await click('.one-tile');
      expect(selectedSpy).to.be.calledOnce;
    });
  }
);
