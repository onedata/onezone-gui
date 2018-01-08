import Service from '@ember/service';
import Evented from '@ember/object/evented';

export default Service.extend(Evented, {
  request() {
    throw 'onedata-graph#request stub not implemented';
  },
});
