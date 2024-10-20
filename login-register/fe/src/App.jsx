import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [curTodo, setCurTodo] = useState("");
  const [updatingTodo, setUpdatingTodo] = useState({});
  const [todos, setTodos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  useEffect(() => {
    getTodos();
  }, []);
  async function getTodos() {
    const resp = await axios.get("http://localhost:3000/todos");
    setTodos(resp.data);
  }
  async function submitTodo() {
    let todoBody = {
      Task: curTodo,
      Completed: false,
    };
    try {
      await axios.post("http://localhost:3000/todos", todoBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.reload();
    } catch (error) {
      console.log("Error submitting todo", error);
    }
  }
  function openModalFn(todo) {
    console.log(todo);

    setOpenModal(true);
    setUpdatingTodo(todo);
  }
  async function updateTodo() {
    console.log(updatingTodo);

    setOpenModal(false);
    const updateTodo = {
      Task: updatingTodo.task,
      Completed: updatingTodo.completed,
    };
    await axios.put(
      "http://localhost:3000/todos/" + updatingTodo.id,
      updateTodo,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    window.location.reload();
  }
  async function deleteTodo(todo) {
    await axios.delete("http://localhost:3000/todos/" + todo.id);
    window.location.reload();
  }
  return (
    <div className="flex flex-col gap-4 items-center my-8">
      <div className="text-3xl">Go Todo List</div>
      <div className="flex gap-2">
        <input
          className="border-2 text-2xl rounded-md"
          type="text"
          placeholder="Enter todo"
          value={curTodo}
          onChange={(e) => setCurTodo(e.target.value)}
        />
        <button
          onClick={submitTodo}
          className="bg-black text-white rounded-xl p-2 text-2xl hover:opacity-75"
        >
          Submit
        </button>
      </div>
      <div className="w-2/3 flex flex-col gap-2">
        {todos &&
          todos.map((todo, index) => {
            return (
              <div
                key={index}
                className="bg-gray-200 flex justify-between p-2 rounded-lg"
              >
                <div className="flex gap-2 items-center">
                  <input type="checkbox" checked={todo.completed} />
                  <div className="text-xl">{todo.task}</div>
                </div>
                <div className="flex gap-2 text-xl">
                  <button
                    onClick={() => openModalFn(todo)}
                    className="bg-green-600 hover:bg-green-500 p-2 text-white rounded-xl"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo)}
                    className="bg-red-600 hover:bg-red-500 p-2 text-white rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      {openModal && (
        <div className="bg-yellow-200 p-4 flex flex-col gap-4 rounded-xl absolute top-1/4">
          <div className="text-center text-2xl">Update Todo</div>
          <div className="text-xl">Change todo</div>
          <input
            className="text-xl rounded-md p-1"
            type="text"
            value={updatingTodo.task}
            onChange={(e) =>
              setUpdatingTodo((prevState) => ({
                ...prevState,
                task: e.target.value,
              }))
            }
          />
          <div className="flex justify-between">
            <div className="text-xl">is Completed ?</div>
            <input
              className="w-4"
              type="checkbox"
              checked={updatingTodo.completed}
              onChange={(e) =>
                setUpdatingTodo((prevState) => ({
                  ...prevState,
                  completed: e.target.checked,
                }))
              }
            />
          </div>
          <button
            onClick={() => updateTodo()}
            className="bg-black hover:bg-gray-800 text-white text-center p-1 text-2xl my-4 rounded-xl"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
