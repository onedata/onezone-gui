import { lookupService } from '../stub-service';

export default class CurrentUser {
  constructor(mochaContext) {
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    /**
     * Use `stubCurrentUser` method to initialize manually.
     * Will be initialized before render with default data if was not initialzed manually.
     * @type {Models.User}
     */
    this.user = undefined;
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  get service() {
    return lookupService(this.mochaContext, 'currentUser');
  }

  async stubCurrentUser(data) {
    if (data?.id) {
      throw new Error(
        'Providing "id" when stubbing current user is not supported - stub entityId instead'
      );
    }
    const effData = { ...data };
    const userId = effData.entityId ?? 'stub_user_id';
    const userGri = this.store.userGri(userId);
    const user = await this.store.createRecord('user', {
      id: userGri,
      // default data
      fullName: 'Stub user',
      username: 'stub_user',
      info: { creationTime: 1000000 },
      emails: [],

      ...effData,
    }).save();
    this.service.set('userId', userId);
    this.user = user;

    return user;
  }

  async ensureStub() {
    if (!this.user) {
      await this.stubCurrentUser();
    }
  }
}
