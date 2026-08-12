/**
 * The shapes shared across the site, described so editors can help.
 * The courier JSON is documented in the repository README.
 *
 * @typedef {object} Checksum
 * @property {string} name
 * @property {number} [evens_multiplier]
 * @property {number} [odds_multiplier]
 * @property {boolean} [reverse]
 * @property {number[]} [weightings]
 * @property {number} [modulo1]
 * @property {number} [modulo2]
 *
 * @typedef {object} Lookup
 * @property {string} [matches]
 * @property {string} [matches_regex]
 * @property {string} [name]
 * @property {string} [description]
 * @property {string} [courier]
 * @property {string} [country]
 * @property {string} [tracking_url]
 *
 * @typedef {object} Spec
 * @property {string} name
 * @property {string} [id]
 * @property {string|string[]} regex
 * @property {object} [validation]
 * @property {Lookup[]} [additional]
 * @property {object[]} [partners]
 * @property {string} [tracking_url]
 * @property {{valid?: string[], invalid?: string[]}} [test_numbers]
 *
 * @typedef {object} Courier
 * @property {string} name
 * @property {string} courier_code
 * @property {Spec[]} tracking_numbers
 *
 * @typedef {object} Definition
 * @property {string} key
 * @property {string} [id]
 * @property {string} name
 * @property {{name: string, code: string}} courier
 * @property {string} pattern
 * @property {RegExp} verify
 * @property {RegExp} search
 * @property {string[]} groupNames
 * @property {Spec} spec
 * @property {Map<string, Definition>} siblings
 *
 * @typedef {object} Match
 * @property {Definition} definition
 * @property {string} number
 * @property {Record<string, string>} groups
 * @property {Record<string, Lookup>} sections
 * @property {{text: string, name?: string, label?: string}[]} segments
 * @property {{name: string, label: string, text: string, start: number, end: number, depth: number, wraps: boolean}[]} parts
 * @property {string} courierName
 * @property {string} serialNumber
 * @property {string} checkDigit
 * @property {string|null} expectedCheckDigit
 * @property {boolean|null} checksumValid
 * @property {boolean} optionalChecksValid
 * @property {boolean} valid
 * @property {number} confidence
 * @property {string} [serviceType]
 * @property {string} [serviceDescription]
 * @property {string} [packageType]
 * @property {string} [destinationZip]
 * @property {string} [shipperId]
 * @property {string} [trackingUrl]
 * @property {'shipper'|'carrier'} [role]
 * @property {Definition} [partner]
 */

export {}
