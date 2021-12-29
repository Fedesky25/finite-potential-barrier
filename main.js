import { table } from './utils/transmission.js';
import { writeFileSync } from 'fs';

/**@param {number[]} arr */
function arrToString(arr) { return arr.map(v => v.toPrecision(10)).join('\t') }

/**
 * @param {number} maxE [eV]
 * @param {number} v0 [eV]
 * @param {number[]} lengths [A]
 * @param {number} points 
 * @returns 
 */
function generate(maxE, v0, lengths, points) {
    var i;
    maxE *= 0.0734986176;
    v0 *= 0.0734986176;

    const data = table(0, maxE, points, v0, lengths.map(l => l*0.529177249));

    return "E\t" + lengths.map(l => 'l@'+l.toPrecision(4)).join('\t') + '\n'
    + data.map(v => {
        v[0] *= 13.605698066;
        for(var i=0; i<v.length; i++) v[i].toPrecision(6);
        return v.join('\t');
    }).join('\n');

    // const E = []
    // for(i=0; i<points; i++) E.push(maxE*(i+1)/points);
    // const table = table_E_l(E, v0, lengths);
    // return "E\t" + lengths.map((_, i) => `l_${i}`).join('\t') + '\n' 
    // + table.map((l,i) => `${(E[i]*13.605698066).toPrecision(6)}\t${arrToString(l)}`).join('\n');
}


const argv = process.argv.slice(2);
const opts = { maxE: 15, v0: 5, l: [1,2,3,4], points: 100, file: 'data' }
for(var i=0; i<argv.length; i++) {
    switch (argv[i]) {
        case "--max-E":
            opts.maxE = +argv[++i] || 15;
            break;
        case "--v0":
            opts.v0 = +argv[++i] || 5; 
            break;
        case "--points":
            opts.points = +argv[++i] || 100;
            break;
        case "--l":
        {
            let l; 
            opts.l = [];
            while(Number.isNaN(l=+argv[++i])) opts.l.push(l);
            break;   
        }
        default:
            console.log(`${argv[i]} is not a recognized argument`);
            break;
    }
}
writeFileSync(`./data/${opts.file}.dat`, generate(opts.maxE, opts.v0, opts.l, opts.points));
console.log('Done!');



