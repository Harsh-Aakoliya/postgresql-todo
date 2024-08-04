const express=require("express");
const app=express();
const Pool=require("pg").Pool
const path=require("path");
const PORT=3000;
require("dotenv").config()



const pool=new Pool({
    // user:process.env.USER_NAME,
    // host:process.env.HOST_NAME,
    // database:process.env.DB_NAME,
    // password:process.env.DB_PASSWORD,
    // dialect:process.env.DB_DIALECT,
    // port:process.env.PORT_NUMBER
    connectionString: process.env.POSTGRES_URL,

});

pool.connect((err,client,release)=>{
    if(err) return console.error("Error in connection");
    client.query("select now()",(err,result)=>{
        release();
        if(err) return console.error("Error while Executing query");
        console.log("Connected to DB");
    })
})


app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.get("/",async(req,res)=>{
    console.log("Here from postman")
    return res.json({
        msg:"Hello from home page"
    });
})

//add todos to table
app.post("/addTodo", async (req, res) => {
    const { todo, date } = req.body;
    try {
      const result = await pool.query("INSERT INTO tbl (todo, date) VALUES ($1, $2)", [todo, date]);
      res.status(201).json({ message: "Todo added successfully", result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/allTodos",async (req,res)=>{
    const data=await pool.query(`select *from tbl`);
    return res.status(200).json({data:data.rows});
  })


  app.delete("/deleteTodo/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM tbl WHERE id = $1", [id]);
      res.status(200).json({ message: "Todo deleted successfully", result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.put("/updateTodo/:id", async (req, res) => {
    const { id } = req.params;
    const { todo, date } = req.body;
    try {
      const result = await pool.query("UPDATE tbl SET todo = $1, date = $2 WHERE id = $3", [todo, date, id]);
      res.status(200).json({ message: "Todo updated successfully", result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.patch("/patchTodo/:id", async (req, res) => {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let query = "UPDATE tbl SET ";
    Object.keys(req.body).forEach((key, index) => {
      fields.push(`${key} = $${index + 1}`);
      values.push(req.body[key]);
    });
    query += fields.join(", ");
    query += ` WHERE id = $${fields.length + 1}`;
    values.push(id);
    try {
      const result = await pool.query(query, values);
      res.status(200).json({ message: "Todo patched successfully", result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  
app.listen(PORT,()=>{console.log("Server started on ",PORT)});