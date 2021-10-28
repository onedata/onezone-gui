export default function generateAtmWorkflowSchemaDump() {
  return {
    schemaFormatVersion: 1,
    name: 'w1',
    summary: 'summary',
    initialRevision: {
      schema: {
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
