import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import OneDatetimePickerHelper from '../../../helpers/one-datetime-picker';

describe('Integration | Component | content tokens new/new token form', function() {
  setupComponentTest('content-tokens-new/new-token-form', {
    integration: true,
  });

  it('renders form inputs', function () {
    this.render(hbs`{{content-tokens-new/new-token-form}}`);

    [
      'name',
      'validUntilEnabled',
      'validUntil',
    ].forEach(fieldName => expect(getField(this, fieldName)).to.exist);
  });

  it('allows to set initial fields values', function () {
    const initialValues = {
      name: 'someName',
      validUntilEnabled: true,
      validUntil: new Date(),
    };
    this.set('initialValues', initialValues);

    this.render(hbs`{{content-tokens-new/new-token-form initialValues=initialValues}}`);

    expect(getField(this, 'name').val()).to.equal(initialValues.name);
    expect(getField(this, 'validUntilEnabled')).to.have.class('checked');
    const expectedDatetime =
      moment(initialValues.validUntil).format('YYYY/MM/DD H:mm');
    expect(getField(this, 'validUntil').val()).to.equal(expectedDatetime);
  });

  it('notifies about fields state after initial render', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);

    this.render(hbs`{{content-tokens-new/new-token-form onChange=(action "change")}}`);

    expect(changeSpy).to.be.calledWith({
      isValid: false,
      values: {
        name: '',
        validUntilEnabled: false,
        validUntil: undefined,
      },
    });
  });

  it('notifies about fields state after form values change', function () {
    const changeSpy = sinon.spy();
    this.on('change', changeSpy);
    const tokenName = 'token name';

    this.render(hbs`{{content-tokens-new/new-token-form onChange=(action "change")}}`);
    
    const validUntilHelper = new OneDatetimePickerHelper(getField(this, 'validUntil'));
    return fillIn(getField(this, 'name')[0], tokenName)
      .then(() => click(getField(this, 'validUntilEnabled')[0]))
      .then(() => validUntilHelper.selectToday())
      .then(() => {
        expect(changeSpy).to.be.calledWith({
          isValid: true,
          values: {
            name: tokenName,
            validUntilEnabled: true,
            validUntil: sinon.match.instanceOf(Date),
          },
        });
      });
  });
});

function getField(self, fieldName) {
  let selector = '.';
  if (fieldName === 'validUntilEnabled') {
    selector += 'toggle-';
  }
  selector += 'field-';

  switch (fieldName) {
    case 'name':
    case 'validUntilEnabled':
      selector += 'general';
      break;
    case 'validUntil':
      selector += 'validUntil';
  }
  return self.$(selector + '-' + fieldName);
}
