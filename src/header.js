const _ = require('lodash')

/**
 * @function
 * @public
 *
 * Get Link header value based on pagination links
 *
 * @param {Object.<?string>} links The entity/href mapping of pagination links
 * @returns {string} Parsed Link header value if links available
 */
function getLinkHeader (links) {
  const linkHeader = []

  _.forOwn(links, (link, entity) => {
    if (entity !== 'self') {
      linkHeader.push(`<${link.href}>; rel="${entity}"`)
    }
  })

  return linkHeader.join(', ') || undefined
}

module.exports = {
  getLink: getLinkHeader
}
