function main() {
    fetch_param_elements();
}

function fetch_param_elements() {
    const genre_el = document.getElementById("genre");
    const descript_el = document.getElementById("descript");
    const genre_intensity_el = document.getElementById("genre-int");

    const bravery_el = document.getElementById("bravery");
    const strength_el = document.getElementById("strength");
    const charm_el = document.getElementById("charm");

    const protag_el = document.getElementById("protag-name");
    const antag_el = document.getElementById("antag-name");
    const protag_regen_el = document.getElementById("regen-protag-name");
    const antag_regen_el = document.getElementById("regen-antag-name");

    const submit = document.getElementById("gen-story");

    generate_protag_name();
    generate_antag_name();
    protag_el.textContent = protag_name;
    antag_el.textContent = antag_name;

    genre_el.addEventListener("change", () => {
        selected_genre = genre_el.value;
    });

    descript_el.addEventListener("input", () => {
        descriptiveness = parseFloat(descript_el.value);
    });

    genre_intensity_el.addEventListener("input", () => {
        genre_intensity = parseFloat(genre_intensity_el.value);
    });

    bravery_el.addEventListener("input", () => {
        STATS.protag.bravery = parseFloat(bravery_el.value);
        STATS.protag.cowardice = 1 - STATS.protag.bravery;
    });

    strength_el.addEventListener("input", () => {
        STATS.protag.strength = parseFloat(strength_el.value);
        STATS.protag.weakness = 1 - STATS.protag.strength;
    });

    charm_el.addEventListener("input", () => {
        STATS.protag.charm = parseFloat(charm_el.value);
        STATS.protag.awkwardness = 1 - STATS.protag.charm;
    });

    protag_regen_el.addEventListener("click", () => {
        generate_protag_name();
        protag_el.textContent = protag_name;
    });

    antag_regen_el.addEventListener("click", () => {
        generate_antag_name();
        antag_el.textContent = antag_name;
    });

    submit.addEventListener("click", () => {
        generate_story();
    });
}

function generate_story() {
    set_initial_state();
    const world_details = generate_details();
    const available_actions = filter_actions_by_genre();
    const goal = filter_goals_by_stats();
    console.log(goal);
    const plot = generate_plot(goal, state, available_actions);

    if (!plot) {
        console.log("Plot generation failed.");
        return;
    }

    const structure = group_by_plot_point(plot, available_actions);
    skin(structure, available_actions, world_details);
}