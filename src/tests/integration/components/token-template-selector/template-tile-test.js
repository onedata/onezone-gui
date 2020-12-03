import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { htmlSafe } from '@ember/template';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | token template selector/template tile', function () {
  setupComponentTest('token-template-selector/template-tile', {
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

  it('renders one-tile with class "token-template-selector-template-tile"', function () {
    this.render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(this.$('.one-tile')).to.have.class('token-template-selector-template-tile');
  });

  it('has class template-{templateName}', function () {
    this.render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(this.$('.one-tile')).to.have.class('template-custom');
  });

  it('does not have "more" link', function () {
    this.render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(this.$('.more-link')).to.not.exist;
  });

  it('shows template name in title', function () {
    this.render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(this.$('.tile-title').text().trim()).to.equal('Custom');
  });

  it('notifies about click', async function () {
    const clickSpy = this.set('clickSpy', sinon.spy());

    this.render(hbs `{{token-template-selector/template-tile
      templateName="custom"
      onClick=clickSpy
    }}`);

    await click('.one-tile');
    expect(clickSpy).to.be.calledOnce;
  });
});
