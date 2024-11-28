require("dotenv").config();
const express = require("express");
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())


//Login
app.post("/userlogin", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password

    if (!email || !password) {
        return res.status(400).json({message : "Please enter the email address or password"});
    }

        const payload = {
            email: email
        }
        const secretKey = process.env.SECRECT_KEY
        const options = { 'expiresIn': '1h' }
        const token = jwt.sign(payload, secretKey, options)
        res.status(200).json({ token })

})

//Create Task   
app.post("/saveTask", (req, res) => {
    const { title, priority, status, start_time, end_time } = req.body;

    // MySQL connection
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '08003',
        database: 'crud'
    });

    // Insert query
    const q = 'INSERT INTO tasks (title, priority, status, start_time, end_time) VALUES (?, ?, ?, ?, ?)';
    
    db.query(q, [title, priority, status, start_time, end_time], (err, result) => {
        if (err) {
            console.error("Error saving data:", err);
            res.status(500).send("Failed to save data.");
        } else {
            res.status(200).send("Task Saved Successfully");
        }
    });
});

//Listing all Task
app.get("/getAllTask", (req, res) => {

    // MySQL connection
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '08003',
        database: 'crud'
    });

    // Insert query
    const q = 'select* from tasks';
    
    db.query(q, (err, results) => {
        if (err) {
            console.error("Error retrieving data:", err);
            res.status(500).send("Failed to retrieve tasks.");
        } else {
            res.status(200).json(results); 
        }
    });
});

//Update Task
app.post("/updateTask", (req, res) => {
    const { id, title, priority, status, start_time, end_time } = req.body;

    // MySQL connection
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '08003',
        database: 'crud'
    });

    // Check if the task exists
    const check_id = 'SELECT * FROM tasks WHERE id = ?';
    db.query(check_id, [id], (err, results) => {
        if (err) {
            console.error("Error checking task:", err);
            res.status(500).send("Failed to check task.");
        } else if (results.length > 0) {
            // If the task exists, update it
            const updateQuery = `
                UPDATE tasks 
                SET title = ?, priority = ?, status = ?, start_time = ?, end_time = ? 
                WHERE id = ?`;
            db.query(updateQuery, [title, priority, status, start_time, end_time, id], (err, result) => {
                if (err) {
                    console.error("Error updating task:", err);
                    res.status(500).send("Failed to update task.");
                } else {
                    res.status(200).send("Task updated successfully.");
                }
            });
        } else {
            res.status(404).send("Task with the given ID does not exist.");
        }
    });
});

//Delete the Task
app.post("/deleteTask", (req, res) => {
    const { ids } = req.body; 

    // MySQL connection
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '08003',
        database: 'crud'
    });

    //Convert id into array
    const idArray = Array.isArray(ids) ? ids : [ids];

    // Check array is empty
    if (idArray.length === 0) {
        return res.status(400).send("No IDs provided.");
    }

    const q = `DELETE FROM tasks WHERE id IN (${idArray.map(() => '?').join(',')})`;

    db.query(q, idArray, (err, result) => {
        if (err) {
            console.error("Error deleting data:", err);
            res.status(500).send("Failed to delete tasks.");
        } else if (result.affectedRows === 0) {
            res.status(404).send("No tasks found with the given IDs.");
        } else {
            res.status(200).send(`Deleted ${result.affectedRows} task(s) successfully.`);
        }
    });
});


app.listen(PORT ,() => {
    console.log(`Server is running at ${PORT}`)
})