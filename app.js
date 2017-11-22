var express         = require('express'),
    app             = express(),
    methodOverride  = require("method-override");
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose");
    _               = require("underscore");
    schedule        = require('node-schedule');

    const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/drink_log", {
    useMongoClient:true
});


app.use(bodyParser.urlencoded({extended:true}));  // just memorize this - good for form posts
app.use(methodOverride("_method"));
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");


// SCHEMA SET-UP
var drinkSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    calories: Number,
    dservings: Number,
    wservings: Number
});

var Drink = mongoose.model("Drink", drinkSchema);        // DRINK is what I name the collection

// Drink.create(
//     {
//         name: "Margarita",
//         image: "https://cdn.liquor.com/wp-content/uploads/2017/07/05150949/Frozen-Margarita-720x720-recipe.jpg",
//         description: "One of the crown jewels in the cocktail world." +
//             " Consists of tequila, triple sec, and lime juice.",
//         calories: 280,
//         dservings: 0,
//         wservings: 4
//     }, function (err, drink) {
//         if (err){
//             console.log(err);
//         } else {
//             console.log("NEWLY CREATED DRINK!");
//             console.log(drink);
//         }
//     });

app.get("/", function(req, res){
    Drink.find({}, function (err, allDrinks) {
        if (err) {
            console.log(err);
        } else {
            res.render("landing", {drinks: allDrinks});
        }
    });


    // res.render("landing");
});

// INDEX ROUTE- SHOW ALL DRINKS
app.get("/drinks", function(req,res) {
    // get all drinks from db
    Drink.find({}, function (err, allDrinks) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {drinks: allDrinks});
        }
    });
});

//FOR ALEXA< CREATE A NEW ROUTE with GET and res.json(allDrinks);
app.get("/drinks/Alexa", function(req,res){
        // get all drinks from db
        Drink.find({}, function(err, allDrinks){
            if (err){
                console.log(err);
            } else {
                res.json(allDrinks);
            }
        });
});

// CREATE ROUTE - ADD NEW DRINK TO DB
app.post("/drinks", function(req, res){
   // get data from form and add to drinks array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var calories = req.body.calories;
    var dservings = req.body.dservings;
    var wservings = req.body.dservings;  // set the weekly servings to the daily servings upon creation
    var newDrink = {name:name, image: image, description: description, calories:calories, dservings: dservings, wservings: wservings};
    Drink.create(newDrink, function(err, newlyCreated){
        if (err){
            console.log("Oops! Can't create drink.");
            console.log(err);
        } else {
            // redirect back to drinks page
            res.redirect("/drinks"); // default is to redirect as a GET
        }
    });
});

// NEW - SHOW FORM TO CREATE NEW DRINK
app.get("/drinks/new", function(req,res){
    res.render("new.ejs");
});

// SHOWS INFO OVER JUST 1 DRINK
app.get("/drinks/:id", function(req,res) {
    Drink.findById(req.params.id, function (err, foundDrink) {
        if (err) {
            console.log(err);
        } else {
           res.render('show.ejs', { drink: foundDrink });
        }
    });
});

//FOR ALEXA< CREATE A NEW ROUTE with GET and res.json(foundDrink);
app.get("/drinks/:name/Alexa", function(req,res){

    // var name = req.params.name;
    Drink.find( { name: req.params.name }, function (err, foundDrink){

        if (err) {
            console.log("Can't find " + req.params.name + " drink.");
            console.log(err);
        } else {
            res.json(foundDrink);
        }
    });

});

//EDIT ROUTE
app.get("/drinks/:id/edit", function(req,res){

    Drink.findById(req.params.id, function(err, foundDrink){
        if (err){
            res.redirect("/drinks");
        } else {
            res.render("edit", {drink: foundDrink});
        }

    });

});

//INCREMENT ROUTE
app.put("/drinks/:id/inc", function(req,res){
    Drink.findByIdAndUpdate(
         req.params.id, { $inc: {
            dservings: 1,
            wservings: 1
            }
        }, function(err, updatedDrink){
            if (err){
                res.redirect("/drinks");
            } else {
                res.redirect("/drinks/");
            }
        });
});

//UPDATE ROUTE
app.put("/drinks/:id", function(req,res){
    Drink.findByIdAndUpdate(req.params.id, req.body.drink, function(err, updatedDrink){
       if (err){
           res.redirect("/drinks");
       } else {

           console.log("Daily servings: " +  updatedDrink.dservings);  //
           res.redirect("/drinks/" + req.params.id);
       }
    });
});

//DELETE ROUTE
app.delete("/drinks/:id", function(req, res){
    Drink.findByIdAndRemove(req.params.id, function(err, removedDrink){
       if (err) {
           console.log(err);
           res.redirect("/drinks");
       } else {
           res.redirect("/drinks");
       }
    });

});

// CHRON JOBS ------Weekly Servings = Weekly Servings + Daily Servings ----- Daily Servings = 0 ------

// var dailyJob = schedule.scheduleJob('42 * * * * *', function(){   // ('0 0 0 * * *', function
//     console.log('The daily answer to life, the universe, and everything!');
//     Drink.find({}, function (err, allDrinks) {
//         console.log('Executing Daily Cron Job');
//         if (err) {
//             console.log(err);
//         } else {
//             allDrinks.forEach(function(drink){
//              //   drink.set({ wservings: drink.wservings + drink.dservings});
//                 drink.set({ dservings: 0});
//                 drink.save(function(err, updatedDrink){
//                     if (err) { console.log(err);}
//                     else {}
//                 });
//
//             }); // ends forEach
//         }
//     });
// });

// var weeklyJob = schedule.scheduleJob('12 * * * * *', function(){   // ('0 0 0 * * 0', function
//     console.log('The answer to everything is 42!');
//     Drink.find({}, function (err, allDrinks) {
//         if (err) {
//             console.log(err);
//         } else {
//             allDrinks.forEach(function(drink){
//
//                 drink.set({ wservings: 0});
//                 drink.save(function(err, updatedDrink){
//                     if (err) { console.log(err);}
//                     else {}
//                 });
//             });
//         }
//     });
// });




app.listen(port, function(){
    console.log(`Lazy Life Log has started on port ${port}.`);
});