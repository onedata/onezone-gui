import Controller from '@ember/controller';
import { reads } from '@ember/object/computed';

export default Controller.extend({
  queryParams: ['space_id'],

  spaceId: reads('space_id'),
});
