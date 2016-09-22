function Relation(){//definition of a relation : sets of antecedent assiociated with sets of images
    var antecedent_to_image={};//hashtable : key : antecedent, values : images
    var image_from_antecedent={};//hashtable : key : image, values : antecedents
    this.merge = function merge(im1,im2,res){
		var ant1=union(this.getAnt(im1),this.getAnt(im2));
		this.rmIm(im1);
		this.rmIm(im2);
		this.addR(ant1,[res]);
	}
	this.addR = function addR(ant_l,img_l){//add a relation between a list of antecedents and a list of images
        for(var i=0;i<ant_l.length;i++) {
            if(!fullListCheck(antecedent_to_image[ant_l[i]]))
                antecedent_to_image[ant_l[i]]=[];
            antecedent_to_image[ant_l[i]] = union(antecedent_to_image[ant_l[i]], img_l);
        }
        for(var i=0;i<img_l.length;i++) {
            if(!fullListCheck(image_from_antecedent[img_l[i]]))
                image_from_antecedent[img_l[i]]=[];
            image_from_antecedent[img_l[i]] = union(image_from_antecedent[img_l[i]], ant_l);
        }
    };
    this.getImg = function getImg(ant){//get all the images of a specific antecedent
        if(fullListCheck(antecedent_to_image[ant]))
            return antecedent_to_image[ant].concat();
        else return null;
    };
    this.getAnt = function getAnt(img){//get all the antecedents of a specific image
        if(fullListCheck(image_from_antecedent[img]))
            return image_from_antecedent[img].concat();
        else return null;
    };
    this.clR = function clR(){//clear the whole relation
        antecedent_to_image={};
        image_from_antecedent={};
    };
    this.rmIm = function rmIm(img){//remove a specific image
        if(fullListCheck(image_from_antecedent[img])) {
            for(var i=0;i<image_from_antecedent[img].length;i++){
				
                var idx=antecedent_to_image[image_from_antecedent[img][i]].indexOf(img);
                if(idx>=0)
                    antecedent_to_image[image_from_antecedent[img][i]].splice(idx,1);
                else
                    console.log("unable to find the image "+img+" in the antecedent hashtable");
            }
            image_from_antecedent[img] = [];
        }
    };
    this.rmAnt = function rmAnt(ant){//remove a specific antecedent
        if(fullListCheck(antecedent_to_image[ant])) {
            for(var i=0;i<antecedent_to_image[ant].length;i++){
                var idx=image_from_antecedent[antecedent_to_image[ant][i]].indexOf(ant);
                if(idx>=0)
                    image_from_antecedent[antecedent_to_image[ant][i]].splice(idx,1);
                else
                    console.log("unable to find the antecedent "+ant+" in the image hashtable");
            }

            antecedent_to_image[ant] = [];
        }
    };
    this.rmR = function rmR(ant_l,img_l){//remove all relations between a list of antecedent and a list of images
        for(var i=0;i<ant_l.length;i++){
            for(var j=0;j<img_l.length;j++){
                var idx=antecedent_to_image[ant_l[i]].indexOf(img_l[j]);
                if(idx>=0)
                    antecedent_to_image[ant_l[i]].splice(idx,1);
                idx=image_from_antecedent[img_l[j]].indexOf(ant_l[i]);
                if(idx>=0)
                    image_from_antecedent[img_l[j]].splice(idx,1);
            }
        }
    };
    this.log = function log(){//log a whole relation
        console.log("relations : ===================>");
        console.log("antecedents->images : ===================>");
        var an_to_im=Object.keys(antecedent_to_image);
        for(var i=0;i<an_to_im.length;i++){
            console.log(an_to_im[i]+ " : ");
            console.log(antecedent_to_image[an_to_im[i]].concat());
        }
        console.log("images->antecedents : ===================>");
        var im_to_an=Object.keys(image_from_antecedent);
        for(var i=0;i<im_to_an.length;i++){
            console.log(im_to_an[i]+ " : ");
            console.log(image_from_antecedent[im_to_an[i]].concat());
        }
    };
}