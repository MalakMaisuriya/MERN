const express = require("express");
const app = express();

const PORT = 5000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


let tasks = [];


app.get("/", (req, res) => {

    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "Pending").length;
    const progress = tasks.filter(t => t.status === "In Progress").length;
    const completed = tasks.filter(t => t.status === "Completed").length;

    res.render("dashboard", {
        tasks,
        total,
        pending,
        progress,
        completed
    });
});


app.get("/add", (req, res) => {
    res.render("add-task");
});


app.post("/add", (req, res) => {

    const { title, description, priority } = req.body;

    const newTask = {
        id: Date.now(),
        title,
        description,
        priority,
        status: "Pending"
    };

    tasks.push(newTask);
    res.redirect("/");
});


app.get("/delete/:id", (req, res) => {
    tasks = tasks.filter(t => t.id != req.params.id);
    res.redirect("/");
});


app.get("/edit/:id", (req, res) => {
    const task = tasks.find(t => t.id == req.params.id);
    res.render("edit-task", { task });
});


app.post("/update/:id", (req, res) => {

    const task = tasks.find(t => t.id == req.params.id);

    task.title = req.body.title;
    task.description = req.body.description;
    task.priority = req.body.priority;
    task.status = req.body.status;

    res.redirect("/");
});


app.get("/status/:id", (req, res) => {

    const task = tasks.find(t => t.id == req.params.id);

    if (task.status === "Pending") task.status = "In Progress";
    else if (task.status === "In Progress") task.status = "Completed";

    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
