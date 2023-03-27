export default function generateAtmLambdaDump() {
  return {
    schemaFormatVersion: 2,
    revision: {
      schemaFormatVersion: 2,
      atmLambdaRevision: {
        name: 'l1',
        summary: 'summary',
        state: 'stable',
      },
      originalRevisionNumber: 3,
    },
    originalAtmLambdaId: 'l1id',
  };
}
