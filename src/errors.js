const rangeInfo = 'have to be an integer in the range of 1 to 500';

const invalidOptions = `Options: "key" have to be a string, "perPage" ${rangeInfo} and 
"total" have to be a positive integer.`;
const invalidQuery = `Query: "page" have to be greater equals 1 and "per_page" ${rangeInfo}.`;
const missingId = 'The route to be paginated have a missing ID.';

module.exports = {
  invalidOptions,
  invalidQuery,
  missingId,
};
