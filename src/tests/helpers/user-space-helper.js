import CurrentUserHelper from './mixins/current-user';
import createSpace from './create-space';
import { lookupService } from './stub-service';

export default class UserSpaceHelper {
  constructor(mochaContext) {
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    /** @type {Models.User} */
    this.user = null;
    /** @type {Models.Space} */
    this.space = null;
    this.currentUserHelper = new CurrentUserHelper(this.mochaContext);
  }
  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  async setSpace(spaceData = {}) {
    if (!this.user) {
      await this.setUser();
    }
    /** @type {Models.Space} */
    this.space = await createSpace(this.store, spaceData, this.user);
    return this.space;
  }
  async setUser(userData = {}) {
    const user = await this.currentUserHelper.stubCurrentUser(userData);
    this.user = user;
    return user;
  }
  async ensureData() {
    if (!this.space) {
      await this.setSpace();
    }
  }
}
