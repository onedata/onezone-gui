import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { htmlSafe } from '@ember/template';

describe('Integration | Component | token template selector/template tile', function () {
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

  it('renders one-tile with class "token-template-selector-template-tile"', async function () {
    await render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(find('.one-tile')).to.have.class('token-template-selector-template-tile');
  });

  it('has class template-{templateName}', async function () {
    await render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(find('.one-tile')).to.have.class('template-custom');
  });

  it('does not have "more" link', async function () {
    await render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(find('.more-link')).to.not.exist;
  });

  it('shows template name in title', async function () {
    await render(hbs `{{token-template-selector/template-tile templateName="custom"}}`);

    expect(find('.tile-title')).to.have.trimmed.text('Custom');
  });

  it('notifies about click', async function () {
    const clickSpy = this.set('clickSpy', sinon.spy());

    await render(hbs `{{token-template-selector/template-tile
      templateName="custom"
      onClick=clickSpy
    }}`);

    await click('.one-tile');
    expect(clickSpy).to.be.calledOnce;
  });
});
