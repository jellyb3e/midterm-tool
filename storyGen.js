let preps = 0;
let conjuncts = 0;
let plot_point_sent = {
    exp: 0,
    ris: 0,
    cli: 0,
    res: 0
};
let story_length = 0;
let descriptiveness = 0;
let lung_capacity = 0;
let currPoint = 'exp';
let genreIntensity = .5;
let genre = "";

// min-inclusive, max-exclusive
function randInRange(min,max) {
    if (max == undefined) {
        max = min;
        min = 0;
    }

    return Math.floor(Math.random() * (max - min)) + min;
}

function generateStory() {
    for (let point in plot_point_sent) {
        currPoint = point;
        const pointText = document.getElementById(point + "-text");
        pointText.textContent = "";

        for (let i = 0; i < plot_point_sent[point]; i++) {
            pointText.textContent += generateSentence();
        }
    }
}

function clamp(value,min,max) {
    return (value > max) ? max : (value < min) ? min : value;
}

function generateSentence() {
    const start = new Subject();
    preps = 0;
    conjuncts = 0;
    
    generateCluster(start);
    console.log("Sentence generated successfully.");

    return getSentence(start);
}

function generateWord(part_of_speech) {
    const part = language[part_of_speech];
    let options = [];

    if (genre && part[genre] && Math.random() < genreIntensity) {
        const g_points = part[genre];

        if (Array.isArray(g_points)) {
            options.push(...g_points);
        } else if (g_points[currPoint] && Array.isArray(g_points[currPoint])) {
            options.push(...g_points[currPoint]);
        }

        if (options.length === 0) {
            const n_points = part.neutral;
            if (Array.isArray(n_points)) options.push(...n_points);
            else if (n_points[currPoint] && Array.isArray(n_points[currPoint])) options.push(...n_points[currPoint]);
        }
    } else {
        const n_points = part.neutral;
        if (Array.isArray(n_points)) options.push(...n_points);
        else if (n_points[currPoint] && Array.isArray(n_points[currPoint])) options.push(...n_points[currPoint]);
    }

    if (options.length == 0) {
        console.log("whar happing");
        return '';
    }

    return options[randInRange(options.length)];
}


function makeNodeOfType(type) {
    switch (type) {
        case 'articles': return new Article();
        case 'adjectives': return new Adjective();
        case 'adverbs': return new Adverb();
        case 'verbs': return new Verb();
        case 'objects': return new ObjectNode();
        case 'subjects': return new Subject();
        case 'prepositions': return new Preposition();
        case 'conjunctions': return new Conjunction();
        case 'negation': return new Negation();
        default:
            console.log("Error: unknown node type. defaulting to object");
            return new ObjectNode();
    }
}

function generateCluster(node) {
    for (const need of node.needs) {
        const child = makeNodeOfType(need);
        node.next[need] = child;
        generateCluster(child);
    }

    for (const allowance of node.allows) {
        if (allowance == 'negation') {
            if (Math.random() >= 0.5) continue;
        } else {
            let probability = (allowance == 'prepositions' || allowance == 'conjunctions') ? lung_capacity : descriptiveness;

            if (Math.random() >= probability) continue;

            if (allowance == 'prepositions') {
                if (preps >= max_preps) continue;
                preps++;
            } else if (allowance == 'conjunctions') {
                if (conjuncts >= max_conjuncts) continue;
                conjuncts++;
            }
        }

        const child = makeNodeOfType(allowance);
        node.next[allowance] = child;
        generateCluster(child);
    }
}

function getSentence(startNode) {
    const s_arr = startNode.getTextCluster();

    for (let i = 0; i < s_arr.length - 1; i++) {
        if (s_arr[i].toLowerCase() === "a" && /^[aeiou]/i.test(s_arr[i + 1])) {
            s_arr[i] = "an";
        }
    }
    s_arr[0] = s_arr[0].charAt(0).toUpperCase() + s_arr[0].slice(1);
    s_arr.push(".");
    const s_format = " " + s_arr.join(" ").replace(/\s+([,.])/g, "$1");

    return s_format;
}

function distributeSentences() {
    console.log("story length: " + story_length);

    let s_total = 0;
    for (let point in plot_point_sent) {
        let s = Math.floor(plot_weights[point] * story_length);

        plot_point_sent[point] = s;
        s_total += s;
    }

    if (s_total < story_length) {
        const half_points = (story_length-s_total)/2.0;
        plot_point_sent.exp += Math.floor(half_points);
        plot_point_sent.res += Math.ceil(half_points);
    }

    for (let point in plot_point_sent) {
        console.log(point + ": " + plot_point_sent[point]);
    }
}