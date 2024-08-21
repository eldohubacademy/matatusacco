const express = require("express");
const mysql = require("mysql")

const dbconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "matatusacco"
})

const app = express();
app.use(express.static("public"));

app.get("/", (req, res) => {
  // home/root page/route/path
  res.render("home.ejs");
});
app.get("/vehicles", (req, res) => {
  // all vehicles route
  dbconnection.query("SELECT * FROM vehicles", (sqlErr,vehicles)=>{
    if(sqlErr){
      res.send("Server Error!!")
    }else{
      console.log(vehicles)
      res.render("vehicles.ejs", {vehicles});
    }
  })
});

// other routes
app.get("*", (req,res)=>{
  // 404 pagenot found
  res.status(404).render("404.ejs")
})
// start our application - using a network port
app.listen(3003);
