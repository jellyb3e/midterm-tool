const PLOT = {   
    EXP: "exp",
    RIS: "ris",
    CLI: "cli",
    FAL: "fal"
}
const GENRE = {
    FANTASY: "fantasy",
    HORROR: "horror",
    ROMANCE: "romance",
    DEFAULT: "default"
}

let selected_genre = GENRE.FANTASY;
let descriptiveness = 1.0;
let genre_intensity = 0.5;
const max_adjs = 2;
const max_advs = 1;
const state = {};

const GENRE_GOALS = {
    [GENRE.FANTASY]: [
        { peace_restored: true },
        { protag_crowned: true },
        { artifact_recovered: true }
    ],

    [GENRE.HORROR]: [
        { peace_restored: true },
        { protag_escaped: true },
        { protag_corrupted: true }
    ],

    [GENRE.ROMANCE]: [
        { relationship_started: true },
        { relationship_rejected: true },
        { friendship_formed: true }
    ]
};

const ACTION_LIB = [
    {
        id: "start",
        plot_point: PLOT.EXP,
        genre: [GENRE.FANTASY, GENRE.HORROR, GENRE.ROMANCE],
        prereq: {},
        effects: { protag_at_home: true },
        set: (state) => {
            state.protag_at_home = true;
        },
        text: {
            [GENRE.FANTASY]: ["The story begins with {protag} in the {adj_place}{start_location}."],
            [GENRE.HORROR]: ["The story begins with {protag} in the {adj_place}{start_location} of an abandoned house, rumored to be the home of {antag}."],
            [GENRE.ROMANCE]: ["The story begins with {protag} in the {start_location}."]
        }
    },
    {
        id: "travel_to_weapon",
        plot_point: PLOT.RIS,
        genre: [GENRE.FANTASY, GENRE.HORROR],
        prereq: { protag_alive: true, protag_at_home: true },
        effects: { protag_at_weapon: true },
        set: (state) => {
            state.protag_at_weapon = true;
            state.protag_at_antag = state.weapon_location == state.antag_location;
        },
        text: {
            [GENRE.FANTASY]: ["{protag} travels to the {adj_place}{weapon_location}."],
            [GENRE.HORROR]: ["{protag} goes to the {adj_place}{weapon_location} to find a weapon."],
        }
    },
    {
        id: "find_weapon",
        plot_point: PLOT.RIS,
        genre: [GENRE.FANTASY, GENRE.HORROR],
        prereq: { protag_alive: true, protag_at_weapon: true },
        effects: { protag_equip: true },
        set: (state) => {
            state.protag_equip = true;
        },
        text: {
            [GENRE.FANTASY]: [
                "{protag} discovers a {adj_item}{weapon} in the {adj_place}{weapon_location}.",
                "In the {adj_place}{weapon_location}, {protag} finds a {adj_item}{weapon}."
            ],
            [GENRE.HORROR]: [
                "{protag} discovers a {weapon} in the {adj_place}{weapon_location}.",
                "In the {adj_place}{weapon_location}, {protag} finds a {weapon}."
            ]
        }
    },
    {
        id: "travel_to_antag",
        plot_point: PLOT.RIS,
        genre: [GENRE.FANTASY, GENRE.HORROR],
        prereq: { protag_equip: true },
        effects: { protag_at_antag: true },
        set: (state) => {
            state.protag_at_antag = true;
            state.protag_at_weapon = state.antag_location == state.weapon_location;
        },
        text: {
            [GENRE.FANTASY]: ["Now armed with the {weapon}, {protag} travels to the {adj_place}{antag_location} in search of {antag}."],
            [GENRE.HORROR]: ["Now armed with the {weapon}, {protag} travels to the {adj_place}{antag_location} in search of {antag}."]        
        }
    },
    {
        id: "kill_antag",
        plot_point: PLOT.CLI,
        genre: [GENRE.FANTASY, GENRE.HORROR],
        prereq: { protag_at_antag: true },
        effects: { antag_alive: false },
        set: (state) => { state.antag_alive = false; },
        text: {
            [GENRE.FANTASY]: [
                "In the {antag_location}, a fight ensues between {protag} and {antag}. {protag} {adv_character}strikes down {antag} in a heated battle.",
                "In the {antag_location}, a fight ensues between {protag} and {antag}. With a final blow, {protag} defeats {antag}."
            ],
            [GENRE.HORROR]: [
                "{protag} {adv_movement}sneaks up on {antag} and {adv_character}strikes them down.",
                "In a heated struggle, {protag} defeats {antag}."
            ]
        }
    },
    {
        id: "antag_defeated",
        plot_point: PLOT.FAL,
        genre: [GENRE.FANTASY, GENRE.HORROR],
        prereq: { antag_alive: false },
        effects: { peace_restored: true },
        set: (state) => { state.peace_restored = true; },
        text: {
            [GENRE.FANTASY]: [
                "With {antag} defeated, peace is restored in the land.",
                "With peace restored, the fight between {protag} and {antag} soon becomes a distant memory."
            ],
            [GENRE.HORROR]: [
                "With {antag} defeated, {protag} is filled with relief and goes home.",
                "As {protag} heads home, the fight between them and {antag} soon becomes a distant memory."
            ]
        }
    },
    {
        id: "meet_love_interest",
        plot_point: PLOT.EXP,
        genre: [GENRE.ROMANCE],
        prereq: { protag_at_home: true },
        effects: { met_love_interest: true },
        set: (state) => {
            state.met_love_interest = true;
        },
        text: {
            [GENRE.ROMANCE]: [
                "One day, {protag} meets {antag} in the {start_location}.",
                "In the {start_location}, {protag} crosses paths with {antag}."
            ]
        }
    },
    {
        id: "spend_time_together",
        plot_point: PLOT.RIS,
        genre: [GENRE.ROMANCE],
        prereq: { met_love_interest: true },
        effects: { bond_formed: true },
        set: (state) => {
            state.bond_formed = true;
        },
        text: {
            [GENRE.ROMANCE]: [
                "{protag} and {antag} begin spending more time together in the {adj_place}{weapon_location}.",
                "Days pass, and {protag} finds themselves drawn to {antag}."
            ]
        }
    },
    {
        id: "romantic_conflict",
        plot_point: PLOT.CLI,
        genre: [GENRE.ROMANCE],
        prereq: { bond_formed: true },
        effects: { feelings_confessed: true },
        set: (state) => {
            state.feelings_confessed = true;
        },
        text: {
            [GENRE.ROMANCE]: [
                "After a tense moment, {protag} {adv_character}confesses their feelings to {antag}.",
                "At the height of their emotions, {protag} {adv_character}admits the truth of their heart to {antag}."
            ]
        }
    },
    {
        id: "romance_resolved",
        plot_point: PLOT.FAL,
        genre: [GENRE.ROMANCE],
        prereq: { feelings_confessed: true },
        effects: { relationship_started: true },
        set: (state) => {
            state.relationship_started = true;
        },
        text: {
            [GENRE.ROMANCE]: [
                "{protag} and {antag} decide to stay together, beginning a new chapter of their lives.",
                "Hand in hand, {protag} and {antag} walk forward together."
            ]
        }
    },
    {
        id: "crown_protag",
        plot_point: PLOT.FAL,
        genre: [GENRE.FANTASY],
        prereq: { antag_alive: false },
        effects: { protag_crowned: true },
        set: (state) => { state.protag_crowned = true; },
        text: {
            [GENRE.FANTASY]: [
                "With {antag} defeated, {protag} is crowned ruler of the land.",
                "With {antag} defeated, {protag} ascends the throne, bringing a new age to the kingdom."
            ]
        }
    },
    {
        id: "recover_artifact",
        plot_point: PLOT.CLI,
        genre: [GENRE.FANTASY],
        prereq: { protag_equip: true },
        effects: { artifact_recovered: true },
        set: (state) => { state.artifact_recovered = true; },
        text: {
            [GENRE.FANTASY]: [
                "{protag} claims the legendary {weapon}, restoring hope to the land.",
                "With the {adj_item}{weapon} in hand, {protag} fulfills the ancient prophecy."
            ]
        }
    },
    {
        id: "escape_antag",
        plot_point: PLOT.CLI,
        genre: [GENRE.HORROR],
        prereq: { protag_at_antag: true },
        effects: { protag_escaped: true },
        set: (state) => { state.protag_escaped = true; },
        text: {
            [GENRE.HORROR]: [
                "{protag} is hunted down by {antag} in a heated chase. {protag} barely escapes from {antag} and flees into the night.",
                "{protag} is hunted down by {antag} in a heated chase. With heart pounding, {protag} barely escapes the grasp of {antag}."
            ]
        }
    },
    {
        id: "corrupted_by_antag",
        plot_point: PLOT.CLI,
        genre: [GENRE.HORROR],
        prereq: { protag_at_antag: true },
        effects: { protag_corrupted: true },
        set: (state) => { state.protag_corrupted = true; },
        text: {
            [GENRE.HORROR]: [
                "{antag} overwhelms {protag}, twisting them into something unrecognizable.",
                "By the end of the night, {protag} has become part of {antag}'s dark domain."
            ]
        }
    },
    {
        id: "rejected_confession",
        plot_point: PLOT.CLI,
        genre: [GENRE.ROMANCE],
        prereq: { feelings_confessed: true },
        effects: { relationship_rejected: true },
        set: (state) => { state.relationship_rejected = true; },
        text: {
            [GENRE.ROMANCE]: [
                "{protag} {adv_character}confesses their feelings, but {antag} {adv_character}turns them down.",
                "Though {protag} {adv_character}speaks from the heart, {antag} does not feel the same."
            ]
        }
    },
    {
        id: "friendship_outcome",
        plot_point: PLOT.FAL,
        genre: [GENRE.ROMANCE],
        prereq: { relationship_rejected: true },
        effects: { friendship_formed: true },
        set: (state) => { state.friendship_formed = true; },
        text: {
            [GENRE.ROMANCE]: [
                "Though their romance was not meant to be, {protag} and {antag} remain {adj_place}friends.",
                "{protag} and {antag} part with {adj_place}feelings, their friendship stronger than before."
            ]
        }
    }
];

