import React, { useState, useEffect } from "react";
import "./App.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import { Authenticator } from "@aws-amplify/ui-react";
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { generateClient } from "@aws-amplify/api";

const client = generateClient();
Amplify.configure(awsconfig);

function App() {
  const [todos, setTodos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingTodo, setEditingTodo] = useState(null); // For tracking edits

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const todoData = await client.graphql({ query: listTodos });
      setTodos(todoData.data.listTodos.items);
    } catch (error) {
      console.error("Error fetching todos", error);
    }
  };

  const addOrUpdateTodo = async () => {
    if (!name) return;
    try {
      if (editingTodo) {
        // Update existing todo
        const updatedTodo = { id: editingTodo.id, name, description };
        await client.graphql({
          query: updateTodo,
          variables: { input: updatedTodo },
        });
        setEditingTodo(null);
      } else {
        // Create new todo
        const newTodo = { name, description };
        await client.graphql({
          query: createTodo,
          variables: { input: newTodo },
        });
      }
      setName("");
      setDescription("");
      fetchTodos();
    } catch (error) {
      console.error("Error saving todo", error);
    }
  };

  const removeTodo = async (id) => {
    try {
      await client.graphql({
        query: deleteTodo,
        variables: { input: { id } },
      });
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo", error);
    }
  };

  const editTodo = (todo) => {
    setEditingTodo(todo);
    setName(todo.name);
    setDescription(todo.description);
  };

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="App">
          {/* Header with Sign Out Button */}
          <header className="App-header">
            <h2 className="welcome-text">Welcome To My Todo App</h2>
            <button className="signout-btn" onClick={signOut}>
              Sign Out
            </button>
          </header>

          {/* Todo Input Section */}
          <div className="todo-container">
          <h2>Add Todo:</h2>
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
            <button onClick={addOrUpdateTodo}>
              {editingTodo ? "Update Todo" : "Add Todo"}
            </button>
          </div>

          {/* Todo List */}
          <ul className="todo-list">
          <h2>Todo List:</h2>
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <span className="todo-name">{todo.name}</span>
                <p className="todo-description">{todo.description}</p>
                <div className="todo-actions">
                  <button className="edit-btn" onClick={() => editTodo(todo)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => removeTodo(todo.id)}
                  >
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
