const language = {
    nouns: {
        neutral: {
            exp: ['person','place','animal','house','tree'],
            ris: ['path','object','door','room'],
            cli: ['thing','figure','moment'],
            res: ['home','memory','end']
        },
        fantasy: {
            exp: ['kingdom','wizard','forest','castle'],
            ris: ['quest','dragon','spell','knight'],
            cli: ['battle','beast','blade','fire'],
            res: ['crown','peace','legend']
        },
        horror: {
            exp: ['house','hallway','shadow','room'],
            ris: ['noise','blood','door','footstep'],
            cli: ['monster','corpse','scream'],
            res: ['silence','grave','dark']
        },
        romance: {
            exp: ['meeting','smile','voice'],
            ris: ['touch','distance','feeling'],
            cli: ['heart','kiss','truth'],
            res: ['promise','memory','love']
        },
        kids: {
            exp: ['friend','dog','toy'],
            ris: ['game','robot','idea'],
            cli: ['problem','monster','surprise'],
            res: ['party','hug','home']
        }
    },

    verbs: {
        neutral: {
            exp: ['walks','looks','waits'],
            ris: ['moves','finds','follows'],
            cli: ['runs','falls','acts'],
            res: ['rests','returns','stays']
        },
        fantasy: {
            exp: ['wanders','studies'],
            ris: ['seeks','rides','casts'],
            cli: ['fights','strikes','defeats'],
            res: ['rules','guards','remembers']
        },
        horror: {
            exp: ['listens','stands'],
            ris: ['creeps','watches','follows'],
            cli: ['attacks','screams','bleeds'],
            res: ['escapes','vanishes','ends']
        },
        romance: {
            exp: ['notices','meets'],
            ris: ['misses','longs','waits'],
            cli: ['confesses','embraces','chooses'],
            res: ['stays','forgives','loves']
        },
        kids: {
            exp: ['plays','laughs'],
            ris: ['runs','builds','tries'],
            cli: ['solves','wins','helps'],
            res: ['shares','celebrates','sleeps']
        }
    },

    adjectives: {
        neutral: {
            exp: ['small','quiet','new'],
            ris: ['strange','close'],
            cli: ['big','sudden'],
            res: ['calm','soft']
        },
        fantasy: {
            exp: ['ancient','mystic'],
            ris: ['enchanted','golden'],
            cli: ['burning','legendary'],
            res: ['peaceful','eternal']
        },
        horror: {
            exp: ['dark','empty'],
            ris: ['cold','watching'],
            cli: ['bloody','twisted'],
            res: ['silent','still']
        },
        romance: {
            exp: ['gentle','warm'],
            ris: ['aching','uncertain'],
            cli: ['honest','bare'],
            res: ['safe','sweet']
        },
        kids: {
            exp: ['fun','happy'],
            ris: ['silly','loud'],
            cli: ['scary','huge'],
            res: ['nice','cozy']
        }
    },

    adverbs: {
        neutral: {
            exp: ['slowly'],
            ris: ['carefully'],
            cli: ['suddenly'],
            res: ['quietly']
        },
        fantasy: {
            cli: ['bravely']
        },
        horror: {
            ris: ['silently'],
            cli: ['frantically']
        },
        romance: {
            cli: ['tenderly']
        },
        kids: {
            ris: ['happily'],
            cli: ['excitedly']
        }
    },

    articles: {
        neutral: ['the','a']
    },

    conjunctions: {
        neutral: ['and','or']
    },

    prepositions: {
        neutral: ['but','yet']
    },

    negation: {
        neutral: ['doesnt']
    }
};


const part_rules = {
    subjects: { needs: ['articles','verbs'], allows: ['adjectives'] },
    objects:  { needs: ['articles'], allows: ['adjectives','prepositions'] },
    verbs:    { needs: [], allows: ['adverbs','objects','conjunctions','negation'] },
    adjectives:{ needs: [], allows: [] },
    adverbs:  { needs: [], allows: [] },
    articles: { needs: [], allows: [] },
    conjunctions: { needs: ['verbs'], allows: [] },
    prepositions: { needs: ['subjects'], allows: [] },
    negation: { needs: [], allows: [] }
};

