import numeral from "numeral"

export const currencyMask = (value: string | number) =>
    numeral(value).format("$ 0,0.00").replace("$", "R$").replace(".", ":").replace(",", ".").replace(":", ",")
