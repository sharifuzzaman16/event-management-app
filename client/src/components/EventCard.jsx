import { Book, CalendarCheck2, MapPin, Users } from "lucide-react";

function EventCard({ event, userEmail, onJoin }) {
  const hasJoined = event.joined?.includes(userEmail);
  const combinedDateTime = new Date(`${event.date}T${event.time}`);

  return (
    <div className="relative bg-base-100 shadow-md rounded-lg overflow-hidden w-full max-w-sm">

      <figure>
        <img
          className="w-full h-48 sm:h-56 object-cover"
          src={
            event.imageUrl ||
            "https://t4.ftcdn.net/jpg/06/71/92/37/240_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg"
          }
          alt={event.title}
        />
      </figure>

      <div className="p-6 flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{event.title}</h2>
        <p className="text-base text-gray-600">
          {event.description.length > 40
            ? event.description.slice(0, 40) + "..."
            : event.description}
        </p>

        <ul className="text-sm flex flex-col gap-2">
          <li className="flex items-center gap-2">
            <CalendarCheck2 size={18} />
            <span>
              {combinedDateTime.toLocaleDateString()} at{" "}
              {combinedDateTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={18} />
            <span>{event.location}</span>
          </li>
          <li className="flex items-center gap-2">
            <Book size={18} />
            <span>{event.creator}</span>
          </li>
        </ul>

        {/* Attendees Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-white text-sm px-2 py-1 rounded-md shadow">
          <Users size={16} />
          <span>{event.joined.length}</span>
        </div>

        {/* Join Button */}
        <div className="mt-4">
          <button
            onClick={onJoin}
            disabled={hasJoined}
            className={`btn btn-primary w-full ${hasJoined ? "btn-disabled" : ""}`}
          >
            {hasJoined ? "Joined" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
