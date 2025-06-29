import { useState, useEffect } from "react";

export default function EditEventModal({ isOpen, onClose, event, onUpdate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    photoURL: "",
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? event.date.split("T")[0] : "",
        photoURL: event.photoURL || "",
      });
    }
  }, [event]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `https://event-management-app-production-f733.up.railway.app/api/events/${event._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Failed to update event");

      const updatedEvent = await res.json();

      onUpdate(updatedEvent);
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Title"
            className="w-full border px-3 py-2 rounded"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full border px-3 py-2 rounded"
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
          />
          <input
            type="date"
            name="date"
            className="w-full border px-3 py-2 rounded"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            name="photoURL"
            placeholder="Photo URL"
            className="w-full border px-3 py-2 rounded"
            value={form.photoURL}
            onChange={handleChange}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
