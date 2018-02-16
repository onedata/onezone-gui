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
    { id: 'redhat', name: 'RedHat' },
    { id: 'centos', name: 'CentOS' },
    { id: 'fedora', name: 'Fedora' },
    { id: 'debian', name: 'Debian' },
    { id: 'ubuntu', name: 'Ubuntu' },
  ]),

});
