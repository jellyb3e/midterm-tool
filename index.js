function main() {
    fetch_param_elements();
}

function fetch_param_elements() {
    const genre_el = document.getElementById("genre");
    const descript_el = document.getElementById("descript");
    const genre_intensity_el = document.getElementById("genre-int");

    const submit = document.getElementById("gen-story");

    submit.addEventListener("click",() => {
        descriptiveness = parseFloat(descript_el.value);
        genre_intensity = parseFloat(genre_intensity_el.value);
        selected_genre = genre_el.value;

        generate_fantasy_name();
        generate_story();
    });
}

function generate_story() {
    set_initial_state();
    const world_details = generate_details();
    const available_actions = filter_actions_by_genre();
    const goal = rand_in_array(GENRE_GOALS[selected_genre]);
    console.log(goal);
    const plot = generate_plot(goal, state, available_actions);

    if (!plot) {
        console.log("Plot generation failed.");
        return;
    }

    const structure = group_by_plot_point(plot, available_actions);
    skin(structure, available_actions, world_details);
}