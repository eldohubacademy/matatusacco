const express = require("express") // import express from express -- es6 (2015)

const mysql = require("mysql")

const dbconnection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "matatusacco"
})

const app = express();

app.use(express.static("public")); // middleware --- app.use(func) - func will executed on every request
app.use(express.urlencoded({extended: true})) // express urlencoded
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
  console.log( req.body ); /// data in the form
  const {numberPlate, route, departure}= req.body
  dbconnection.query(`INSERT INTO trips(Route,Vehicle,Departure,TripStatus) VALUE(${route},"${numberPlate}", "${departure.replace("T", " ") + ":00" }","Scheduled")`, (sqlErr)=>{
    if(sqlErr){
      res.status(500).render("500.ejs")
    }else{
      res.redirect(`/vehicle?plate=${numberPlate}`)
    }
  } )
})

app.get("/updatetrip", (req,res)=>{
  dbconnection.query(`UPDATE trips SET TripStatus = "${req.query.value}" WHERE trip_id = ${req.query.trip}`, (sqrErr)=>{
    if(sqrErr){
      res.status(500).render("500.ejs")
    }else{
      res.redirect(`/vehicle?plate=${req.query.plate}`)
    }
  })
})

// curl, postman, html(browser) -- http clients
app.get("/owner", (req,res)=>{
  // indivual owner route
  if(!req.query.id){
    res.render("owner.ejs", {message: "No owner selected"})
  }else{
    dbconnection.query(`SELECT * FROM owners JOIN vehicles ON owners.ID_NO = vehicles.OwnerID WHERE OwnerID="${req.query.id}"`, (sqlErr, ownerData)=>{
      if(sqlErr){
        res.status(500).render("500.ejs")
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


app.get("/drivers", (req,res)=>{
  // get drivers info from the db
  dbconnection.query("SELECT FullName, phone, AssignedVehicle FROM drivers", (sqlErr,drivers)=>{
    if(sqlErr){
      res.status(500).render("500.ejs")
    }else{
      dbconnection.query("select NumberPlate from vehicles where NumberPlate NOT IN(SELECT AssignedVehicle FROM drivers)", (sqlErr, plates)=>{
        if(sqlErr){
          res.status(500).render("500.ejs")
        }else{
          res.render("drivers.ejs", {drivers, plates})
        }
      })
    }
  })
})

app.get("/remove-driver", (req,res)=>{
  dbconnection.query(`DELETE FROM drivers WHERE AssignedVehicle = "${req.query.plate}"`, (sqlErr)=>{
    if(sqlErr){
      res.status(500).render("500.ejs")
    }else{
      res.redirect("/drivers")
    }
  })
})


// other routes
app.get("*", (req,res)=>{
  // 404 pagenot found
  res.status(404).render("404.ejs")
})
// start our application - using a network port
app.listen(3003);
