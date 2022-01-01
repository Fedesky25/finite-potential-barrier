import { transmission, transmission_pot } from './utils/transmission.js';
import { eV2Ry, A2au } from "./utils/convert.js";
import { LinearSpace } from './utils/linear.js';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Asserts a condition. If not met, a message is displayed and the process exits.
 * @param {boolean} flag condition to be met 
 * @param {string} msg error message
 * @returns 
 */
function assert(flag, msg) {
    if(flag) return;
    console.warn(msg);
    process.exit(1);
}

/** @param {{min?: number, max: number, points?: number}} e */
function checkEnergies(e) {
    assert(typeof e === "object", "Energies must be an object with at least the maximum specified");
    assert(typeof e.max === "number" && e.max > 0, "Enegies maximum must be a positive number")
    if(e.min) assert(typeof e.min === "number" && e.min >= 0 && e.min < e.max, "Energies minimum must be a positive number less than the maximum");
    else e.min = 0;
    if(e.points) assert(typeof e.points === "number" && e.points > 2, "Energies points taken must be more than 2");
    else e.points = 500;
    return e;
}

function parseMass(s) {
    if(typeof s === "number") return s;
    if(typeof s !== "string") return 1;
    switch (s) {
        case "v_e":
        case "electron-neutrino":
            return 1.957e-3;
        case "v_m":
        case "muon-neutrino":
            return 0.3326;
        case "e":
        case "electron":
            return 1;
        case "u":
        case "quark-up":
            return 4.3053;
        case "d":
        case "quark-down":
            return 9.1977;
        case "v_t":
        case "tau-neutrino":
            return 35.616;
        case "m":
        case "muon":
            return 206.77;
        case "p":
        case "proton":
            return 1836.1; 
        default:
            return +s || 1;
    }
}

const filename = process.argv[2];
assert(filename, "A file name must be provided");

const opt = JSON.parse(readFileSync(`./data/${filename}.json`, {encoding: "utf-8"}));
assert(typeof opt === "object", "Options must be and object");

const e_opt = checkEnergies(opt.energies);
const energies = new LinearSpace(e_opt.min, e_opt.max, e_opt.points, e_opt.min == 0);
const LEN = energies.length;

assert(Array.isArray(opt.plots), "Plots field must be an array");

var i;
var j;
var pot;
var pot_i;
var length;
var mass;

const rows = energies.map(e => e.toPrecision(6));
const P = opt.plots.length;

for(j=0; j<P; j++) {
    pot = opt.plots[j].potential * eV2Ry;
    length = opt.plots[j].length * A2au;
    mass = parseMass(opt.plots[j].mass);
    pot_i = energies.indexOf(pot);

    i=0;
    if(pot_i !== -1) {
        for(; i<pot_i; i++) rows[i] += '\t' + transmission(energies[i], pot, length, mass).toPrecision(6);
        rows[pot_i] += '\t' + transmission_pot(pot, length, mass).toPrecision(6);
        i = pot_i + 1;
    }
    for(; i<LEN; i++) rows[i] += '\t' + transmission(energies[i], pot, length, mass).toPrecision(6);
}

writeFileSync(`./data/${filename}.dat`,"energy\t" + opt.plots.map(p => p.name).join('\t') + '\n' + rows.join('\n'));
console.log('Done!');



