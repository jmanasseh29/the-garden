export class LSystem {

    #axiom;
    #rules = {};
    #branchLen = 10;
    #branchLenVariance = 0;
    #angle = 30;
    #generations = 2;
    currSentence = "";

    iterations = 2;
    theta = 18;
    thetaRandomness = 0;
    angle = 0;
    scale = 4;
    scaleRandomness = 0;
    constantWidth = true;
    deltarota = 30;

    background = "#000000";
    general = "#111faa";
    random = true;
    alpha = 0.8;

    constructor(rules, axiom) {
        this.#rules = rules;
        this.#axiom = axiom;
    }

    generate() {
        this.currSentence = this.#axiom;
        let newString = "";
        for (let n = 0; n < this.iterations; n++) {
            for (let i = 0; i < this.currSentence.length; i++) {
                const c = this.currSentence.charAt(i);
                if (this.#rules.hasOwnProperty(c)) {
                    newString += this.#rules[c];
                } else {
                    newString += c;
                }
            }
            this.currSentence = newString;
        }
    }
}
