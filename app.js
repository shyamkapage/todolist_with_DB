const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");


//for database
const mongoose = require("mongoose");
const { name } = require("ejs");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));


//for accessing local files as a static 
app.use(express.static("public"));









//for database opeartions
mongoose.connect("mongodb+srv://admin-gaurav:Gaurav-123@cluster0.lsoj6.mongodb.net/todolistDB", {useNewUrlParser: true});
//item schema
const itemsSchema = {
    name: String
}
//new mongoose model based on this schema
const Item = mongoose.model("item",itemsSchema);


//default documents /item
const item1 = new Item({
    name: "Welcome to your toDoList"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "Hit this to delete an item"
});


const defaultItems = [item1, item2, item3];


const listSchema ={
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("list",listSchema);






//this is for EJS{Embedded JS}
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
    Item.find({},function(err, foundItems){
        
        
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Succesfully Inserted default item");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle: "Today", newListItems: foundItems});
        }
        
    })
    

});
app.post("/",function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

    
    
})

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox ;
    const listName = req.body.listName ;



    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Selected Item is deleted");
            }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }


    
});








app.get("/:customListName",function(req,res){
    const customListName= _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err, foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                //show an existing statement
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items} )
            }
        }
    });

    
});



app.get("/about",function(req,res){
    res.render("about");
});

app.get("/contact",function(req,res){
    res.render("contact");
});


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is up and running on PORT 3000");
});

