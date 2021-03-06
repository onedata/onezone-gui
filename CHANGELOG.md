# Release notes for project onezone-gui


CHANGELOG
---------

### Latest changes

* VFS-7846 Added URL routing to running new workflow
* VFS-7975 Added cancel workflow privilege in space
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
