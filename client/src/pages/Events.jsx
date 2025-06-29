import EventCard from "../components/EventCard";

const Events = () => {
  const events = [];

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event._id} event={event} onJoin={handleJoin} />
      ))}
    </div>
  );
};

export default Events;
