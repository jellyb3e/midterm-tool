function generate_fantasy_name(s = 0) {
    const sylls = (s == 0) ? get_sylls() : s;
    let name = ""
    let last_syll = "";
    let next_syll = "";
    let rerolls = 0;

    let i = 1;
    while (i <= sylls) {
        if (i == 1) {   // first
            next_syll = rand_in_array(SYLLS_1);
        } else if (i == sylls) {    // last
            next_syll = rand_in_array(SYLLS_N);
        } else if (i == sylls-1) {
            next_syll = rand_in_array(SYLLS_N_I);
        } else {    // middle
            next_syll = rand_in_array(SYLLS_I);
        }

        if (!last_syll || (last_syll[0].toLowerCase() != next_syll[0] && last_syll[1] != next_syll[1])) {
            name += next_syll;
            last_syll = next_syll;
            i++;
            rerolls = 0;
        } else {
            rerolls++; 
            if (rerolls > 4) {
                console.log("Defaulting to 2 syll name.")
                return generate_fantasy_name(2);
            } 
        }
    }

    if (sylls == 1) {
        name += rand_in_array(SYLLS_1_1);
    }

    return name;
}

function roll_dice(n_dice, n_sides) {
    let roll_total = 0;
    for (let i = 0; i < n_dice; i++) {
        roll_total += Math.floor(Math.random() * n_sides) + 1;
    }
    return roll_total;
}

function get_sylls() {
    return rand_in_array(SYLL_COUNT);
}

//#region DATA
const SYLL_COUNT = [
    1,
    2, 2,
    3, 3, 3,
    4, 4
]

const SYLLS_1 = [
    "Rhae", "Rha", "Rhy", "Dae", "Dy",
    "Vi", "Vy", "Lae", "Ly", "Ghae",
    "Sa", "Sae", "Se", "Sy",
    "Nae", "Ne", "Ny",
    "Kha", "Khai", "Ky",
    "Thae", "Tha", "The",
    "Ma", "My", "Ae",
    "Bae", "Be", "By"
]

const SYLLS_I = [
    "ny", "se", "ne", "nae", "me", "mae"
]

const SYLLS_N_I = [
    "se","ne","me","ly", "ny"
]

const SYLLS_N = [
    "ra", "ros", "ron", "mon", "lon",
    "ria", "rys", "gon", "gys", "dys",
    "lor", "vys", "var", "thys", "na",
    "lia", "gis", "lio", "rio"
]

const SYLLS_1_1 = [
    "le", "m", "l", "n", "s", "ne", "me", "se"
]
//#endregion