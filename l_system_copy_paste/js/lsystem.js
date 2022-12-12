export class LSystem {

    #axiom = "X";
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

}