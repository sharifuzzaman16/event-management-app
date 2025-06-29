import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

function AddEvent() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post("https://event-management-app-production-f733.up.railway.app/api/events", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Event added successfully!");
      setForm({ title: "", description: "", date: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error adding event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Event</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      {loading && <Loader />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          className="w-full px-4 py-2 border rounded"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full px-4 py-2 border rounded"
          value={form.description}
          onChange={handleChange}
          required
        ></textarea>

        <input
          type="date"
          name="date"
          className="w-full px-4 py-2 border rounded"
          value={form.date}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Event
        </button>
      </form>
    </div>
  );
}

export default AddEvent;
