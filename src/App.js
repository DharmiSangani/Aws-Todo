import React, { useState, useEffect } from "react";
import "./App.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import { Authenticator } from "@aws-amplify/ui-react";
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { generateClient } from "@aws-amplify/api";

const client = generateClient(); // Generate GraphQL client
Amplify.configure(awsconfig);

function App() {
  const [todos, setTodos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingTodo, setEditingTodo] = useState(null);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Function to fetch todos from GraphQL API
  const fetchTodos = async () => {
    try {
      const todoData = await client.graphql({ query: listTodos });
      setTodos(todoData.data.listTodos.items);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Function to add or update a todo
  const addOrUpdateTodo = async () => {
    if (!name.trim()) return; // Prevent empty todos
    try {
      if (editingTodo) {
        // Updating an existing todo
        await client.graphql({
          query: updateTodo,
          variables: { input: { id: editingTodo.id, name, description } },
        });
        setEditingTodo(null);
      } else {
        // Creating a new todo
        await client.graphql({
          query: createTodo,
          variables: { input: { name, description } },
        });
      }
      setName("");
      setDescription("");
      fetchTodos(); // Refresh the list
    } catch (error) {
      console.error("Error saving todo:", error);
    }
  };

  // Function to delete a todo
  const removeTodo = async (id) => {
    try {
      await client.graphql({
        query: deleteTodo,
        variables: { input: { id } },
      });
      fetchTodos(); // Refresh the list
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Function to edit a todo
  const editTodo = (todo) => {
    setEditingTodo(todo);
    setName(todo.name);
    setDescription(todo.description);
  };

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="App">
          {/* Navbar */}
          <header className="App-header">
            <button className="signout-btn" onClick={signOut}>
              Sign Out
            </button>
          </header>

          {/* Welcome Message */}
          <h2 className="welcome-text">Welcome To My Todo App</h2>

          {/* Todo Input Section */}
          <div className="todo-container">
          <h2>Create Todo:</h2>

            <input
              type="text"
              placeholder="Todo name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button className="add-btn" onClick={addOrUpdateTodo}>
              {editingTodo ? "Update Todo" : "Add Todo"}
            </button>
          </div>

          {/* Todo List */}
          <ul className="todo-list">

            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <div className="todo-content">
                  <span className="todo-name">{todo.name}</span>
                  <p className="todo-description">{todo.description}</p>
                </div>
                <div className="todo-actions">
                  <button className="edit-btn" onClick={() => editTodo(todo)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => removeTodo(todo.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
