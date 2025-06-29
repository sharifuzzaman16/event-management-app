import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function EditEventModal({ isOpen, onClose, event, onUpdate }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    photoURL: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? event.date.split("T")[0] : "",
        photoURL: event.photoURL || "",
      });
    }
  }, [event, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `https://event-management-app-production-f733.up.railway.app/api/events/${event._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Update failed");
      }

      onUpdate(data.event);
      onClose();
      

      setForm({
        title: "",
        description: "",
        date: "",
        photoURL: "",
      });

    } catch (err) {
      console.error('Update error:', err);
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      photoURL: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="title"
              placeholder="Title"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <textarea
              name="description"
              placeholder="Description"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <input
              type="date"
              name="date"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <input
              name="photoURL"
              placeholder="Photo URL (optional)"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.photoURL}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded border hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}