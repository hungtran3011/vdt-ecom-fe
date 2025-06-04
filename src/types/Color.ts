export type ColorHex = string & { __colorHexBrand: never } // Branded type for RGB color hex

// Validation function for RGB color hex
export function isColorHex(value: string): value is ColorHex {
    return /^#([A-Fa-f0-9]{6})$/.test(value);
}