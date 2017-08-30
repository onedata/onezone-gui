export default function (entityType, entityId, aspect, scope) {
  return `${entityType}.${entityId || 'null'}.${aspect}${scope ? ':' + scope : ''}`;
}
