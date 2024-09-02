const express = require("express");
const mysql = require("mysql")

const dbconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "matatusacco"
})

const app = express();

app.use(express.static("public")); // middleware --- app.use(func) - func will executed on every request
app.use((req,res, next)=>{
  console.log("Middleware Function") // authorization -- block some route 
  next() 
})

app.get("/", (req, res) => {
  // home/root page/route/path
  res.render("home.ejs");
});
app.get("/vehicles", (req, res) => {
  // all vehicles route
  dbconnection.query("SELECT * FROM vehicles JOIN owners ON vehicles.OwnerID = owners.ID_NO", (sqlErr,vehicles)=>{
    if(sqlErr){
      res.status(500).send("Server Error!!")
    }else{
      res.render("vehicles.ejs", {vehicles});
    }
  })
});
app.get("/vehicle",(req,res)=>{
  // individual vehicle route
  
  if(!req.query.plate){
    res.render("vehicle.ejs", {message: "No vehicle selected"})
  }else{
    dbconnection.query(`SELECT * FROM vehicles JOIN drivers ON vehicles.NumberPlate = drivers.AssignedVehicle WHERE NumberPlate = "${req.query.plate}" ` , (sqlErr,vehicle)=>{
       if(sqlErr){
        res.status(500).send("Server Error!!")
       }else{
        if(vehicle.length > 0){
          dbconnection.query(`SELECT * FROM trips JOIN routes ON trips.Route = routes.route_id WHERE Vehicle = "${req.query.plate}"`, (error, trips)=>{
            if(error){
              res.status(500).send("Server Error!!")
            }else{              
              res.render("vehicle.ejs", {vehicle: vehicle[0], trips: trips})
            }
          })  
        }else{
          res.render("vehicle.ejs", {message: "No vehicle Found / Invalid vehicle plate"})
        }
       }
    })
  }  
})


app.get("/newtrip", (req,res)=>{
  if(!req.query.plate){
    res.render("newtrip.ejs", {message: "No vehicle selected"})
  }else{
    dbconnection.query("SELECT * FROM routes", (err, routes)=>{
      if(err){
        res.status(500).send("Server Error!!")
      }else{
        res.render("newtrip.ejs", {numberPlate: req.query.plate, routes: routes })
      }
    })
  }
})
app.post("/newtrip", (req,res)=>{
  //
})

app.get("/owner", (req,res)=>{
  // indivual owner route
  if(!req.query.id){
    res.render("owner.ejs", {message: "No owner selected"})
  }else{
    dbconnection.query(`SELECT * FROM owners JOIN vehicles ON owners.ID_NO = vehicles.OwnerID WHERE OwnerID="${req.query.id}"`, (sqlErr, ownerData)=>{
      if(sqlErr){
        res.status(500).send("Server Error!!")
       }else{
          if(ownerData.length > 0){
            res.render("owner.ejs", {ownerData})
          }else{
            res.render("owner.ejs", {message: "No owner Found(wrong id provided) "})
          }
       }
    })

  }
})


// other routes
app.get("*", (req,res)=>{
  // 404 pagenot found
  res.status(404).render("404.ejs")
})
// start our application - using a network port
app.listen(3003);
