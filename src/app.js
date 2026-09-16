const express = require("express");

const app = express();

////// ORDERRRRRRRRRRRRR MATTERSSSSSSSSSSSSSSSSSSS


app.get("/users", (req,res) => {
    console.log(req.query);
    res.send("Done");
})

app.get("/users/:id", (req,res) => {
    console.log(req.params);
    res.send("Done");
})

// app.use("/hi", (req,res) => {
//     res.send("Helloo from the dashboard!");
// })

// app.use("/user", (req,res) => {
//     res.send("HaHAAAAAAAAAAAA");
// })

// this will handle only GET calls to /user
// app.get("/user",(req,res) => {
//       res.send({firstName:"Shivani", lastName:"Modi"});
// });

// app.post("/user", (req, res) => {
//     res.send("Data saved to the database");
// })

// app.delete("/user", (req, res) => {
//     res.send("Deleted successfully");
// })

// this will handle all the http methods
// app.use("/hello", (req,res) => {
//     res.send("finally server created!");
// })

// app.use("/test", (req,res) => {
//     res.send("heyy from server!");
// })

app.listen(3000);
