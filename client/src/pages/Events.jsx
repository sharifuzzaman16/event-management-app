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
import { Calendar, Users, MapPin, Plus, Search } from "lucide-react";

function Events() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "current-week", label: "Current Week" },
    { id: "last-week", label: "Last Week" },
    { id: "current-month", label: "Current Month" },
    { id: "last-month", label: "Last Month" },
  ];

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Browse Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search, filter, and join events that match your interest.
          </p>
        </div>

         <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                dateFilter === filter.id
                  ? "bg-[#3B25C1] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>

        <div className="grid md:grid-cols-2 justify-items-center lg:grid-cols-3 gap-10">
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
