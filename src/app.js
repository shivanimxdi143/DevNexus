// const express = require("express");

// const app = express();


//////// ERROR HANDLING ////////////
// app.get("/getUserData", (req,res) => {
//     throw new Error("dfgfdfbsfv");                not a good method to handle errors
//     res.send("User Data Sent");
// })

// good method

// app.get("/getUserData", (req,res) => {
//     throw new Error("dfgfdfbsfv");                
//     res.send("User Data Sent");
// })

// app.use("/", (err,req,res,next) => {
//      if(err) {
//         res.status(500).send("something went wrong");
//      }
// })

// use try catch to handle errors

// app.get("/getUserData", (req,res) => {
//     try {
//         throw new Error("grgrggbhye");
//         res.send("User data sent");
//     }
//     catch (err) {
//         res.status(500).send("Some error contact support team");
//     }
// })

////// ORDERRRRRRRRRRRRR MATTERSSSSSSSSSSSSSSSSSSS
/////// MIDDLEWARE AND ROUTE HANDLES


// const { adminAuth, userAuth } = require("./middlewares/auth");


// app.use("/admin", adminAuth);


// app.post("/user/login", (req, res) => {
//     res.send("User logged in successfully!");
// });


// app.get("/user/data", userAuth, (req, res) => {
//     res.send("User Data Sent");
// });


// app.get("/admin/getAllData", (req, res) => {
//     res.send("All Data Sent");
// });



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

// app.listen(3000);






///// CONNECTING TO DATABASE

// const express = require("express");
// const connectDB = require("./config/database");
// const app = express();

// connectDB()
//      .then(() => {
//       console.log("DataBase connection established");
//       app.listen(3000);
// })
//      .catch((err) => {
//         console.log("Database can't be connected");
//      })



///// creating up a api

// const express = require("express");
// const connectDB = require("./config/database");
// const app = express();
// const User = require("./models/user");

// app.post("/signup" , async (req,res) => {
//      const user = new User({
//       firstName: "Shivani",
//       lastName: "Modi",
//       emailId: "shivani123@gmail.com",
//       password: "shivani1234@",
//      });
//     try {
//      await user.save();
//      res.send("User added successfully");
//     }
//     catch (err) {
//       res.status(400).send("Error saving the user:" + err.message);
//     }
// })
// connectDB()
//      .then(() => {
//       console.log("DataBase connection established");
//       app.listen(3000);
// })
//      .catch((err) => {
//         console.log("Database can't be connected");
//      })



///// diving directly into apis

const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

app.use(express.json());

app.post("/signup" , async (req,res) => {
     const user = new User(req.body);
     
    try {
     await user.save();
     res.send("User added successfully");
    }
    catch (err) {
      res.status(400).send("Error saving the user:" + err.message);
    }
})

connectDB() 
  .then(() => {
     console.log("Connection established successfully");
     app.listen(3000);
  })
  .catch((err) => {
     console.log("Database can't be connected");
  })