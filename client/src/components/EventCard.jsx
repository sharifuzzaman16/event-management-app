import { Link } from "react-router-dom";

function EventCard({ event, onJoin, isOwner, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-xl font-semibold">{event.title}</h2>
      <p className="text-gray-600">{event.description}</p>
      <p className="text-sm text-gray-500">📅 {event.date}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {!isOwner && (
          <button
            onClick={() => onJoin(event._id)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Join
          </button>
        )}
        {isOwner && (
          <>
            <button
              onClick={() => onEdit(event)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(event._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default EventCard;
