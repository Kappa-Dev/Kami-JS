function Tree(label,fth){//simple tree structure
    this.label=label;
    this.sons=[];
    this.fth=fth;
    this.addSon = function addSon(label){
        this.sons.push(new Tree(label,this));
    };
}