const gathering = (entity) =>
  `Gathering privileges data for {{count}} related ${entity}... {{progress}}`;

export default {
  na: 'n/a',
  effectiveLoadingTip: {
    zero: 'Gathering privileges data...',
    singular: gathering('entity'),
    plural: gathering('entities'),
  },
};
