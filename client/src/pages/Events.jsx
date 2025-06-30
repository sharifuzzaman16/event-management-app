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
import { Link } from "react-router-dom";
import { Calendar, Users, MapPin, Plus } from "lucide-react";

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

    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (a.time && b.time) {
        const datetimeA = new Date(`${a.date}T${a.time}`);
        const datetimeB = new Date(`${b.date}T${b.time}`);
        return datetimeB - datetimeA;
      }
      return dateB - dateA;
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-15 pb-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Browse <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search, filter, and join events that match your interest.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
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
                className={`px-3 py-1 rounded border text-sm font-medium transition-all duration-200 ${
                  dateFilter === btn.value
                    ? "bg-blue-600 text-white shadow"
                  : "bg-white hover:bg-gray-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 justify-items-center lg:grid-cols-3 gap-8">
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
    </div>
  );
}

export default Events;
