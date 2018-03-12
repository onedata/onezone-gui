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
    { id: 'ubuntu', name: 'Ubuntu 14.04, 16.04' },
    { id: 'debian', name: 'Debian 8' },
    { id: 'centos', name: 'CentOS 7' },
    { id: 'redhat', name: 'RedHat Linux 7' },
    { id: 'fedora', name: 'Fedora 21, 22' },
  ]),
});
