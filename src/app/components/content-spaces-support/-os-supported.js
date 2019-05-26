/**
 * Insert information about supported Linux distributions for onedatify commands
 *
 * @module components/content-spaces-support/-os-supported
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  distributions: Object.freeze([
    { id: 'ubuntu', name: 'Ubuntu 16.04, 18.04' },
    { id: 'debian', name: 'Debian 9' },
    { id: 'centos', name: 'CentOS 7' },
  ]),
});