class Node {
    type;       // subject, object, verb, article, etc
    word;
    needs;   // what comes after it / is attached to it
    allows;
    next;   // next nodes (an object organizing attached parts of speech)
    
    constructor (t,w,n,a) {
        this.type = t;
        this.word = w;
        this.needs = n;
        this.allows = a;
        this.next = {
            articles: undefined,
            adjectives: undefined,
            adverbs: undefined,
            prepositions: undefined,
            subjects: undefined,
            verbs: undefined,
            conjunctions: undefined,
            objects: undefined,
            negation: undefined
        };
    }

    getTextCluster() {
        return [this.word];
    }
}

class Noun extends Node {
    constructor(t,n,a) {
        const w = generateWord("nouns");
        super(t,w,n,a);
    }

    getTextCluster() {
        let cluster = [];
        if (this.next.articles) cluster.push(...this.next.articles.getTextCluster());
        if (this.next.adjectives) cluster.push(...this.next.adjectives.getTextCluster());
        cluster.push(this.word);

        return cluster;
    }
}

class ObjectNode extends Noun {
    constructor() {
        super('objects',part_rules.objects.needs,part_rules.objects.allows);
    }

    getTextCluster() {
        let cluster = super.getTextCluster();
        if (this.next.prepositions) cluster.push(...this.next.prepositions.getTextCluster());
        return cluster;
    }
}

class Subject extends Noun {
    constructor() {
        super('subjects',part_rules.subjects.needs,part_rules.subjects.allows);
    }

    getTextCluster() {
        let cluster = super.getTextCluster();
        cluster.push(...this.next.verbs.getTextCluster());
        return cluster;
    }
}

class Verb extends Node {
    constructor() {
        const w = generateWord("verbs");
        super('verbs',w,part_rules.verbs.needs,part_rules.verbs.allows);
    }

    getTextCluster() {
        let cluster = [];
        if (this.next.adverbs) cluster.push(...this.next.adverbs.getTextCluster());
        if (this.next.negation) {
            cluster.push(...this.next.negation.getTextCluster());
            this.word = this.word.slice(0,this.word.length-1);
        }
        cluster.push(this.word);
        if (this.next.objects) cluster.push(...this.next.objects.getTextCluster());
        if (this.next.conjunctions) cluster.push(...this.next.conjunctions.getTextCluster());

        return cluster;
    }
}

class Adverb extends Node {
    constructor() {
        const w = generateWord("adverbs");
        super('adverbs',w,part_rules.adverbs.needs,part_rules.adverbs.allows);
    }

    getTextCluster() {
        return [this.word];
    }
}

class Adjective extends Node {
    constructor() {
        const w = generateWord("adjectives");
        super('adjectives',w,part_rules.adjectives.needs,part_rules.adjectives.allows);
    }

    getTextCluster() {
        let cluster = [];
        if (this.next.adverbs) cluster.push(...this.next.adverbs.getTextCluster());
        cluster.push(this.word);

        return cluster;
    }
}

class Article extends Node {
    constructor() {
        const w = generateWord("articles");
        super('articles',w,part_rules.articles.needs,part_rules.articles.allows);
    }

    getTextCluster() {
        return [this.word];
    }
}

class Preposition extends Node {
    constructor() {
        const w = generateWord("prepositions");
        super('prepositions',w,part_rules.prepositions.needs,part_rules.prepositions.allows);
    }

    getTextCluster() {
        let cluster = [",",this.word];
        if (this.next.subjects) cluster.push(...this.next.subjects.getTextCluster());

        return cluster;
    }
}

class Conjunction extends Node {
    constructor() {
        const w = generateWord("conjunctions");
        super('conjunctions',w,part_rules.conjunctions.needs,part_rules.conjunctions.allows);
    }

    getTextCluster() {
        let cluster = [this.word]
        cluster.push(...this.next.verbs.getTextCluster());

        return cluster;
    }
}

class Negation extends Node {
    constructor() {
        const w = generateWord("negation");
        super('articles',w,part_rules.negation.needs,part_rules.negation.allows);
    }

    getTextCluster() {
        return [this.word];
    }
}