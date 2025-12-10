import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import cors from "cors";

const app = express();


app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Connect to MongoDB
mongoose
  .connect(process.env.mongo_url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

//create schema
const todoItemSchema = new mongoose.Schema({
  title: { required: true, type: String },
  description: {
    required: true,
    type: String,
  },
});

//create model
const ToDoItem = mongoose.model("ToDoItem", todoItemSchema);



// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.post("/todoitem", async (req, res) => {
  const { title, description } = req.body;
  //save to database
  try {
    const newTodoItem = new ToDoItem({ title, description });
    await newTodoItem.save();
    res.status(201).json({ message: "Todo item created", newTodoItem });
  } catch (error) {
    res.status(500).json({ message: "Error creating todo item", error });
  }
});

app.get("/todoitems", async(req, res) => {
  //get all todo items from database
  ToDoItem.find()
    .then((items) => {
      res.json(items);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error retrieving todo items", error });
    });
});

app.put("/todoitem/:id", async(req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        //update in database
        const updatedTodoItem = await ToDoItem.findByIdAndUpdate(
          id,
          { title, description },
          { new: true }
        );
        if (updatedTodoItem) {
          res.json(updatedTodoItem);
        }
         else {
          res.status(404).json({ message: "Todo item not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating todo item", error });
    }
  });

app.delete("/todoitem/:id", async(req, res) => {
    try {
        const { id } = req.params;
        //delete from database
        const deletedTodoItem = await ToDoItem.findByIdAndDelete(id);
        if (deletedTodoItem) {
          res.json({ message: "Todo item deleted" });
        } else {
          res.status(404).json({ message: "Todo item not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting todo item", error });
    }
    
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
