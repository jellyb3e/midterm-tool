// POCL logic
function filter_actions_by_genre() {
    return ACTION_LIB.filter(a => a.genre.includes(selected_genre));
}

function set_initial_state() {
    state.protag_alive = true;
    state.antag_alive = true;
    state.protag_equip = false;
    state.antag_equip = false;
    state.protag_at_weapon = false;
    state.protag_at_antag = false;
    state.protag_at_home = false;
    state.peace_restored = false;

    state.met_love_interest = false;
    state.bond_formed = false;
    state.feelings_confessed = false;

    state.protag_crowned = false;
    state.artifact_recovered = false;

    state.protag_escaped = false;
    state.protag_corrupted = false;

    state.relationship_rejected = false;
    state.friendship_formed = false;
    state.relationship_started = false;

    console.log("State set to default.")
}

function goal_met(curr_goal, curr_state) {
    for (let s in curr_goal) {
        const val = curr_goal[s];
        if (typeof val === "function") {
            if (!val(curr_state)) return false;
        } else {
            if (curr_state[s] !== val) return false;
        }
    }
    return true;
}

function prereqs_met(action, curr_state) {
    for (let p in action.prereq) {
        const val = action.prereq[p];
        if (typeof val === "function") {
            if (!val(curr_state)) return false;
        } else {
            if (curr_state[p] !== val) return false;
        }
    }
    return true;
}

function achieves_goal(action, curr_goal) {
    const effects = action.effects;
    if (!effects) return false;
    for (let s in curr_goal) {
        if (s in effects && effects[s] == curr_goal[s]) {
            return true;
        }
    }
    return false;
}

function apply_action(action, curr_state) {
    action.set(curr_state);
}

function generate_plot(curr_goal, curr_state, curr_actions, visited_goals = []) {
    const story = [];

    const goal_key = JSON.stringify(curr_goal);
    if (visited_goals.includes(goal_key)) {
        console.log("Cycle detected.");
        return null;
    }
    visited_goals.push(goal_key);

    while (!goal_met(curr_goal, curr_state)) {
        const options = curr_actions.filter(a => achieves_goal(a, curr_goal));

        if (options.length == 0) {
            console.log("No action can achieve target goal: ");
            return null;
        }

        const action = options[Math.floor(Math.random() * options.length)];

        if (!prereqs_met(action, curr_state)) {
            const sub_goal = action.prereq;
            const plot_point = generate_plot(sub_goal, curr_state, curr_actions, visited_goals);

            if (!plot_point) return null;

            story.push(...plot_point);
        }

        apply_action(action, curr_state);
        story.push(action.id);
    }

    return story;
}

function group_by_plot_point(story, available_actions) {
    const structure = {
        [PLOT.EXP]: [],
        [PLOT.RIS]: [],
        [PLOT.CLI]: [],
        [PLOT.FAL]: []
    };

    for (let action_id of story) {
        const action = available_actions.find(a => a.id == action_id);

        if (!action) {
            console.log(`Unknown action with ID: ${action_id}.`);
            continue;
        }

        if (!structure[action.plot_point]) {
            console.log("ERROR: invalid plot_point:", action.plot_point, "for", action_id);
            continue;
        }

        structure[action.plot_point].push(action_id);
    }

    return structure;
}

function rand_in_array(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// return n random array elements
function rand_in_array_multiple(arr, n) {
    if (n == 0) return [];

    const shuffled_arr = [...arr].sort(() => Math.random() - 0.5);
    return shuffled_arr.slice(0, n);
}

function get_num_descriptors(max) {
    let n = 0;
    for (let i = 0; i < max; i++) {
        if (Math.random() < descriptiveness) {
            n++;
        }
    }
    return n;
}

function gen_adjs(adj_type) {
    const arr = LANGUAGE[(hit()) ? selected_genre : GENRE.DEFAULT].adjectives[adj_type];
    const n = get_num_descriptors(max_adjs);
    return rand_in_array_multiple(arr, n).join(", ");
}

function gen_advs(adv_type) {
    const arr = LANGUAGE[(hit()) ? selected_genre : GENRE.DEFAULT].adverbs[adv_type];
    const n = get_num_descriptors(max_advs);
    return rand_in_array_multiple(arr, n).join(", ");
}