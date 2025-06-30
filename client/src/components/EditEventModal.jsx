import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { Calendar, Clock, FileText, MapPin, Image as ImageIcon } from "lucide-react";

export default function EditEventModal({ isOpen, onClose, event, onUpdate }) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        date: event.date || "",
        time: event.time || "",
        location: event.location || "",
        imageUrl: event.imageUrl || "",
      });
    }
  }, [event, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Event title is required";
    if (!form.date) newErrors.date = "Event date is required";
    if (!form.time) newErrors.time = "Event time is required";
    if (!form.location.trim()) newErrors.location = "Event location is required";
    if (!form.description.trim()) newErrors.description = "Event description is required";
    if (!form.imageUrl.trim()) newErrors.imageUrl = "Image URL is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `https://event-management-app-production-f733.up.railway.app/api/events/${event._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Update failed");
      }

      await Swal.fire({
        icon: "success",
        title: "Event Updated!",
        text: "Your event has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      onUpdate(data.event);
      handleClose();
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Something went wrong!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      imageUrl: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              name="title"
              placeholder="Event Title"
              className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              value={form.title}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>


          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="date"
                name="date"
                className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
                value={form.date}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="time"
                name="time"
                className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  errors.time ? "border-red-500" : "border-gray-300"
                }`}
                value={form.time}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
            </div>
          </div>


          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              name="location"
              placeholder="Location"
              className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
              value={form.location}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>


          <div className="relative">
            <ImageIcon className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <input
              name="imageUrl"
              placeholder="Image URL"
              className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.imageUrl ? "border-red-500" : "border-gray-300"
              }`}
              value={form.imageUrl}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl}</p>}
          </div>

 
          <div>
            <textarea
              name="description"
              placeholder="Description"
              rows={4}
              className={`w-full px-4 py-2 border rounded resize-none focus:outline-none focus:ring-2 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              value={form.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

  
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded border hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
