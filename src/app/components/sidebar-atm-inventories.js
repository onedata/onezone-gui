import { classNames, layout } from '@ember-decorators/component';
import { computed } from '@ember/object';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import recordIcon from 'onedata-gui-common/utils/record-icon';
import VirtualChunksListSidebar from 'onedata-gui-common/components/virtual-chunks-list-sidebar';

@layout(template)
@classNames('sidebar-atm-inventories')
export default class SidebarAtmInventories extends VirtualChunksListSidebar {
  /**
   * @override
   */
  i18nPrefix = 'components.sidebarAtmInventories';

  /**
   * @override
   */
  model = null;

  /**
   * @override
   */
  sidebarType = 'atm-inventories';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-atm-inventories/atm-inventory-item';

  /**
   * @override
   */
  @computed()
  get secondLevelItems() {
    return [{
      id: 'workflows',
      label: this.t('aspects.workflows'),
      icon: recordIcon('atmWorkflowSchema'),
    }, {
      id: 'lambdas',
      label: this.t('aspects.lambdas'),
      icon: recordIcon('atmLambda'),
    }, {
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
    }];
  }
}
