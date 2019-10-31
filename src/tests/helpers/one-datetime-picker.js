import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import $ from 'jquery';

export default class OneDatetimePickerHelper {
  constructor($trigger) {
    this.$trigger = $trigger;
  }

  openPicker() {
    const clock = sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    });

    return click(this.$trigger[0])
      .then(() => clock.tick(100))
      .then(() => clock.restore());
  }

  selectToday() {
    return this.openPicker()
      .then(() => click($('.datetime-picker .xdsoft_today')[0]));
  }
}
