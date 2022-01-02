import { transmission, transmission_pot } from './utils/transmission.js';
import { eV2Ry, A2au, Ry2eV } from "./utils/convert.js";
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
    else e.points = 250;
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

/** 
 * @param {{potential?: number, length?: number, mass?: number|string, 
 * plots: {name: string, potential?: number, length?: number, mass?: number|string}[]}} o
 */
function parsePlots(o) {
    const global_pot = o.potential
    ? (assert(typeof o.potential === "number" && o.potential>0, "Global potential must be a positive number"), o.potential * eV2Ry)
    : null;
    const gloabl_l = o.length 
    ? (assert(typeof o.length === "number" && o.length > 0, "Global barrier length must be a positive number"), o.length * A2au)
    : null;
    const global_m = o.mass ? parseMass(o.mass) : null;

    assert(Array.isArray(o.plots) && o.plots.length > 0, "Plots must be a non-empty array");
    return o.plots.map(p => {
        const pot = global_pot && !p.potential ? global_pot 
        : (assert(typeof p.potential === "number" && p.potential > 0, "Plot potential must be positive number"), p.potential*eV2Ry);
        const l = gloabl_l && !p.length ? gloabl_l 
        : (assert(typeof p.length === "number" && p.length > 0, "Plot barrier length must be positive number"), p.length*A2au);
        const m = global_m && !p.mass ? global_m : parseMass(p.mass);
        return { pot, l, m };
    });
}

const filename = process.argv[2];
assert(filename, "A file name must be provided");

const opt = JSON.parse(readFileSync(`./data/${filename}.json`, {encoding: "utf-8"}));
assert(typeof opt === "object", "Options must be and object");

const e_opt = checkEnergies(opt.energies);
const energies = new LinearSpace(e_opt.min*eV2Ry, e_opt.max*eV2Ry, e_opt.points, e_opt.min == 0);
const LEN = energies.length;

const plts = parsePlots(opt);
const P = plts.length;

var i;
var j;
var plt;
var pot_i;

const rows = energies.map(e => (e*Ry2eV).toPrecision(6));

for(j=0; j<P; j++) {
    plt = plts[j];
    pot_i = energies.indexOf(plt.pot);
    i=0;
    if(pot_i !== -1) {
        for(; i<pot_i; i++) rows[i] += '\t' + transmission(energies[j], plt.pot, plt.l, plt.m).toPrecision(6);
        rows[pot_i] += '\t' + transmission_pot(plt.pot, plt.l, plt.m).toPrecision(6);
        i = pot_i + 1;
    }
    for(; i<LEN; i++) rows[i] += '\t' + transmission(energies[i], plt.pot, plt.l, plt.m).toPrecision(6);
}

writeFileSync(`./data/${filename}.dat`,"energy\t" + opt.plots.map(p => p.name).join('\t') + '\n' + rows.join('\n'));
console.log('Done!');



