const LABELS = {
  mod10: "Mod 10",
  mod7: "Mod 7",
  s10: "S10",
  luhn: "Luhn",
  mod_37_36: "Mod 37,36",
  sum_product_with_weightings_and_modulo: "Weighted sum",
}

export const labelFor = (name) => LABELS[name] ?? name
