# Release notes for project onezone-gui


CHANGELOG
---------

### Latest changes

* VFS-10286 Added info popovers on consume token page
* VFS-10819 Added missing automation inventory ID when requesting a named token
* VFS-9014 Migrated to getting globals from `globals` util
* VFS-10698 Fixed ember ace resizing mechanism
* VFS-10767 Refactored stacked modals styles
* VFS-10126 Added space Marketplace with space configuration and requests management
* VFS-10389 Moved provider info popover to common
* VFS-10543 Updated spaces support (Oneprovider deployment) page
* VFS-10697 Fixed invalid state of automation store content editor during initalization
* VFS-10285 Added info popovers to membership
* VFS-8647 Moved component styles into dedicated directory
* VFS-7715 Added object references checks in workflows editor
* VFS-9309 Removed usages of `:contains` jQuery selector
* VFS-7873 Added automation lambdas dumping and uploading
* VFS-8701 Removed ember-one-way-controls
* VFS-10491 Fixed revision migration strategy in task arguments and results
* VFS-9196 Removed @module jsdoc
* VFS-10531 Added allowedValues constraint to atm number and atm string
* VFS-10452 Added integersOnly constraint to atm number
* VFS-10372 Added harvester popover in spaces harvesters list
* VFS-10289 Added group popover in members
* VFS-10148 Removed redundant done() from tests
* VFS-10333 Unified naming of test suites
* VFS-9688 Removed arrow placement from one-tooltip
* VFS-10118 Added support for lambda configuration parameters
* VFS-9305 Refactored one-tab-bar to not use jQuery
* VFS-10103 Changed showing clipboard in popovers info
* VFS-10367 Updated gui common
* VFS-10365 Improved editor of automation store default value
* VFS-10499 Improved editor of automation task argument constant value
* VFS-10366 Improved editor of lambda argument default value
* VFS-9999 Added detailed space details popovers with space information in various views
* VFS-10486 Removed custom zoom in tests rendering
* VFS-10378 Added information about data access tokens in tokens form
* VFS-10357 Added support for "manage archives" privilege
* VFS-10442 Added eslint rule detecting wrong usage of hyphen in translations
* VFS-10432 Fixed cookie consent persistence
* VFS-10312 Changed name conflict and disambiguation separator from "#" to "@"
* VFS-9129 Updated EmberJS to v3.8.3
* VFS-10304 Fixed broken columns movement in groups hierarchy visualiser
* VFS-10254 Added "Boolean" data type to automation, changed "Integer" to "Number" data type
* VFS-10414 Fixed displaying the same space name for each share in shares sidebar
* VFS-10060 Added "avg" time series aggregator to automation
* VFS-10287 Added user popover in space overview
* VFS-10129 Added workflow and lane charts dashboard
* VFS-10000 Added one style for flippable icons
* VFS-10111 Added rest api button on overview space page
* VFS-9311 Removed `$.*width()`, `$.*height()`, `$.offset()` and `$.position()` usages
* VFS-10245 Added error translation for internal server error with reference
* VFS-10130 Added additional modal when turning on/off dir stats
* VFS-10128 Allowed mapping task result to many targets
* VFS-9312 Removed $.css() usages
* VFS-9313 Removed ":hidden" and ":visible" jQuery selectors usages
* VFS-9310 Removed $.parents() usages
* VFS-8656 Removed jQuery from websocket client
* VFS-10046 Added popover with user info in members page
* VFS-10107 Fixed smooth scroll in Chrome
* VFS-9596 Added tests for data spec editor
* VFS-10088 Hidden access token hint in harvester public view
* VFS-9162 Added api samples modal for space
* VFS-9997 Improved showing popover info content for user and provider
* VFS-10065 Fixed list of API operation in API tab for archived file
* VFS-10037 Added "rate" and "timeDerivative" time series chart functions
* VFS-10019 Fixed types accepted by time series store during writing
* VFS-10004 Fixed generation of URL for data views
* VFS-9910 Allowed changing lambda revision in automation task
* VFS-10012 Fixed hanging file uploads
* VFS-9767 Added support for new automation workflow execution states
* VFS-9824 Removed "OnedataFS credentials" automation type
* VFS-9339 Added passing access token creation URL to embedded Oneprovider GUI
* VFS-9614 Added "preserveCurrentOptions" to Onezone GUI iframe integration API
* VFS-9926 Redirecting from non-iframed Oneprovider GUI to provider view in Onezone GUI
* VFS-9624 Applied experimental fix for random error messages on removing space
* VFS-9840 Fixed showing current time series data spec editor value
* VFS-9712 Added detailed view of upload errors
* VFS-9877 Fixed bug in replacing parent window URL in Safari
* VFS-9623 Increased speed of SASS compilation and fixed its unnecessary recompilation
* VFS-9879 Fixed using lambdas defined in non-current inventory
* VFS-9478 Updated gui common
* VFS-9607 Added get providers url internal frontend method
* VFS-9531 Improved automation store content browser
* VFS-9760 Added charts functionalities allowing usage of many TS. collections in dashboards
* VFS-9771 Added support for limited invitation token generation (restricted provider registration policy) in "Add new cluster" view
* VFS-9443 Fixed show overview tab in mobile mode in space providers page
* VFS-9665 Moved directory size statistics configuration to Onezone
* VFS-9637 Restricted audit log store types - removed file and dataset
* VFS-9625 Fixed hiding tooltip when it is controlled manually
* VFS-9335 Added charts dashboards to workflow GUI
* VFS-8716 Introduced new data specs editor to the automation gui
* VFS-9316 Removed usages of EmberPowerSelectHelper
* VFS-9394 Removed ember-browser-info
* VFS-9520 Changed sidebar look to be more compact
* VFS-9508 Updated EmberJS to v3.4.8
* VFS-9475 Added support for limited invitation token generation (restricted provider registration policy)
* VFS-9457 Added additional checks for privacy policy and Term of Use
* VFS-9336 Added toggle turning on lambda result streaming
* VFS-8805 Changed names in space sidebar menu to be more descriptive
* VFS-9355 Added more possible units to time series charts
* VFS-9163 Added config for space with directory size statistics setting
* VFS-9333 Added handling time series measurements in lambda arguments
* VFS-9332 Added handling time series measurements in all types of stores
* VFS-9270 Added task time series store
* VFS-9354 Fixed loading echarts library
* VFS-9036 Added time series features to automation GUI
* VFS-9207 Removed usage of local OpenSans fonts
* VFS-9138 Fixed glitch during provider info icon animation
* VFS-9034 Added support for changed format of automation task results and new range data type
* VFS-9013 Updated commons
* VFS-8988 Fixed carousel animation in Safari
* VFS-7717 Upgraded Babel to version 7.3, using EcmaScript 2019 for development
* VFS-8997 Added support for new data specs format in automation stores
* VFS-6803 Added Oneprovider info popup
* VFS-8640 Updated commons
* VFS-8874 Removed bower and ember-spin-button
* VFS-6397 Removed redundant bower dependencies
* VFS-8617 Removed usages of ember-invoke-action
* VFS-8574 Updated backend errors translations
* VFS-7724 Breaking change: added support for splitted datasets/archives browser and removed support for single-view datasets/archives browser
* VFS-8650 Changed default temporary invite token TTL to 2 weeks
* VFS-8631 Added terms of use page
* VFS-8682 Added array dataSpec type to workflows
* VFS-8639 Removed iterator strategy from workflows
* VFS-8255 Added workflow and lambda revisions
* VFS-8348 Added support for generating file URLs on transfers view
* VFS-8374 Fixed randomly failing test of content-atm-inventories-workflows component
* VFS-7898 Added support for generating archive-files URLs in shares views and fixed file links in upload and harvester views
* VFS-8326 Updated commons
* VFS-8482 Added dedicated page for privacy policy content
* VFS-7567 Added showing origin space in general shares sidebar
* VFS-8038 Refactored build process to support faster builds on CI
* VFS-8360 Fixed compatibility between Onezone GUI 21.02 and Oneprovider GUI 20.02 by moving shared properties caching to Oneprovider GUI
* VFS-7629 Fixed wrong class names in AIP/DIP switch
* VFS-8288 Added resources specification to automation lambda and task
* VFS-7633 Using URLs to datasets and archives selection
* VFS-8263 Showing "unsaved changes" warning when leaving workflows editor
* VFS-8053 Added ID copiers to places related to workflows
* VFS-7900 Added unlinking automation lambdas
* VFS-7661 Added timeout for connection check in clusters
* VFS-8276 Added "archive info" option to harvester indices
* VFS-8076 Rendering workflow upload input in DOM
* VFS-7896 Added possibility to define audit log stores in workflows
* VFS-7947 Improved URL routing to running new workflow with initial input stores values
* VFS-7846 Added URL routing to running new workflow
* VFS-7975 Added cancel workflow privilege in space
* VFS-7996 Fix for 20.02.x: added missing group privileges management
* VFS-7741 Added proper error information page when there is no on-line supporting provider for share
* VFS-7987 Added missing: cluster, harvester and automation inventory group privileges management
* VFS-7855 Commons update
* VFS-7950 Showing store used by workflow lane
* VFS-7893 Added support for DIP archives
* VFS-7938 Fixed bugs in workflow uploading mechanism in MacOS Chrome and Safari
* VFS-7880 Added SingleValue store value builder for task argument
* VFS-7835 Commons update
* VFS-7817 Workflows GUI Service Pack 1
* VFS-7329 Added automation inventories views and automation aspect in space
* VFS-7814 Fixed not working directories navigation in public share files browser
* VFS-7738 Fixed issues with datasets/archives browser navigation
* VFS-7046 Improved UX of "Add support" views
* VFS-7264 Changed error page when share could not be opened
* VFS-7705 Added support for additional file actions in archive file browser
* VFS-7374 Added id copiers for groups, tokens, shares, spaces
* VFS-7473 Added support for datasets and archives
* VFS-7561 Changed "Space > Data" tab name to "Files"
* VFS-7663 Changed login background image
* VFS-7514 Added displaying IDs in token consumer
* VFS-7319 Added warning when signing-in using IP address
* VFS-7588 Added onepanel rest token template
* VFS-7677 Added ID copier to harvester items in sidebar
* VFS-7470 Fixed text selection in resource name editors in sidebar
* VFS-7450 Added frames for auth providers on account screen
* VFS-5690 Added opening cluster invalid cert link in new tab and countdown for retry
* VFS-7491 Fixed column labels overflow in harvesting progress table
* VFS-7228 Better UX of token consumer page
* VFS-7516 Added new file details to harvester indices: "file type" and "dataset info"
* VFS-7401 Updated commons
* VFS-7477 Fixed removing space from harvester
* VFS-6779 Added links to harvesters/spaces from list of harvesters/spaces
* VFS-7413 Fixed missing members with duplicated names
* VFS-6663 Added options for copy user ID and provider ID/domain
* VFS-6638 Detecting unreachable duplicated clusters
* VFS-7281 Fixed scrolling to active items in sidebar
* VFS-7333 Added information about trying to sign-in with blocked account
* VFS-6566 Refactored for oneprovider-gui shares refactor
* VFS-6915 Added copy token to clipboard action in tokens sidebar
* VFS-7202 Updated "bad data" backend error translation
* VFS-7162 Added animation to the upload main progress bar
* VFS-6802 Updated commons
* VFS-7042 Updated common libs
* VFS-7093 Added info about inactive token in sidebar
* VFS-7070 Added rename space to sidebar
* VFS-6571 Added status colors to the upload main progress bar
* VFS-6745 Added new view with token templates in tokens creator GUI
* VFS-6998 Added warning icon to harvesting progress chart, when harvesting error occurred
* VFS-6935 Fixed blank content page when resource access is forbidden
* VFS-6835 Sidebar items layout changed to use flexbox
* VFS-6852 Fixed Oneprovider and Onezone services not showing in tokens creator's service caveat list when user had no access to service cluster
* VFS-6801 Disabled ceasing space support feature in favour of removing space in GUI
* VFS-6793 Fixed broken graphics of supporting OS in production builds
* VFS-6679 Added username to users in members list
* VFS-6732 Using new monospace font
* VFS-6456 Handling lack of privileges for transfers actions
* VFS-6652 Enabled assets fingerprinting for more resources
* VFS-6610 Better visualisation of large matrices in harvester index progress
* VFS-6609 Added identity tokens section in "Clean obsolete tokens" modal
* VFS-6447 Redirect directly to other Onepanel cluster
* VFS-6629 Refactor of harvester and harvester index forms
* VFS-6554 Added space owners concept
* VFS-6541 Improvements in showing harvester-space relation
* VFS-6430 Fixed hidden service and consumer caveats in token view
* VFS-6344 Improved QoS text
* VFS-6358 Uploader optimization
* VFS-6357 Added uploaded files counter to the uploader
* VFS-6381 Fixed build process
* VFS-6343 Added delete account feature
* VFS-6323 Unified Oneprovider GUI Service Pack 3
* VFS-6324 Updated common libs
* VFS-5980 Unified Oneprovider GUI Service Pack 2
* VFS-6302 Added "token is powerful, may be dangerous" warning and token name autogenerating
* VFS-6112 Added support for inviting harvester to space
* VFS-5899 Added new tokens GUI
* VFS-6145 Added support for file QoS management in Oneprovider GUI
* VFS-5929 Updated common libs
* VFS-6176 Fixed broken Oneprovider dropdown on global map
* VFS-6115 Fixed bugs and added improvements related to embedded Oneprovider GUI SP1
* VFS-5767 Fixed major bugs in file browser and shares integration
* VFS-5988 Added shares views and management
* VFS-6109 Added more verbose unverified harvester GUI plugin error and trimming to token inputs
* VFS-6102 Added harvester privileges to space
* VFS-6056 Added resetting navigation state on logout
* VFS-6027 Fixed random transition abort message when creating or joining space
* VFS-6024 Removed default space and default Oneprovider features
* VFS-6047 Added QoS-related privileges to space
* VFS-5907 Added cease Oneprovider support action in supporting Oneproviders space view
* VFS-5879 Changed provider permissions to support permissions in space
* VFS-5782 Added simplified version of new tokens GUI
* VFS-5020 Added Ceph aspect to Oneprovider cluster
* VFS-5813 Added translations for new possible backend errors
* VFS-5875 Fixed navigation to GUI settings of a cluster and optimized rendering of sidebars
* VFS-5861 Fixed corrupted rendering membership paths with "more" or "forbidden" blocks
* VFS-1891 Added privacy policy and cookie consent notification
* VFS-5769 Fixed render failure when switching between clusters
* VFS-5683 Renamed space indices to views
* VFS-5641 Added model revision check in push communication
* VFS-5599 Added support for Onepanel Proxy URL
* VFS-5605 Updated list of space privileges
* VFS-5607 Updated lodash in onedata-gui-websocket-client
* VFS-5402 Updated lodash in onedata-gui-common
* VFS-5502 Fixed not working generate new token button on Oneprovider deploy views
* VFS-5402 Updated common libraries
* VFS-5519 Fixed not visible block with service version in Safari
* VFS-5476 Refactoring of token/origin endpoints and unfied GUI URL
* VFS-5219 Data discovery functionality
* VFS-5425 Service Pack 3 for unified GUI
* VFS-5425 Changed HTTP WebSocket authorization to handshake authorization
* VFS-5411 Added password change
* VFS-5424 Changed Docker image build to contain .tar.gz package
* VFS-5342 Service Pack 2 for unified GUI
* VFS-5401 Fixed showing user own privileges in memberhsips
* VFS-5380 Fixed availability check and redirection to legacy Oneproviders
* VFS-4640 Added WebSocket reconnection and error handling; bugfixes for unified GUI (iteration 2)
* VFS-4596 Unified GUI first version
