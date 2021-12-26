export const eV2Ry = 0.0734986176;
export const Ry2eV = 13.605698066;
export const A2au = 1.8897259886;
export const au2A = 0.529177249;

/**
 * Converts the array given from eV values to Rydberg
 * @param {number[]} arr array of eV energy values
 * @param {number} len number of values
 * @returns {number[]}
 */
export function convert_eV_to_Ry(arr, len) {
    const res = new Array(len);
    for(var i=0; i<len; i++) res[i] = arr[i] * 0.0734986176;
    return res;
}

/**
 * Converts the array given from Rydberg values to eV
 * @param {number[]} arr array of Ry energy values
 * @param {number} len number of values
 * @returns {number[]}
 */
export function convert_Ry_to_eV(arr, len) {
    const res = new Array(len);
    for(var i=0; i<len; i++) res[i] = arr[i] * 13.605698066;
    return res;
}