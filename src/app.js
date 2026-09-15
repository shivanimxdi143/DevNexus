const express = require("express");

const app = express();

app.use("/hi", (req,res) => {
    res.send("Helloo from the dashboard!");
    next();
})

app.use("/hello", (req,res) => {
    res.send("finally server created!");
    next();
})

app.use("/test", (req,res) => {
    res.send("heyy from server!");
})

app.listen(3000);
