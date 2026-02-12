// turn that thang into text
function generate_details() {
    const genre_lang = LANGUAGE[selected_genre];
    const g_default = LANGUAGE[GENRE.DEFAULT];

    const locations = rand_in_array_multiple((hit()) ? genre_lang.place_names : g_default.place_names,3);
    return {
        protag: (hit()) 
            ? (selected_genre == GENRE.FANTASY) 
                ? generate_fantasy_name() 
                : rand_in_array(("protag_names" in genre_lang) ? genre_lang.protag_names : g_default.protag_names)
            : rand_in_array(g_default.protag_names),
        antag: (hit()) 
            ? (selected_genre != GENRE.ROMANCE) 
                ? `the ${rand_in_array(genre_lang.antag_names.adjs)} ${rand_in_array(genre_lang.antag_names.nouns)}`
                : rand_in_array(g_default.protag_names)
            : rand_in_array(g_default.protag_names),
        antag_location: locations[1],
        weapon: rand_in_array((hit()) ? genre_lang.weapon_names : g_default.weapon_names),
        weapon_location: locations[0],
        start_location: locations[2]
    };
}

function hit() {
    return Math.random() <= genre_intensity;
}

function fill_details(template, world_details) {
    let filled = template;

    for (let key in world_details) {
        const regex = new RegExp(`\\{${key}\\}`, "g");
        filled = filled.replace(regex, world_details[key]);
    }

    filled = filled.replace(/\{protag_location\}/g, state.protag_location);
    filled = filled.replace(/\{weapon_location\}/g, state.weapon_location);
    filled = filled.replace(/\{antag_location\}/g, state.antag_location);

    filled = filled.replace(/\{adj_item\}/g, () => gen_adjs("weapon") ? gen_adjs("weapon")+" " : "");
    filled = filled.replace(/\{adj_place\}/g, () => gen_adjs("place") ? gen_adjs("place")+" " : "");
    filled = filled.replace(/\{adv_movement\}/g, () => gen_advs("movement") ? gen_advs("movement")+" " : "");
    filled = filled.replace(/\{adv_character\}/g, () => gen_advs("character") ? gen_advs("character")+" " : "");

    return filled;
}

function skin(structure, available_actions, world_details) {
    for (let plot_point in structure) {
        const sentences = [];
        const plot_text = document.getElementById(plot_point + "-text");
        const plot_actions = structure[plot_point];

        for (let action_id of plot_actions) {
            const action = available_actions.find(a => a.id === action_id);

            if (!action || !action.text) continue;

            const sentence_template = rand_in_array(action.text[selected_genre]);
            const sentence = fill_details(sentence_template, world_details);

            sentences.push(sentence);
        }
        plot_text.textContent = sentences.join(" ");
    }
}