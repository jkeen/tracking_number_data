const CONSTANTS = {
  mod10: [
    { key: "evens_multiplier", query: "evens", label: "even positions", fallback: 1 },
    { key: "odds_multiplier", query: "odds", label: "odd positions", fallback: 1 },
    { key: "modulo", query: "modulo", label: "modulo", fallback: 10 },
  ],
  luhn: [{ key: "modulo", query: "modulo", label: "modulo", fallback: 10 }],
  mod7: [{ key: "modulo", query: "modulo", label: "modulo", fallback: 7 }],
  s10: [{ key: "modulo", query: "modulo", label: "modulo", fallback: 11 }],
  mod_37_36: [{ key: "modulo", query: "modulo", label: "modulo", fallback: 36 }],
  sum_product_with_weightings_and_modulo: [
    { key: "modulo1", query: "modulo1", label: "first modulo", fallback: 10 },
    { key: "modulo2", query: "modulo2", label: "second modulo", fallback: 10 },
  ],
}

const WEIGHTED = ["s10", "sum_product_with_weightings_and_modulo"]

const QUERY_NAMES = Object.fromEntries(
  Object.values(CONSTANTS).flatMap((constants) => constants.map(({ key, query }) => [key, query]))
)

const numbersIn = (value) => value.split(",").map(Number).filter(Number.isFinite)

export const constantsFor = (algorithm) => CONSTANTS[algorithm] ?? []

export const isWeighted = (algorithm) => WEIGHTED.includes(algorithm)

export const configFrom = (settings, base) => {
  const config = { ...base }

  for (const [key, query] of Object.entries(QUERY_NAMES)) {
    if (settings[query] !== undefined) config[key] = Number(settings[query])
  }

  if (settings.weights !== undefined) config.weightings = numbersIn(settings.weights)

  return config
}

export const queryFrom = (config, { serial, check } = {}) => {
  const query = {}

  if (serial !== undefined) query.serial = serial
  if (check !== undefined) query.check = check

  for (const [key, name] of Object.entries(QUERY_NAMES)) {
    if (config[key] !== undefined) query[name] = String(config[key])
  }

  if (config.weightings) query.weights = config.weightings.join(",")

  return query
}
