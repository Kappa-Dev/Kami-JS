function UndoRedoStack(){//generic implementation of undo redo as graph rw rules
    var undo_stack =[];//a stack of undo
    var redo_stack =[];//a stack of redo
    var sub_stack = {};//list of nuggets stacks and position {stack:list,pos:int}
    this.stack = function stack(el){//el is a delta object and its position : {ng:nugget id,left{nodes:[node list],edges:[edges list]},right{nodes:[nodes list],edges:[edges list]}}
        if(typeof el=='undefined' || el==null)
            throw new Error("please use stack with an element");
        if(typeof sub_stack[el.ng]=='undefined' || sub_stack[el.ng]==null)//if this nugget have no stack, create one
            sub_stack[el.ng]={"idx":-1,"stack":[]};
        if(sub_stack[el.ng].idx<sub_stack[el.ng].stack.length-1){//if we add an element in the middle of the stack, redo are lost
            var removed=sub_stack[el.ng].stack.length-1-sub_stack[el.ng].idx;
            sub_stack[el.ng].stack.splice(sub_stack[el.ng].idx+1);
            for(var i=redo_stack.length-1,j=1;i>=0 && j<=removed;i--){
                if(redo_stack[i].ng==el.ng && redo_stack[i].idx==sub_stack[el.ng].idx+j){
                    redo_stack.splice(i,1);
                    j++;
                }
            }
        }
        sub_stack[el.ng].stack.push(el);//add the new item
        sub_stack[el.ng].idx=sub_stack[el.ng].stack.length-1;//update index
        undo_stack.push({'ng':el.ng,'idx':sub_stack[el.ng].idx});//update global index
    };
    this.undo = function undo(){//undo the last delta operation and return it
        return this.localUndo(undo_stack[undo_stack.length-1].ng);
    };
    this.redo = function redo(){//redo the last undoed delta action and return it
        return this.localRedo(redo_stack[redo_stack.length-1].ng);
    };
    this.localUndo = function localUndo(s_id){//undo the last delta operation for the s_id cluster and return it
        if(typeof sub_stack[s_id]=='undefined' || sub_stack[s_id]==null || sub_stack[s_id].stack.length==0 || sub_stack[s_id].idx==-1)
            return null;
        for(var i=undo_stack.length-1;i>=0;i--){
            if(undo_stack[i].ng==s_id && undo_stack[i].idx==sub_stack[s_id].idx){
                var remove=undo_stack.splice(i,1);
                redo_stack.push(remove[0]);
                break;
            }
        }
        return sub_stack[s_id].stack[sub_stack[s_id].idx--];
    };
    this.localRedo = function localRedo(s_id){//redo the last undoed delta action for the s_id cluster and return it
        if(typeof sub_stack[s_id]=='undefined' || sub_stack[s_id]==null || sub_stack[s_id].stack.length==0 || sub_stack[s_id].idx==sub_stack[s_id].stack.length-1) {
            return null;
        }
        for(var i=redo_stack.length-1;i>=0;i--){
            if(redo_stack[i].ng==s_id && redo_stack[i].idx==sub_stack[s_id].idx+1){
                var remove=redo_stack.splice(i,1);
                undo_stack.push(remove[0]);
                break;
            }
        }
        var ret=sub_stack[s_id].stack[++sub_stack[s_id].idx];
        //console.log(ret);
        return ret;
    };
    this.clear = function clear(){//clear the whole undoredo object
        undo_stack =[];
        redo_stack =[];
        sub_stack = {};
    };
    this.clearLocal = function clearLocal(s_id){//clear a the undo redo object for a specified cluster
        for(var i=redo_stack.length-1;i>=0;i--){
            if(redo_stack[i].ng==s_id){
                redo_stack.splice(i,1);
            }
        }
        for(var i=undo_stack.length-1;i>=0;i--){
            if(undo_stack[i].ng==s_id){
                undo_stack.splice(i,1);
            }
        }
        sub_stack[s_id]=null;
    };
    this.log = function log(){//log the whole undo redo object
        console.log("==== undoRedo logs: ====");
        console.log("undo stack");
        console.log(undo_stack);
        console.log("redo stack");
        console.log(redo_stack);
        console.log("local stack");
        console.log(sub_stack);
    }
}