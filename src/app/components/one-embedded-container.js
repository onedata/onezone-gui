/**
 * An iframe for embedding `one-embedded-component`s.
 * It provides integration between two web applications.
 * It will share common object with it's child window via element's
 * `appProxy` property.
 * 
 * @module components/one-embedded-container
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import EmbeddedIframe from 'onedata-gui-common/utils/embedded-iframe';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';

export default Component.extend({
  classNames: ['one-embedded-container'],
  classNameBindings: ['iframeIsLoading:is-loading', 'fitContainer:fit-container'],

  guiUtils: service(),
  embeddedIframeManager: service(),

  /**
   * @virtual
   * @type {string}
   */
  iframeId: undefined,

  /**
   * Root URL where the embedded component's app is served.
   * E.g. URL of Oneprovider.
   * @virtual
   */
  baseUrl: undefined,

  /**
   * Array with property names that are injected to common `appProxy`
   * object and are written on the init and change.
   * @virtual optional
   */
  iframeInjectedProperties: Object.freeze([]),

  /**
   * Classes added to iframe element
   * @virtual
   * @type {string}
   */
  iframeClass: '',

  /**
   * Name of component from the remote app, that is exposed using URL
   * @virtual
   * @type {string}
   */
  embeddedComponentName: undefined,

  /**
   * @virtual
   * @type {string}
   */
  iframeType: undefined,

  /**
   * Any data, that should be passed along with iframe. Usually will be
   * correlated to iframeType.
   * @virtual
   * @type {any}
   */
  relatedData: undefined,

  /**
   * Set by iframe onload event.
   * @type {boolean}
   */
  iframeIsLoading: reads('embeddedIframe.iframeIsLoading'),

  /**
   * Error from iframe element when contentWindow cannot be acessed
   * (typically access error).
   * @type {any}
   */
  iframeError: reads('embeddedIframe.iframeError'),

  /**
   * If true, the iframe will be absolutely positioned with 100% width and height
   * @type {boolean}
   */
  fitContainer: false,

  /**
   * @type {Array<string>}
   */
  callParentActionNames: Object.freeze([]),

  /**
   * @type {Utils.EmbeddedIframe}
   */
  embeddedIframe: undefined,

  iframeIdObserver: observer('iframeId', function iframeIdObserver() {
    const {
      embeddedIframe,
      iframeId,
    } = this.getProperties('embeddedIframe', 'iframeId');
    const prevIframeId = embeddedIframe && get(embeddedIframe, 'iframeId');

    if (prevIframeId !== iframeId) {
      if (prevIframeId) {
        this.detachIframe();
      }
      this.attachIframe();
    }
  }),

  src: computed('baseUrl', 'embeddedComponentName', function src() {
    const {
      baseUrl,
      embeddedComponentName,
    } = this.getProperties('baseUrl', 'embeddedComponentName');
    return `${baseUrl}#/onedata/components/${embeddedComponentName}`;
  }),

  didInsertElement() {
    this._super(...arguments);

    const {
      iframeInjectedProperties,
    } = this.getProperties(
      'iframeInjectedProperties'
    );
    iframeInjectedProperties.forEach(propertyName => {
      const observerFun = function () {
        this.get('embeddedIframe')
          .setSharedProperty(propertyName, this.get(propertyName));
      };
      this.addObserver(propertyName, this, observerFun);
    });
    this.iframeIdObserver();
  },

  willDestroyElement() {
    try {
      this.detachIframe();
    } finally {
      this._super(...arguments);
    }
  },

  attachIframe() {
    const {
      embeddedIframeManager,
      iframeId,
      relatedData,
      iframeType,
      src,
      iframeInjectedProperties,
      callParentActionNames,
      element,
    } = this.getProperties(
      'embeddedIframeManager',
      'iframeId',
      'relatedData',
      'iframeType',
      'src',
      'iframeInjectedProperties',
      'callParentActionNames',
      'element'
    );

    const iframeOwnership = {
      ownerReference: this,
      hostElement: element,
    };

    const embeddedIframes = get(embeddedIframeManager, 'embeddedIframes');
    let embeddedIframe = embeddedIframes.findBy('iframeId', iframeId);
    if (!embeddedIframe) {
      embeddedIframe = EmbeddedIframe.create(getOwner(this).ownerInjection(), {
        iframeId,
        owners: A([iframeOwnership]),
        src,
        relatedData,
        iframeType,
      });
      embeddedIframes.pushObject(embeddedIframe);
    } else {
      const owners = get(embeddedIframe, 'owners');
      if (!owners.any(owner => get(owner, 'ownerReference') === this)) {
        owners.unshiftObject(iframeOwnership);
      }
      set(embeddedIframe, 'src', src);
    }
    this.set('embeddedIframe', embeddedIframe);

    callParentActionNames.forEach(actionName => {
      let actionFun = this.actions[actionName];
      if (actionFun) {
        actionFun = actionFun.bind(this);
        set(embeddedIframe, `callParentCallbacks.${actionName}`, actionFun);
      } else {
        throw new Error(
          `component:one-embedded-container: no such action: ${actionName}`
        );
      }
    });

    iframeInjectedProperties.forEach(propertyName => {
      embeddedIframe.setSharedProperty(propertyName, this.get(propertyName));
    });
  },

  init() {
    this._super(...arguments);
    ['src', 'iframeClass'].forEach(propName => {
      const observerName = `${propName}Observer`;
      this[observerName] = observer(propName, function () {
        const embeddedIframe = this.get('embeddedIframe');
        if (embeddedIframe) {
          set(embeddedIframe, propName, this.get(propName));
        }
      });
    });
  },
  
  detachIframe() {
    const {
      callParentActionNames,
      embeddedIframe,
    } = this.getProperties('callParentActionNames', 'embeddedIframe');

    callParentActionNames.forEach(actionName => {
      set(embeddedIframe, `callParentCallbacks.${actionName}`, undefined);
    });

    const owners = get(embeddedIframe, 'owners');
    owners.removeObject(owners.findBy('ownerReference', this));
  },

  actions: {
    willDestroyEmbeddedComponent() {
      // this.get('iframeElement')[sharedObjectName] = undefined;
    },
 
  },
});
