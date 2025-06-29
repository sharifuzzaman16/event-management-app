import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  isWithinInterval,
} from "date-fns";

function Events() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); 

  const userEmail = user?.email;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://event-management-app-production-f733.up.railway.app/api/events");
      setEvents(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError("Failed to load events.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];

    if (search.trim()) {
      result = result.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    const today = new Date();
    let range = null;

    if (dateFilter === "current-week") {
      range = {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    } else if (dateFilter === "last-week") {
      const lastWeek = subWeeks(today, 1);
      range = {
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    } else if (dateFilter === "current-month") {
      range = {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    } else if (dateFilter === "last-month") {
      const lastMonth = subMonths(today, 1);
      range = {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    }

    if (range) {
      result = result.filter((e) =>
        isWithinInterval(new Date(e.date), range)
      );
    }

    // Sort events by date and time in descending order (most recent first)
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // If events have time property, combine date and time for accurate sorting
      if (a.time && b.time) {
        const datetimeA = new Date(`${a.date}T${a.time}`);
        const datetimeB = new Date(`${b.date}T${b.time}`);
        return datetimeB - datetimeA; // Descending order
      }
      
      // If no time property, sort by date only
      return dateB - dateA; // Descending order
    });

    setFiltered(result);
  }, [search, dateFilter, events]);

  const handleJoin = async (eventId) => {
    try {
      const res = await axios.patch(
        `https://event-management-app-production-f733.up.railway.app/api/events/join/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? { ...event, joined: [...(event.joined || []), userEmail] }
            : event
        )
      );

      alert(res.data.message || "Joined successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join event.");
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <input
          type="text"
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded w-full md:w-1/3"
        />

        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" },
            { label: "Current Week", value: "current-week" },
            { label: "Last Week", value: "last-week" },
            { label: "Current Month", value: "current-month" },
            { label: "Last Month", value: "last-month" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setDateFilter(btn.value)}
              className={`px-3 py-1 rounded border ${
                dateFilter === btn.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-center col-span-full">No events found.</p>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              userEmail={userEmail}
              onJoin={() => handleJoin(event._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Events;