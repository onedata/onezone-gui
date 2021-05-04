/**
 * Allows to view and create workflow schemas.
 *
 * @module components/content-inventories-workflows
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { conditional, array, promise } from 'ember-awesome-macros';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';

export default Component.extend(GlobalActions, {
  classNames: ['content-inventories-workflows'],

  navigationState: service(),
  recordManager: service(),

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * Mapping:
   * string -> Array<Utils.Action>
   * @type {Object}
   */
  actionsPerSlide: undefined,

  /**
   * @type {String|undefined}
   */
  activeAtmWorkflowSchemaId: undefined,

  /**
   * @type {Array<String>}
   */
  possibleSlideIds: Object.freeze(['list', 'editor']),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  activeSlideFromUrl: reads('navigationState.aspectOptions.view'),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  activeAtmWorkflowSchemaIdFromUrl: reads('navigationState.aspectOptions.workflowId'),

  /**
   * @type {ComputedProperty<String>}
   */
  activeSlide: conditional(
    array.includes('possibleSlideIds', 'activeSlideFromUrl'),
    'activeSlideFromUrl',
    'possibleSlideIds.firstObject'
  ),

  activeAtmWorkflowSchemaProxy: promise.object(computed(
    'activeAtmWorkflowSchemaId',
    'atmInventory',
    async function activeAtmWorkflowSchema() {
      const {
        activeAtmWorkflowSchemaId,
        atmInventory,
        recordManager,
      } = this.getProperties(
        'activeAtmWorkflowSchemaId',
        'atmInventory',
        'recordManager'
      );
      if (!activeAtmWorkflowSchemaId) {
        return;
      }

      const atmWorkflowSchema = await recordManager.getRecordById(
        'atmWorkflowSchema',
        activeAtmWorkflowSchemaId
      );
      const parentInventory = await get(atmWorkflowSchema, 'atmInventory');
      if (parentInventory !== atmInventory) {
        throw { id: 'notFound' };
      }
      return atmWorkflowSchema;
    }
  )),

  /**
   * @override
   */
  globalActions: computed('actionsPerSlide', 'activeSlide', function globalActions() {
    const {
      actionsPerSlide,
      activeSlide,
    } = this.getProperties('actionsPerSlide', 'activeSlide');

    return actionsPerSlide[activeSlide] || [];
  }),

  activeAtmWorkflowSchemaIdFromUrlObserver: observer(
    'activeAtmWorkflowSchemaIdFromUrl',
    function activeAtmWorkflowSchemaIdFromUrlObserver() {
      const {
        activeAtmWorkflowSchemaId,
        activeAtmWorkflowSchemaIdFromUrl,
      } = this.getProperties(
        'activeAtmWorkflowSchemaId',
        'activeAtmWorkflowSchemaIdFromUrl'
      );

      if (activeAtmWorkflowSchemaId !== activeAtmWorkflowSchemaIdFromUrl) {
        this.set('activeAtmWorkflowSchemaId', activeAtmWorkflowSchemaIdFromUrl);
      }
    }
  ),

  changeSlideViaUrl(newSlide, slideParams = {}) {
    this.get('navigationState').changeRouteAspectOptions(Object.assign({}, slideParams, {
      view: newSlide,
    }));
  },

  init() {
    this._super(...arguments);
    this.set('actionsPerSlide', {});
    this.activeAtmWorkflowSchemaIdFromUrlObserver();
  },

  actions: {
    showCreatorView() {
      this.changeSlideViaUrl('editor', { workflowId: null });
    },
    showEditorView(atmWorkflowSchema) {
      const workflowId = get(atmWorkflowSchema || {}, 'entityId') || null;
      this.changeSlideViaUrl('editor', { workflowId });
    },
    backSlide() {
      if (this.get('activeSlide') === 'list') {
        return;
      }
      this.changeSlideViaUrl('list');
    },
    registerViewActions(slideId, actions) {
      this.set('actionsPerSlide', Object.assign({}, this.get('actionsPerSlide'), {
        [slideId]: actions,
      }));
    },
  },
});
