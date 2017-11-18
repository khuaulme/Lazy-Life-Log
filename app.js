var express     = require('express'),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/workout_log");
app.use(bodyParser.urlencoded({extended:true}));  // just memorize this - good for form posts

app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");

// SCHEMA SET-UP
var workoutSchema = new mongoose.Schema({
    name: String,
    image: String,
    calories: String
});

var Workout = mongoose.model("Workout", workoutSchema);        // WORKOUT is where I name the collection

Workout.create(
    {
        name: "Running",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOzmL9a0iGY50FdrpsDeqkWgL6GuEapmmspukGmB4gVbHeTqorwg",
        calories: 500
    }, function (err, workout) {
        if (err){
            console.log(err);
        } else {
            console.log("NEWLY CREATED WORKOUT!");
            console.log(workout);
        }
    });





app.get("/", function(req, res){
    res.render("landing")
});

app.get("/workouts", function(req,res){
    // get all workouts from db
    Workout.find({}, function(err, allWorkouts){
        if (err){
            console.log(err);
        } else {
            res.render("index", {workouts:allWorkouts});
        }
    });


});

app.post("/workouts", function(req, res){

   // get data from form and add to workouts array
    var name = req.body.name;
    var image = req.body.image;
    var calories = req.body.calories;
    var newWorkout = {name:name, image: image, calories:calories};
    Workout.create(newWorkout, function(err, newlyCreated){
        if (err){
            console.log("Oops! Can't create workout.");
            console.log(err);
        } else {
            // redirect back to workouts page
            res.redirect("/workouts"); // default is to redirect as a GET
        }
    });



});

app.get("/workouts/new", function(req,res){
    res.render("new.ejs");
});

app.get("/workouts/:id", function(req,res) {
    Workout.findById(req.params.id, function (err, foundWorkout) {
        if (err) {
            console.log(err);
        } else {
            res.render("show", {workout: foundWorkout});
        }
    });
});




app.listen(3000, function(){
    console.log('Workout Log has started.');
});