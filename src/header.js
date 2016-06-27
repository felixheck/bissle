const _ = require('lodash');

/**
 * @function
 * @public
 *
 * @description
 * Get Link header value based on pagination links
 *
 * @param {Object.<?string>} links The entity/href mapping of pagination links
 * @returns {string} Parsed Link header value if links available
 */
function getLinkHeader(links) {
  const linkHeader = [];

  _.forOwn(links, (href, entity) => {
    linkHeader.push(`<${href}>; rel="${entity}"`);
  });

  return linkHeader.join(', ');
}

module.exports = {
  getLink: getLinkHeader,
};
