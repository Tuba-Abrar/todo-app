import { Fragment, useEffect, useState } from "react";
import '../style/list.css';
import { Link } from "react-router-dom";

export default function List() {

    const [taskData, setTaskData] = useState([]);
    const [selectedTask, setSelectedTask] = useState([]);

    useEffect(() => {
        getListData();
    }, []);

    // Fetch all tasks
    const getListData = async () => {
        try {
            let res = await fetch('http://localhost:3200/tasks', {
                credentials: 'include'
            });
            res = await res.json();
            if (res.success) {
                setTaskData(res.result);
            } else {
                alert("Try after sometime");
            }
        } catch (err) {
            console.error(err);
            alert("Error fetching tasks");
        }
    }

    // Delete single task
    const deleteTask = async (id) => {
        try {
            let res = await fetch('http://localhost:3200/delete/' + id, {
                method: 'DELETE',
                credentials: 'include'
            });
            res = await res.json();
            if (res.success) {
                getListData();
            } else {
                alert("Try after sometime");
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Select / deselect all
    const selectAll = (event) => {
        if (event.target.checked) {
            const allIds = taskData.map((item) => item._id);
            setSelectedTask(allIds);
        } else {
            setSelectedTask([]);
        }
    }

    // Select / deselect single item
    const selectSingleItem = (id) => {
        if (selectedTask.includes(id)) {
            setSelectedTask(selectedTask.filter((item) => item !== id));
        } else {
            setSelectedTask([...selectedTask, id]);
        }
    }

    // Delete multiple selected tasks
    const deleteMultiple = async () => {
        if (selectedTask.length === 0) return alert("Select tasks first");
        try {
            let res = await fetch('http://localhost:3200/delete-multiple', {
                method: 'DELETE',
                credentials: 'include',
                body: JSON.stringify(selectedTask),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            res = await res.json();
            if (res.success) {
                setSelectedTask([]);
                getListData();
            } else {
                alert("Try after sometime");
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="list-container">
            <h1>To Do List</h1>
            <button onClick={deleteMultiple} className="delete-item delete-multiple">Delete Selected</button>

            <ul className="task-list">
                {/* Header */}
                <li className="list-header"><input type="checkbox" onChange={selectAll} checked={selectedTask.length === taskData.length && taskData.length > 0} /></li>
                <li className="list-header">S.No</li>
                <li className="list-header">Title</li>
                <li className="list-header">Description</li>
                <li className="list-header">Action</li>

                {/* Task Items */}
                {taskData && taskData.map((item, index) => (
                    <Fragment key={item._id}>
                        <li className="list-item">
                            <input
                                type="checkbox"
                                checked={selectedTask.includes(item._id)}
                                onChange={() => selectSingleItem(item._id)}
                            />
                        </li>
                        <li className="list-item">{index + 1}</li>
                        <li className="list-item">{item.text}</li> {/* text from backend */}
                        <li className="list-item">{item.completed ? "Completed" : "Pending"}</li>
                        <li className="list-item">
                            <button onClick={() => deleteTask(item._id)} className="delete-item">Delete</button>
                            <Link to={"update/" + item._id} className="update-item">Update</Link>
                        </li>
                    </Fragment>
                ))}
            </ul>
        </div>
    );
}
