export default {
  unclassifiedError: 'The server reported an error: {{description}}',
  badMessage: 'The server did not understand the request.',
  expectedHandshakeMessage: 'Connection to the server was lost or not fully ' +
    'established (expected handshake message).',
  handshakeAlreadyDone: 'Tried to initialize connection to the server, but it ' +
    'was already established (handshake already done).',
  badVersion: 'Malformed request (bad version). Versions of protocol ' +
    'supported by the server: {{supportedVersions}}.',
  badType: 'Malformed request (bad type).',
  notSubscribable: 'Malformed request (not subscribable).',
  rpcUndefined: 'Unknown RPC operation.',
  internalServerError: 'Internal server error.',
  notImplemented: 'This feature is not available yet.',
  notFound: 'Resource could not be found.',
  notSupported: 'Malformed request (not supported).',
  unauthorized: 'Request rejected - authentication needed.',
  forbidden: 'Insufficient permissions to access this resource.',
  badMacaroon: 'Operation could not be authorized  (bad macaroon).',
  macaroonInvalid: 'Operation could not be authorized (macaroon invalid).',
  macaroonExpired: 'Operation could not be authorized (macaroon expired).',
  macaroonTtlTooLong: 'Operation could not be authorized (macaroon TTL too long).',
  badBasicCredentials: 'Operation could not be authorized (bad basic credentials).',
  malformedData: 'Malformed request (malformed data).',
  missingRequiredValue: 'Required value of "{{key}}" is missing.',
  missingAtLeastOneValue: 'Required values of {{keys}} are missing.',
  badData: 'Value of "{{key}}" provided in request is invalid.',
  badValueEmpty: 'Value of "{{key}}" provided in request cannot be empty.',
  badValueString: 'Value of "{{key}}" provided in request must be a string.',
  badValueListOfStrings: 'Value of "{{key}}" provided in request must be a ' +
    'list of strings.',
  badValueBoolean: 'Value of "{{key}}" provided in request must be a boolean.',
  badValueInteger: 'Value of "{{key}}" provided in request must be an integer.',
  badValueFloat: 'Value of "{{key}}" provided in request must be a float.',
  badValueJSON: 'Value of "{{key}}" provided in request must be a JSON.',
  badValueToken: 'Value of "{{key}}" provided in request must be a valid token.',
  badValueListOfIPv4Addresses: 'Value of "{{key}}" provided in request must ' +
    'be a list of valid IPv4 adresses.',
  badValueDomain: 'Value of "{{key}}" provided in request must be a valid ' +
    'domain name.',
  badValueSubdomain: 'Value of "{{key}}" provided in request must be a valid ' +
    'subdomain name.',
  badValueEmail: 'Value of "{{key}}" provided in request must be a valid ' +
    'e-mail address.',
  badValueTooLow: 'Value of "{{key}}" provided in request must be greater ' +
    'or equal to {{limit}}.',
  badValueTooHigh: 'Value of "{{key}}" provided in request should be less ' +
    'or equal to {{limit}}.',
  badValueNotInRange: 'Value of "{{key}}" provided in request should be ' +
    'between {{low}} and {{high}}.',
  badValueNotAllowed: 'Value of "{{key}}" provided in request is not ' +
    'allowed, valid values: {{allowed}}.',
  badValueListNotAllowed: 'Value of "{{key}}" provided in request must be a ' +
    'list, allowed values: {{allowed}}.',
  badValueIdNotFound: 'Resource does not exist: "{{key}}".',
  badValueIdentifierOccupied: 'The identifier provided for "{{key}}" is occupied.',
  badValueTokenType: 'The token provided in "{{key}}" has invalid type.',
  badValueIntentifier: 'Value of "{{key}}" provided in request must be a ' +
    'valid identifier.',
  badValueLogin: 'Value of "{{key}}" provided in request must be a valid login.',
  subdomainDelegationDisabled: 'This operation is not available while ' +
    'subdomain delegation is disabled.',
  relationDoesNotExist: 'The {{childType}} (Id: "{{childId}}") does not ' +
    'belong to the {{parentType}} (Id: {{parentId}}).',
  relationAlreadyExists: 'The {{childType}} (Id: "{{childId}}") already ' +
    'belongs to the {{parentType}} (Id: {{parentId}}).',
  cannotDeleteEntity: 'Unexpected error while deleting the {{childType}} (Id: ' +
    '"{{childId}}").',
};
