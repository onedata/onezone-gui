import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { fillIn, click } from 'ember-native-dom-helpers';

describe('Integration | Component | token editor', function () {
  setupComponentTest('token-editor', {
    integration: true,
  });

  it('has class "token-editor"', function () {
    this.render(hbs `{{token-editor}}`);

    expect(this.$('.token-editor')).to.exist;
  });

  it('renders "name" field', function () {
    this.render(hbs `{{token-editor}}`);

    expect(this.$('.name-field label').text().trim()).to.equal('Name:');
    expect(this.$('.name-field input')).to.exist;
  });

  it('has not valid "name" when it is empty', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    const arg = changeSpy.lastCall.args[0];
    expect(arg).to.not.have.nested.property('values.basic.name');
    expect(arg.invalidFields).to.include('basic.name');
  });

  it('has valid "name" when it has been changed to not empty value', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return fillIn('.name-field input', 'abc')
      .then(() => {
        const arg = changeSpy.lastCall.args[0];
        expect(arg).to.have.nested.property('values.basic.name', 'abc');
        expect(arg.invalidFields).to.not.include('basic.name');
      });
  });

  it('renders "type" field', function () {
    this.render(hbs `{{token-editor}}`);

    expect(this.$('.type-field .control-label').text().trim()).to.equal('Type:');
    expect(this.$('.type-field .option-access').text().trim())
      .to.equal('access');
    expect(this.$('.type-field .option-invite').text().trim())
      .to.equal('invitation');
    expect(this.$('.type-field input')).to.exist;
  });

  it('has "type" field with preselected "access" option', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    const arg = changeSpy.lastCall.args[0];
    expect(arg).to.have.nested.property('values.basic.type', 'access');
    expect(arg.invalidFields).to.not.include('basic.type');
    expect(this.$('.type-field .option-access input').prop('checked')).to.be.true;
  });

  it('notifies about "type" field change', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs `{{token-editor onChange=(action "change")}}`);

    return click('.type-field .option-invite')
      .then(() => {
        const arg = changeSpy.lastCall.args[0];
        expect(arg).to.have.nested.property('values.basic.type', 'invite');
        expect(arg.invalidFields).to.not.include('basic.type');
      });
  });
});
