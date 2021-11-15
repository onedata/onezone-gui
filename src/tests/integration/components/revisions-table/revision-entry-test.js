import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

const componentClass = 'revisions-table-revision-entry';

describe('Integration | Component | revisions table/revision entry', function () {
  setupComponentTest('revisions-table/revision-entry', {
    integration: true,
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);
    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  it('shows revision number', async function () {
    const revisionNumber = this.set('revisionNumber', 0);

    await render(this);

    expect(this.$('.revision-number').text().trim())
      .to.equal(String(revisionNumber));
  });

  it('shows unknown revision number as "?"', async function () {
    this.set('revisionNumber', null);

    await render(this);

    expect(this.$('.revision-number').text().trim()).to.equal('?');
  });

  it('shows state', async function () {
    const { state } = this.set('revision', { state: 'stable' });

    await render(this);

    expect(this.$('.revisions-table-state-tag'))
      .to.have.class(`state-${state}`);
  });

  it('shows unknown state as "draft"', async function () {
    this.set('revision', null);

    await render(this);

    expect(this.$('.revisions-table-state-tag')).to.have.class('state-draft');
  });

  it('shows custom columns', async function () {
    this.setProperties({
      customColumnSpecs: [{
        name: 'name',
        className: 'custom',
        content: {
          type: 'text',
          sourceFieldName: 'name',
          fallbackValue: 'Unnamed',
        },
      }, {
        name: 'description',
        content: {
          type: 'text',
          sourceFieldName: 'description',
          fallbackValue: 'No description',
        },
      }, {
        name: 'button',
        content: {
          type: 'button',
          buttonLabel: 'Click me',
          buttonIcon: 'space',
        },
      }],
      revision: {
        name: 'somename',
        description: null,
      },
    });

    await render(this);
    const $name = this.$('.name');
    const $description = this.$('.description');
    const $button = this.$('.button');
    expect($name.text().trim()).to.equal('somename');
    expect($name).to.not.have.class('no-value');
    expect($name).to.have.class('custom');
    expect($description.text().trim()).to.equal('No description');
    expect($description).to.have.class('no-value');
    expect($button.find('button').text().trim()).to.equal('Click me');
    expect($button.find('.one-icon')).to.have.class('oneicon-space');
  });

  it('allows to choose from revision actions', async function () {
    this.setProperties({
      revisionNumber: 3,
      revisionActionsFactory: {
        createActionsForRevisionNumber(revisionNumber) {
          return [{
            title: `testAction ${revisionNumber}`,
          }];
        },
      },
    });

    await render(this);

    const $actionsTrigger = this.$('.revision-actions-trigger');
    expect($actionsTrigger).to.exist;

    await click($actionsTrigger[0]);
    const $actions = $('body .webui-popover.in .actions-popover-content a');
    expect($actions).to.have.length(1);
    expect($actions.text()).to.contain('testAction 3');
  });

  it('triggers "onButtonClick" callback after custom column button click',
    async function () {
      const { onButtonClick } = this.setProperties({
        onButtonClick: sinon.spy(),
        revisionNumber: 2,
        customColumnSpecs: [{
          name: 'btn1',
          content: {
            type: 'button',
          },
        }],
      });
      await render(this);
      expect(onButtonClick).not.to.be.called;

      await click(`.${componentClass} .btn1 button`);

      expect(onButtonClick).to.be.calledOnce.and.to.be.calledWith(2, 'btn1');
    });

  it('triggers "onClick" callback after click', async function () {
    const { onClick } = this.setProperties({
      onClick: sinon.spy(),
      revisionNumber: 2,
    });
    await render(this);
    expect(onClick).not.to.be.called;

    await click(`.${componentClass}`);

    expect(onClick).to.be.calledOnce.and.to.be.calledWith(2);
  });

  it('does not trigger "onClick" callback after actions trigger click',
    async function () {
      const onClick = this.set('onClick', sinon.spy());
      await render(this);

      await click('.revision-actions-trigger');

      expect(onClick).not.to.be.called;
    });

  it('does not trigger "onClick" callback custom column button click',
    async function () {
      const { onClick } = this.setProperties({
        onClick: sinon.spy(),
        customColumnSpecs: [{
          name: 'btn1',
          content: {
            type: 'button',
          },
        }],
      });
      await render(this);

      await click(`.${componentClass} .btn1 button`);

      expect(onClick).not.to.be.called;
    });
});

async function render(testCase) {
  testCase.render(hbs `{{revisions-table/revision-entry
    customColumnSpecs=customColumnSpecs
    revisionNumber=revisionNumber
    revision=revision
    revisionActionsFactory=revisionActionsFactory
    onClick=onClick
    onButtonClick=onButtonClick
  }}`);
  await wait();
}
