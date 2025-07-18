const gathering = (countInfo) =>
  `Gathering members for ${countInfo}.<br>This may take a while...`;

export default {
  gathering: {
    spaces: gathering('{{spaceCount}}&nbsp;spaces'),
    groups: gathering('{{groupCount}}&nbsp;groups'),
    all: gathering('{{spaceCount}}&nbsp;spaces and {{groupCount}}&nbsp;groups'),
  },
};
