const express = require("express");

const app = express();

////// ORDERRRRRRRRRRRRR MATTERSSSSSSSSSSSSSSSSSSS
/////// MIDDLEWARE AND ROUTE HANDLES


const { adminAuth, userAuth } = require("./middlewares/auth");


app.use("/admin", adminAuth);


app.post("/user/login", (req, res) => {
    res.send("User logged in successfully!");
});


app.get("/user/data", userAuth, (req, res) => {
    res.send("User Data Sent");
});


app.get("/admin/getAllData", (req, res) => {
    res.send("All Data Sent");
});



// app.use("/", (req,res,next) => {
//     console.log("Hello From Routes");
//     next();
// });
// app.get("/user", (req,res,next) => {
//     console.log("Hello MiddleWare");
//     next();
// },
// (req,res,next) => {
//     console.log("Bye");
//     res.send("Route Handler");
// }
// )


// app.use("/user", (req,res) => {
                                        // request will keep waiting
// })


// app.use(
//     "/user",
//  (req,res) => {
//     res.send("Hello from Router"); 
//  },                                           // order matters due to which first route will run or   Because Express executes middleware in order, and the first middleware ended the request by sending a response.
// (req,res) => {
//     res.send("Bye from Router");
// })


// app.use(
//     "/user",
//     (req,res,next) => {
//         next();
//     },                                  // we didn't send any respond in first route but due to next 2nd route will run
//     (req,res) => {
//         res.send("Byeee");
//     }
// )


// app.use(
//     "/user",
//     (req,res,next) => {
//         res.send("Hello");
//         next();
//     },                                  
//     (req,res) => {
//         res.send("Byeee");
//     }
// )


// app.use(
//     "/user",
//     (req,res,next) => {
//       next();
//       res.send("Bandar ki tuti chonch");
//     },                                       // next came first and it means "Leave this middleware and go to the next middleware."
//     (req,res) => {
//      res.send("Tuti chonch ka bandar");
//     }
// )

////////////////////////// Playing with routes////////////////////////////
// app.get("/users", (req,res) => {
//     console.log(req.query);
//     res.send("Done");
// })

// app.get("/users/:id", (req,res) => {
//     console.log(req.params);
//     res.send("Done");
// })

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
