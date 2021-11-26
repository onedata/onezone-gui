export default function generateAtmWorkflowSchemaDump() {
  return {
    schemaFormatVersion: 2,
    name: 'w1',
    summary: 'summary',
    revision: {
      schemaFormatVersion: 2,
      atmWorkflowSchemaRevision: {
        state: 'stable',
        description: 'description',
        lanes: [],
        stores: [],
      },
      originalRevisionNumber: 3,
      supplementaryAtmLambdas: {},
    },
    originalAtmWorkflowSchemaId: 'w1id',
  };
}
