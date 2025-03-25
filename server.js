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
      host: "mysql-152a3830-itis-b1f2.k.aivencloud.com",
      user: "avnadmin",
      password: "AVNS_gPI6jGftIi4i2BTFx49",
      database: "defaultdb",
      port: "24943",
      ssl: {
        ca: fs.readFileSync(__dirname + '/ca.pem')
      }
    }
);

const executeQuery = (sql) => {
   return new Promise ((resolve, reject) => {
      connessione.query(sql, (err, result) => {
         if(err) {
            console.error("errore query: ", err);
            reject(err);
         } 
         else {
            resolve(result);
         }
      });
   });
};

const createTable = () => {
   return executeQuery(`
      CREATE TABLE IF NOT EXISTS todo (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      date DATETIME NOT NULL,
      completed BOOLEAN
    )
   `)
}

const insert = (todo) => {
   let sql = `INSERT INTO todo (name, date, completed) 
              VALUES ('${todo.name}', '${todo.date}', ${todo.completed ? 1 : 0})`;
   return executeQuery(sql);
 };

 const select = () => {
   let sql = `SELECT id, name, date, completed FROM todo`;
   return executeQuery(sql);
 };

const update = (todo) => {
   let sql = `UPDATE todo 
              SET completed=${todo.completed ? 1 : 0}
              WHERE id=${todo.id}`;
   return executeQuery(sql);
 };

const deleteSQL = (todo) => {
  let sql = `DELETE FROM todo WHERE id=${todo.id}`;
  return executeQuery(sql);
};

// componente per l'aggiunta del todo, prima controlla che sia stato riempito il campo e prima se sia stato inserito nel database
app.post("/todo/add", (req, res) =>{
   const todo = req.body;
   //controllare anche la data
   if (!todo.name) {
      return res.status(400).json({
         error: "errore, il nome è richiesto"
      });
   }
   insert(todo)
      .then(() => res.json({result: "ok"}))
      .catch((err) => {
         console.error(err);
         res.status(500).json({error: "errore nell'inserimento nel database"});
      });
});

// visualizza tutte le todo salvate
app.get("/todo", (req, res) =>{
   select()
      .then((rows) => {
         res.json({ todos: rows});
      })
      .catch((err) => {
         console.error(err);
         res.status(500).json({error: "errore nella select del database"});
      });
});

// Marca come completata
app.put("/todo/complete", (req, res) => {
   // Inviato da client: { id: 123, completed: true }
   const todo = req.body;
   update(todo)
     .then(() => {
       res.json({ result: "Ok" });
     })
     .catch((err) => {
       console.error(err);
       res.status(500).json({ error: "Errore update DB" });
     });
 });
 
 // Elimina
 app.delete("/todo/:id", (req, res) => {
   deleteSQL({ id: req.params.id })
     .then(() => {
       res.json({ result: "Ok" });
     })
     .catch((err) => {
       console.error(err);
       res.status(500).json({ error: "Errore delete DB" });
     });
 });
 

//avvia server
createTable()
  .then(() => {
    http.createServer(app).listen(80, () => {
      console.log("Server in esecuzione sulla porta 80");
    });
  })
  .catch((err) => {
    console.error("Errore creazione tabella:", err);
  });

   //const server = http.createServer(app);

//server.listen(80, () => {
   //console.log("- server running");
   //});