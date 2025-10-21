/**
 * An enclosing component intended to render multiple GroupBoxes with management of a
 * GroupsHierarchyColumnDataModel instance.
 *
 * Each GroupBox fetches some data. When there are large number of GroupBoxes, there will
 * be multiple requests and we can predict GRIs of that records.
 *
 * This component:
 * - initializes batch containers in loading containers before inserting GroupBoxes,
 * - yields a place to render GroupBoxes when loading containers are initialized,
 * - flushes loading containers after GroupBoxes are rendered.
 *
 * It provides API with `onGroupBoxRendered` method, that can be invoked by GroupBox
 * components on insert. Loading containers are flushed after all needed GroupBoxes report
 * their insertion.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import RelatedGroupsDataModel from 'onezone-gui/utils/groups-hierarchy-visualiser/related-groups-column-data-model';
import { all as allFulfilled } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

/**
 * @typedef {Object} ColumnDataContainerSignature
 * @property {null} Element
 * @property {ColumnDataContainerArgs} Args
 */

/**
 * @typedef {Object} ColumnDataContainerArgs
 * @property {GroupsHierarchyColumnDataModel} columnDataModel
 */

/** @extends {Component<ColumnDataContainerSignature>} */
export default class ColumnDataContainerComponent extends Component {
  @service batchRequestRegistry;

  /**
   * ColumnDataContainer controls batch loaders for group children and parents lists.
   * Loaders should be initilized before GroupBox components are rendered, to prepare
   * batch containers. Then it should allow all GroupBox components to render as they will
   * request parents and children. When we are sure, that all components are rendered, we
   * can flush batch containers to proceed children and parents loading.
   *
   * This property maps ColumnDataModel -> number of rendered GroupBoxes to watch number of rendered components. When they are loaded, it launches `activateLoaders` method that flushes containers. It sets a special 'activated' string
   * meaning that loaders has been activated for the column and we are .
   * @type {Map<RelatedGroupsDataModel, number|'activated'>}
   */
  #renderedGroupBoxesState = new Map();

  /** @type {number} */
  #activationTimeoutId;

  constructor() {
    super(...arguments);
    // There may be some edge cases when desired number of GroupBox will not be rendered
    // due to live changes of groups number. For safety, force activate loaders after some
    // time if not activated yet.
    this.#activationTimeoutId = setTimeout(() => {
      if (
        !this.isDestroyed &&
        !this.isDestroying &&
        !this.areLoadersActivated() &&
        this.columnDataModel instanceof RelatedGroupsDataModel
      ) {
        this.activateLoaders();
      }
    }, 10000);
  }

  get columnDataModel() {
    return this.args.columnDataModel;
  }

  @computed()
  get api() {
    return {
      onGroupBoxRendered: this.onGroupBoxRendered.bind(this),
    };
  }

  @computed('shouldRenderProxy.content')
  get shouldRender() {
    return this.shouldRenderProxy.content;
  }

  @computed('columnDataModel', 'initializedLoadersProxy', 'groupsCountProxy')
  get shouldRenderProxy() {
    const promise = (async () => {
      if (this.columnDataModel instanceof RelatedGroupsDataModel) {
        await this.initializedLoadersProxy;
      }
      return Boolean(await this.groupsCountProxy);
    })();
    return promiseObject(promise);
  }

  @computed('columnDataModel.groupListProxy.length')
  get groupsCountProxy() {
    const promise = (async () => {
      const groupList = await this.columnDataModel.groupListProxy;
      return groupList.length;
    })();
    return promiseObject(promise);
  }

  @computed('columnDataModel')
  get initializedLoadersProxy() {
    const promise = (async () => {
      if (!(this.columnDataModel instanceof RelatedGroupsDataModel)) {
        return;
      }
      const [childrenLoader, parentsLoader] = await allFulfilled([
        this.columnDataModel.childrenLoaderProxy,
        this.columnDataModel.parentsLoaderProxy,
      ]);
      await allFulfilled([
        childrenLoader.initContainers(),
        parentsLoader.initContainers(),
      ]);
      return [childrenLoader, parentsLoader];
    })();
    return promiseObject(promise);
  }

  /** @override */
  willDestroy() {
    try {
      clearTimeout(this.#activationTimeoutId);
    } finally {
      super.willDestroy(...arguments);
    }
  }

  onGroupBoxRendered() {
    if (!(this.columnDataModel instanceof RelatedGroupsDataModel)) {
      return;
    }
    if (this.areLoadersActivated()) {
      return;
    }
    const currentValue =
      this.#renderedGroupBoxesState.get(this.columnDataModel) ?? 0;
    const newValue = currentValue + 1;
    this.#renderedGroupBoxesState.set(
      this.columnDataModel,
      newValue
    );
    // At the time of receving render notifications, the groupsCountProxy must be
    // already resolved.
    if (newValue >= this.groupsCountProxy.content) {
      this.activateLoaders();
    }
  }

  async activateLoaders() {
    const loaders = await this.initializedLoadersProxy;
    for (const loader of loaders) {
      loader.startFlush();
    }
    this.markLoadersActivated();
  }

  markLoadersActivated() {
    this.#renderedGroupBoxesState.set(this.columnDataModel, 'activated');
    clearTimeout(this.#activationTimeoutId);
  }

  areLoadersActivated() {
    return this.#renderedGroupBoxesState.get(this.columnDataModel) === 'activated';
  }
}
