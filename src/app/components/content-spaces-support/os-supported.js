/**
 * Insert information about supported Linux distributions for onedatify commands
 *
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  distributions: Object.freeze([
    { id: 'linux', name: 'Linux' },
    { id: 'ubuntu', name: 'Ubuntu' },
    { id: 'debian', name: 'Debian' },
    { id: 'centos', name: 'CentOS' },
  ]),
});
