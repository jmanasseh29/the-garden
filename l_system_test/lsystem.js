export class LSystem {

    #axiom = "X";
    #rules = {};
    #branchLen = 10;
    #branchLenVariance = 0;
    #angle = 30;
    #generations = 2;
    currSentence = "";

    constructor() {

    }

    generate() {
        this.currSentence = this.#axiom;
        let newString = "";
        for (let i = 0; i < this.currSentence.length; i++) {
            const c = this.currSentence.charAt(i);
            if (this.#rules.hasOwnProperty(c)) {
                newString += this.#rules[c];
            } else {
                newString += c;
            }
        }
    }

    populate() {
        let vertices = [];

        for (let i = 0; i < this.currSentence.length; i++) {
            const c = this.currSentence.charAt(i);
            switch (c) {
                case 'F':

                    break;
                case 'X':

                    break;
                case '+':
                    console.log('Mangoes and papayas are $2.79 a pound.');
                    // expected output: "Mangoes and papayas are $2.79 a pound."
                    break;
                case '-':

                    break;
                case '[':

                    break;
                case ']':

                    break;
                default:
                    console.log(`Sorry, we are out of ${expr}.`);
            }
        }
    }
}