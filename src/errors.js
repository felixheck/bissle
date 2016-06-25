const invalidOptions = 'The "options.key" have to be a string and "options.perPage" have to be an integer in the range of 1 to 500.';
const invalidQuery = 'The "page" parameter have to be greater equals 1 and the "per_page" parameter have to be an integer in the range of 1 to 500.';
const missingId = 'The route to be paginated have a missing ID.';

module.exports = {
  invalidOptions,
  invalidQuery,
  missingId,
};
