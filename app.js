//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");

const app =  express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

// const secretKey = "This,is,our,little,secret,key,to,encrypt,our,information.";          // level-1 security.

// level-2 security :-->>
userSchema.plugin(encrypt, {secret : process.env.SECRET_KEY, encryptedFields : ["password"]});      
                                                // inserting plugin to userSchema to encrypt
                                                // password field of any user document at time of saving
                                                // that document and then decrypting that password
                                                // using the secret key at time of finding the document.

const User = new mongoose.model("User", userSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/register", function(req,res){
    const newUser = new User({
        email : req.body.username,
        password : req.body.password 
    });

    newUser.save(function(err){            // fields are encrypted here at time of saving. (level-2)
        if(err){
            console.log(err);
        }
        else {
            res.render("secrets");
        }
    });
});

app.post("/login",function(req,res){
    User.findOne({email : req.body.username} , function(err, foundUser){      // fields which were encrypted are decrypted here in
                                                                                    // find function. (level-3)
        if(err){
            console.log(err);
        }
        else if(foundUser && foundUser.password === req.body.password){
            // console.log(foundUser);             
            res.render("secrets");
        }
    })
})

app.listen(3000, function(){
    console.log("Server started on port 3000.");
});