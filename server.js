const fs = require("fs");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const http = require("http");
const mysql = require("mysql2");
const path = require('path');

app.use("/", express.static(path.join(__dirname, "public")));  //mettiamo a disposizione i dati nella cartella public

//let todos = [];    non serve più questo dato

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));

//connessione al database
const connessione = mysql.createConnection(
   {
      host: "mysql-371f75ea-itis-b1f2.b.aivencloud.com",
      user: "avnadmin",
      database: "defaultdb",
      port: "24943",
      ssl: {
        ca: fs.readFileSync(__dirname + '/ca.pem')
      }
    }
);

app.post("/todo/add", (req, res) => {
   const todo = req.body.todo;
   todo.id = "" + new Date().getTime();
   //todos.push(todo);
   res.json({result: "Ok"});
});

app.get("/todo", (req, res) => {
   //res.json({todos: todos});
});

app.put("/todo/complete", (req, res) => {
    const todo = req.body;
    try {
       todos = todos.map((element) => { //////////////////////
          if (element.id === todo.id) {
             element.completed = true;
          }
          return element;
       })
    } catch (e) {
       console.log(e);
    }
    res.json({result: "Ok"});
 });


 app.delete("/todo/:id", (req, res) => {
    //todos = todos.filter((element) => element.id !== req.params.id);
    res.json({result: "Ok"});  
 })

const server = http.createServer(app);

server.listen(5500, () => {
  console.log("- server running");
});