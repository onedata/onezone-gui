import Mixin from '@ember/object/mixin';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

export default Mixin.create({
  /**
   * @param {String} type one of: data, datasets
   * @param {Object} options 
   * @returns {String} URL to browser item (opened or selected)
   */
  getBrowserUrl(type, options) {
    const {
      _location,
      router,
      navigationState,
    } = this.getProperties('_location', 'router', 'navigationState');
    let aspect;
    const selected = options.selected;
    const aspectOptions = {
      selected: (selected instanceof Array) ?
        selected.join(',') : selected || '',
    };
    if (type === 'datasets') {
      aspect = 'datasets';
      const itemId = options.datasetId;
      aspectOptions.dataset = itemId;
    } else {
      aspect = 'data';
      const itemId = options.fileId;
      aspectOptions.dir = itemId;
    }
    return _location.origin + _location.pathname + router.urlFor(
      'onedata.sidebar.content.aspect',
      aspect, {
        queryParams: {
          options: serializeAspectOptions(
            navigationState.mergedAspectOptions(aspectOptions)
          ),
        },
      });
  },
});
