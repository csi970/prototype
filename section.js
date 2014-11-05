var Section = function Section() {
    this.measures = [];
    this.firstMeasure = -1;
    this.lastMeasure = -1;

    this.addMeasure = function(measure, measureNum) {
        if (this.firstMeasure === -1) {
            this.firstMeasure = measureNum;
        }
        this.lastMeasure = measureNum;
        this.measures.push(measure);
        return this;
    };

    this.getLength = function() {
        return this.measures.length;
    };

};

module.exports = Section;
