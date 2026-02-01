let plot_weights = {
    exp: 0,  // percentage of story dedicated to each plot point
    ris : 0,
    cli : 0,
    res : 0,   // falling action and resolution are combined :]
};

function main() {
    console.log("Loaded function main");
    const title = document.getElementById("site-title-text");

    document.title = siteTitle
    title.textContent = siteTitle;

    fetchDocumentElements();
}

function fetchDocumentElements() {
    const exp = document.getElementById("exp-weight");
    const ris = document.getElementById("ris-weight");
    const cli = document.getElementById("cli-weight");
    const res = document.getElementById("res-weight");
    const submit = document.getElementById("gen-story");
    const storySent = document.getElementById("num-sent");
    const desc = document.getElementById("descript");
    const lungCap = document.getElementById("lung-cap");
    const genreInt = document.getElementById("genre-int");
    const genreChoice = document.getElementById("genre");

    exp.addEventListener("input", () => {checkInput(exp);});
    ris.addEventListener("input", () => {checkInput(ris);});
    cli.addEventListener("input", () => {checkInput(cli);});
    res.addEventListener("input", () => {checkInput(res);});
    submit.addEventListener("click",() => {
        normalizeWeights();
        story_length = parseFloat(storySent.value);
        descriptiveness = parseFloat(desc.value);
        lung_capacity = parseFloat(lungCap.value);
        genreIntensity = parseFloat(genreInt.value);
        genre = genreChoice.value;
        console.log(genre);

        distributeSentences();
        generateStory();
    });
}

function checkInput(el) {
    const val = parseFloat(el.value);
    const min = parseFloat(el.min);
    const max = parseFloat(el.max);

    if (val < min) {
        el.value = el.min;
    } else if (val > max) {
        el.value = el.max;
    } else {
        plot_weights[el.name] = val;
    }
}

function normalizeWeights() {
    let total = 0;
    for (let weight in plot_weights) {
        total += plot_weights[weight];
    }
    
    if (total == 1) {return;}
    else if (total == 0) {
        plot_weights.exp = .25;
        plot_weights.ris = .4;
        plot_weights.cli = .2;
        plot_weights.res = .15;
    } else {
        for (let weight in plot_weights) {
            plot_weights[weight] /= total;
        }
    }
}