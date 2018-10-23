/**
 * Note: this is now only for mocking purposes as authorizers data is sent from
 * backend!
 * 
 * Provides list of predefined authorization providers with neccessary 
 * data to display them (name, logo - icon or image).
 * 
 * @module utils/authorizers-mock
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AuthorizerInfo
 * @property {string} type
 * @property {string} name authorizer name to display
 * @property {string} iconType 'oneicon' or any image file extension
 * @property {string} iconName oneicon character name of file name 
 * (without extension)
 */

export default [{
    iconPath: '/assets/images/auth-providers/onepanel.svg',
    id: 'onepanel',
    iconBackgroundColor: '#4BD187',
    displayName: 'Onepanel account',
  },
  {
    iconPath: '/assets/images/auth-providers/indigo.svg',
    id: 'indigo',
    iconBackgroundColor: '#341246',
    displayName: 'INDIGO',
  },
  {
    iconPath: '/assets/images/auth-providers/github.svg',
    id: 'github',
    iconBackgroundColor: '#1E2325',
    displayName: 'GitHub',
  },
  {
    iconPath: '/assets/images/auth-providers/infn.svg',
    id: 'infn',
    iconBackgroundColor: '#FFF',
    displayName: 'INFN',
  },
  {
    id: 'twitter',
    displayName: 'Twitter',
  },
  {
    iconPath: '/assets/images/auth-providers/plgrid.svg',
    id: 'plgrid',
    iconBackgroundColor: '#026381',
    displayName: 'PL-Grid',
  },
  {
    iconPath: '/assets/images/auth-providers/google.svg',
    id: 'google',
    iconBackgroundColor: '#F1514F',
    displayName: 'Google+',
  },
  {
    iconPath: '/assets/images/auth-providers/dropbox.svg',
    id: 'dropbox',
    iconBackgroundColor: '#86D7F2',
    displayName: 'Dropbox',
  },
  {
    iconPath: '/assets/images/auth-providers/facebook.svg',
    id: 'facebook',
    iconBackgroundColor: '#5B87C5',
    displayName: 'Facebook',
  },
  {
    iconPath: '/assets/images/auth-providers/onepanel.svg',
    id: 'onepanel',
    iconBackgroundColor: '#5FC489',
    displayName: 'Onepanel',
  },
  {
    iconPath: '/assets/images/auth-providers/egi.svg',
    id: 'egi',
    iconBackgroundColor: '#0455A1',
    displayName: 'EGI',
  },
  {
    iconPath: '/assets/images/auth-providers/rhea.svg',
    id: 'rhea',
    iconBackgroundColor: '#B51017',
    displayName: 'RHEA',
  },
  {
    iconPath: '/assets/images/auth-providers/elixir.svg',
    id: 'elixir',
    iconBackgroundColor: '#FF7A04',
    displayName: 'ELIXIR',
  },
  {
    iconPath: '/assets/images/auth-providers/unitedid.png',
    id: 'unitedid',
    iconBackgroundColor: '#ABDFF1',
    displayName: 'United ID',
  },
  {
    iconPath: '/assets/images/auth-providers/cern.svg',
    id: 'cern',
    iconBackgroundColor: '#0053A1',
    displayName: 'CERN',
  },
  {
    iconPath: '/assets/images/auth-providers/cnrs.svg',
    id: 'cnrs',
    iconBackgroundColor: '#FFF',
    displayName: 'CNRS',
  },
  {
    iconPath: '/assets/images/auth-providers/desy.svg',
    id: 'desy',
    iconBackgroundColor: '#FFF',
    displayName: 'DESY',
  },
  {
    iconPath: '/assets/images/auth-providers/embl.svg',
    id: 'embl',
    iconBackgroundColor: '#FFF',
    displayName: 'EMBL',
  },
  {
    iconPath: '/assets/images/auth-providers/esrf.svg',
    id: 'esrf',
    iconBackgroundColor: '#FFF',
    displayName: 'ESRF',
  },
  {
    iconPath: '/assets/images/auth-providers/ifae.jpg',
    id: 'ifae',
    iconBackgroundColor: '#FFF',
    displayName: 'IFAE',
  },
  {
    iconPath: '/assets/images/auth-providers/kit.svg',
    id: 'kit',
    iconBackgroundColor: '#FFF',
    displayName: 'Kit',
  },
  {
    iconPath: '/assets/images/auth-providers/stfc.svg',
    id: 'stfc',
    iconBackgroundColor: '#1C3764',
    displayName: 'STFC',
  },
  {
    iconPath: '/assets/images/auth-providers/surfsara.png',
    id: 'surfsara',
    iconBackgroundColor: '#FFF',
    displayName: 'SurfSara',
  },
];
