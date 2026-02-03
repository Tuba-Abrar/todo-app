import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://todo-app-dext.vercel.app/tasks", { withCredentials: true });
      setTodos(res.data.result);
      setError(null);
    } catch {
      setError("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async () => {
    if (!newTodo) return;
    try {
      const res = await axios.post("https://todo-app-dext.vercel.app/add-task", { text: newTodo, completed: false }, { withCredentials: true });
      setTodos([...todos, res.data.result]);
      setNewTodo("");
    } catch {
      setError("Failed to create todo");
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t._id === id);
    try {
      const res = await axios.put("https://todo-app-dext.vercel.app/update-task", { ...todo, completed: !todo.completed }, { withCredentials: true });
      setTodos(todos.map((t) => (t._id === id ? res.data.result : t)));
    } catch {
      setError("Failed to update todo");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`https://todo-app-dext.vercel.app/delete${id}`, { withCredentials: true });
      setTodos(todos.filter((t) => t._id !== id));
    } catch {
      setError("Failed to delete todo");
    }
  };

  const logout = async () => {
    try {
      await axios.get("https://todo-app-dext.vercel.app/logout", { withCredentials: true });
      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="my-10 bg-gray-100 max-w-lg lg:max-w-xl rounded-lg shadow-lg mx-8 sm:mx-auto p-6">
      <h1 className="text-2xl font-semibold text-center">Todo App</h1>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Add a new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          className="flex-grow p-2 border rounded-l-md focus:outline-none"
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 border rounded-r-md text-white px-4 py-2 hover:bg-blue-900 duration-300"
        >
          Add
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600 font-semibold">{error}</div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo._id} className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
              <div className="flex items-center">
                <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo._id)} className="mr-2" />
                <span className={`${todo.completed ? "line-through text-gray-800 font-semibold" : ""}`}>{todo.text}</span>
              </div>
              <button onClick={() => deleteTodo(todo._id)} className="text-red-500 hover:text-red-800 duration-300">Delete</button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-center text-sm text-gray-700">{remaining} remaining todos</p>

     
    </div>
  );
}

export default Home;
