function EventCard({ event, userEmail, onJoin }) {
  const hasJoined = event.joined?.includes(userEmail);

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <h3 className="text-xl font-semibold">{event.title}</h3>
      <p className="text-sm text-gray-600">{event.description}</p>
      <p className="text-sm">Date: {new Date(event.date).toLocaleDateString()}</p>

      <button
        onClick={onJoin}
        disabled={hasJoined}
        className={`px-4 py-1 rounded text-white ${
          hasJoined
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {hasJoined ? "Joined" : "Join"}
      </button>
    </div>
  );
}

export default EventCard;
