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

const iconPrefix = '/ozw/onezone/assets/images/auth-providers/';

export default [{
    iconPath: iconPrefix + 'onepanel.svg',
    id: 'onepanel',
    iconBackgroundColor: '#4BD187',
    displayName: 'your login & password',
  },
  {
    iconPath: iconPrefix + 'indigo.svg',
    id: 'indigo',
    iconBackgroundColor: '#341246',
    displayName: 'INDIGO',
  },
  {
    iconPath: iconPrefix + 'github.svg',
    id: 'github',
    iconBackgroundColor: '#1E2325',
    displayName: 'GitHub',
  },
  {
    iconPath: iconPrefix + 'infn.svg',
    id: 'infn',
    iconBackgroundColor: '#FFF',
    displayName: 'INFN',
  },
  {
    id: 'twitter',
    displayName: 'Twitter',
  },
  {
    iconPath: iconPrefix + 'plgrid.svg',
    id: 'plgrid',
    iconBackgroundColor: '#026381',
    displayName: 'PL-Grid',
  },
  {
    iconPath: iconPrefix + 'google.svg',
    id: 'google',
    iconBackgroundColor: '#F1514F',
    displayName: 'Google+',
  },
  {
    iconPath: iconPrefix + 'dropbox.svg',
    id: 'dropbox',
    iconBackgroundColor: '#86D7F2',
    displayName: 'Dropbox',
  },
  {
    iconPath: iconPrefix + 'facebook.svg',
    id: 'facebook',
    iconBackgroundColor: '#5B87C5',
    displayName: 'Facebook',
  },
  {
    iconPath: iconPrefix + 'onepanel.svg',
    id: 'onepanel',
    iconBackgroundColor: '#5FC489',
    displayName: 'Onepanel',
  },
  {
    iconPath: iconPrefix + 'egi.svg',
    id: 'egi',
    iconBackgroundColor: '#0455A1',
    displayName: 'EGI',
  },
  {
    iconPath: iconPrefix + 'rhea.svg',
    id: 'rhea',
    iconBackgroundColor: '#B51017',
    displayName: 'RHEA',
  },
  {
    iconPath: iconPrefix + 'elixir.svg',
    id: 'elixir',
    iconBackgroundColor: '#FF7A04',
    displayName: 'ELIXIR',
  },
  {
    iconPath: iconPrefix + 'unitedid.png',
    id: 'unitedid',
    iconBackgroundColor: '#ABDFF1',
    displayName: 'United ID',
  },
  {
    iconPath: iconPrefix + 'cern.svg',
    id: 'cern',
    iconBackgroundColor: '#0053A1',
    displayName: 'CERN',
  },
  {
    iconPath: iconPrefix + 'cnrs.svg',
    id: 'cnrs',
    iconBackgroundColor: '#FFF',
    displayName: 'CNRS',
  },
  {
    iconPath: iconPrefix + 'desy.svg',
    id: 'desy',
    iconBackgroundColor: '#FFF',
    displayName: 'DESY',
  },
  {
    iconPath: iconPrefix + 'embl.svg',
    id: 'embl',
    iconBackgroundColor: '#FFF',
    displayName: 'EMBL',
  },
  {
    iconPath: iconPrefix + 'esrf.svg',
    id: 'esrf',
    iconBackgroundColor: '#FFF',
    displayName: 'ESRF',
  },
  {
    iconPath: iconPrefix + 'ifae.jpg',
    id: 'ifae',
    iconBackgroundColor: '#FFF',
    displayName: 'IFAE',
  },
  {
    iconPath: iconPrefix + 'kit.svg',
    id: 'kit',
    iconBackgroundColor: '#FFF',
    displayName: 'Kit',
  },
  {
    iconPath: iconPrefix + 'stfc.svg',
    id: 'stfc',
    iconBackgroundColor: '#1C3764',
    displayName: 'STFC',
  },
  {
    iconPath: iconPrefix + 'surfsara.png',
    id: 'surfsara',
    iconBackgroundColor: '#FFF',
    displayName: 'SurfSara',
  },
];