const LANGUAGE = {
    [GENRE.DEFAULT]: {
        protag_names: [
            "James","John","Robert","Michael","William","Henry","Oliver","Jasper","Leon","Theo",
            "Ethan","Noah","Liam","Lucas","Miles","Felix","Caleb","Rowan","Silas","Asher",
            "Ezra","Owen","Julian","Arthur","Elliot","August","Levi","Finn","Kai","Oscar",
            "Hugo","Alden","Bennett","Callum","Desmond","Emmett","Gideon","Jonah","Luca","Orion",
            "Reed","Soren","Tobias","Wesley","Adrian","Beckett","Declan","Everett","Micah","River",
            "Elizabeth","Jennifer","Margaret","Charlotte","Olivia","Olive","Iris","Hazel","Lily","Violet",
            "Ruby","Clara","Nora","Eleanor","Lucy","Maya","Willow","Ivy","Stella","Aria",
            "Alice","Eliza","Sadie","Cora","Maeve","June","Rose","Poppy","Sienna","Aurora",
            "Freya","Isla","Daisy","Nova","Wren","Thea","Luna","Mabel","Esme","Delilah",
            "Phoebe","Sylvie","Tessa","Elodie","Briar","Marin","Calla","Zara","Skye","Rowan"
        ],
        place_names: ["beautiful city of Fresno, California","store","house","business","school","mall","Staples","junkyard","sewer","park","restaurant","graveyard","McDonald's","restroom","gas station", "autobody shop", "playground"],
        weapon_names: ["gun","knife","pair of scissors", "stapler", "brick", "rubber ball", "chopstick", "fork"],
        adjectives: {
            place: ["nice", "cute", "fun", "weird", "normal", "uninteresting", "boring", "unusual", "interesting"],
            weapon: ["nice", "cute", "fun", "weird", "normal", "uninteresting", "boring", "unusual", "interesting"]
        },
        adverbs: {
            character: ["oddly","creepily","sweetly","funnily","generously"],
            movement: ["quietly", "swiftly", "quickly", "loudly", "erratically", "haphazardly"]
        }
    },
    [GENRE.FANTASY]: {
        antag_names: {
            adjs: ["Hollow", "Driftwood", "Blood", "Mad"],
            nouns: ["Prince", "King", "Mage", "Witch"]
        },
        place_names: ["forest", "ruins", "village", "cavern"],
        weapon_names: ["sword","blade","bow","spell"],
        adjectives: {
            place: ["weathered", "ancient", "mysterious", "forbidden", "abandoned", "forgotten"],
            weapon: ["weathered", "ancient", "mysterious", "gleaming", "cursed", "shining", "tattered", "divine"]
        },
        adverbs: {
            character: ["valiantly", "fiercely", "forcefully"],
            movement: ["quietly", "swiftly"]
        }
    },
    [GENRE.HORROR]: {
        antag_names: {
            adjs: ["Blue", "LA", "Wailing", "Lost", "Wicked", "Shrieking", "White", "Bitey"],
            nouns: ["Crawler", "Vampire", "Witch", "Phantom", "Walker"]
        },
        place_names: ["living room", "bedroom", "kitchen", "bathroom", "attic", "basement"],
        weapon_names: ["vial of holy water", "stake", "kitchen knife", "handful of their bare hands", "ritual book"],
        adjectives: {
            place: ["rundown", "tattered", "worn", "filthy", "creepy", "eerie"],
            weapon: []
        },
        adverbs: {
            character: ["bravely", "fearlessly", "forcefully"],
            movement: ["quietly", "swiftly", "carefully", "sneakily"]
        }
    },
    [GENRE.ROMANCE]: {
        place_names: ["coffee shop", "park", "bar", "grocery store"],
        weapon_names: [],
        adjectives: {
            place: ["cozy", "quiet", "sunlit", "crowded", "charming", "warm"],
            weapon: []
        },
        adverbs: {
            character: ["softly", "warmly", "nervously", "gently", "sheepishly", "passionately"],
            movement: ["slowly", "quietly", "casually"]
        }
    }
};