import { createEventQuery, getAllEventsQuery, getOrganizerEventsQuery } from "../db/eventQueries.js";
import { fetchEventById } from "../db/eventQueries.js";
import { insertParticipation } from "../db/eventQueries.js";
import { getMyEventsQuery , deleteEventById } from "../db/eventQueries.js";
import IntervalTree from "../utils/intervalTree.js"; 

export const createEvent = async (req, res) => {
  const { title, description, location, start_date, start_time, end_time } = req.body;
  const organizer_id = req.user.id;

  console.log("Request body:", req.body);

  // Validate required fields
  if (!title || !start_date || !start_time || !end_time || !location) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start_date)) {
    return res.status(400).json({ msg: "Invalid date format. Use YYYY-MM-DD" });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res.status(400).json({ msg: "Invalid time format. Use HH:MM" });
  }

  try {
    // Parse requested start and end times (Asia/Kolkata)
    // const reqStart = new Date(`${start_date}T${start_time}:00+05:30`);
    // const reqEnd = new Date(`${start_date}T${end_time}:00+05:30`);
    const reqStart = new Date(`${start_date}T${start_time}`);
    const reqEnd = new Date(`${start_date}T${end_time}`);

    // Validate times
    if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime())) {
      return res.status(400).json({ msg: "Invalid date or time" });
    }
    if (reqEnd <= reqStart) {
      return res.status(400).json({ msg: "End time must be after start time" });
    }

    const reqInterval = {
      start: reqStart.getTime(),
      end: reqEnd.getTime(),
    };
    const duration = reqInterval.end - reqInterval.start;

    console.log("Requested interval:", {
      start: reqStart.toISOString(),
      end: reqEnd.toISOString(),
      start_ms: reqInterval.start,
      end_ms: reqInterval.end,
      duration_ms: duration,
    });

    // Fetch existing events
    console.log("Fetching events for date:", start_date, "location:", location);
    const existingEvents = await getAllEventsQuery(start_date, null, location);
    console.log("Existing events:", existingEvents);

    // Validate event dates and build intervals
    const intervals = existingEvents.map((evt) => {
      // Use requested start_date instead of EVENT_START_DATE
      const evtDate = start_date; // Force correct date
      const start = new Date(`${evtDate}T${evt.EVENT_START_TIME}:00+05:30`).getTime();
      const end = new Date(`${evtDate}T${evt.EVENT_END_TIME}:00+05:30`).getTime();

      // Warn if EVENT_START_DATE is incorrect
      const storedDate = evt.EVENT_START_DATE.toISOString().split('T')[0];
      if (storedDate !== start_date) {
        console.warn(
          `Mismatched EVENT_START_DATE for event ID ${evt.EVENT_ID}: ` +
          `stored ${storedDate}, expected ${start_date}`
        );
      }

      if (isNaN(start) || isNaN(end)) {
        console.error(`Invalid time for event ID ${evt.EVENT_ID}`);
        throw new Error(`Invalid time for event ID ${evt.EVENT_ID}`);
      }

      return { start, end, event_id: evt.EVENT_ID };
    });

    console.log("Existing intervals:", intervals);

    // Check for conflicts
    const hasConflict = intervals.some((interval) => {
      const overlap = reqInterval.start < interval.end && reqInterval.end >= interval.start;
      if (overlap) {
        console.log(`Conflict with event ID ${interval.event_id}:`, {
          existing: {
            start: new Date(interval.start).toISOString(),
            end: new Date(interval.end).toISOString(),
          },
          requested: {
            start: reqStart.toISOString(),
            end: reqEnd.toISOString(),
          },
        });
      }
      return overlap;
    });

    if (!hasConflict) {
      // Create event
      console.log("No conflicts, creating event");
      const result = await createEventQuery({
        title,
        description,
        location,
        start_date,
        start_time,
        end_time,
        organizer_id,
      });

      const io = req.io;
      if (io) {
        io.emit('eventCreated' );
        console.log("One event was recently created ");
      } else {
        console.error("Socket.IO instance not available in event controller.");
      }

      if (!result.success) {
        return res.status(500).json({ msg: result.msg });
      }

      return res.status(201).json({
        msg: "Event created successfully",
        event_id: result.event_id,
      });
    }

    // Generate suggestions
    console.log("Generating suggestions");
    intervals.sort((a, b) => a.start - b.start);
    const suggestions = [];
    const dayStart = new Date(`${start_date}T00:00:00+05:30`).getTime();
    const dayEnd = new Date(`${start_date}T23:59:59+05:30`).getTime();

    // Suggest before first event
    if (intervals.length === 0 || reqInterval.start < intervals[0].start) {
      const suggStart = Math.max(dayStart, reqInterval.start - duration);
      const suggEnd = Math.min(suggStart + duration, intervals.length ? intervals[0].start : dayEnd);
      if (suggEnd - suggStart >= duration && suggStart >= dayStart) {
        suggestions.push({
          start_time: new Date(suggStart).toTimeString().slice(0, 5),
          end_time: new Date(suggEnd).toTimeString().slice(0, 5),
        });
      }
    }

    // Suggest gaps between events
    for (let i = 0; i < intervals.length - 1 && suggestions.length < 3; i++) {
      const gapStart = intervals[i].end;
      const gapEnd = intervals[i + 1].start;
      if (gapEnd - gapStart >= duration) {
        const suggStart = gapStart;
        const suggEnd = suggStart + duration;
        if (suggEnd <= dayEnd) {
          suggestions.push({
            start_time: new Date(suggStart).toTimeString().slice(0, 5),
            end_time: new Date(suggEnd).toTimeString().slice(0, 5),
          });
        }
      }
    }

    // Suggest after last event
    if (intervals.length > 0 && suggestions.length < 3) {
      const lastInterval = intervals[intervals.length - 1];
      const suggStart = lastInterval.end;
      const suggEnd = suggStart + duration;
      if (suggEnd <= dayEnd) {
        suggestions.push({
          start_time: new Date(suggStart).toTimeString().slice(0, 5),
          end_time: new Date(suggEnd).toTimeString().slice(0, 5),
        });
      }
    }

    // Fallback: suggest early next day
    if (suggestions.length === 0) {
      const nextDay = new Date(dayStart + 24 * 60 * 60 * 1000);
      suggestions.push({
        start_time: "09:00",
        end_time: new Date(nextDay.getTime() + duration).toTimeString().slice(0, 5),
        note: "No slots available on requested date; try next day",
      });
    }

    console.log(suggestions);
    
    return res.status(409).json({ msg: "Time slot unavailable", suggestions });

  } catch (err) {
    console.error("Create event error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};


export const getOrganizerEvents = async (req, res) => {
  try {

    const id = req.user.id;
    const { date, month } = req.query;

    const events = await getOrganizerEventsQuery(id, date, month);
    //console.log(events);
    res.json(events);

  } catch (error) {
    console.error("Controller Error:", error.message);  // no circular issues here
    res.status(500).json({ msg: "Failed to fetch events" });
  }
};



export const getAllEvents = async (req, res) => {
  try {
    const { date, month } = req.query;
    console.log("Received filters:", { date, month });

    const events = await getAllEventsQuery(date, month);

    res.json(events);
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).json({ msg: "Failed to fetch events", error: error.message });
  }
};


export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { date, month } = req.query;
    console.log("Received filters:", { date, month });

    const events = await getMyEventsQuery(userId, date, month);

    res.json(events);
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).json({ msg: "Failed to fetch events", error: error.message });
  }
};

export const getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await fetchEventById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinEvent = async (req, res) => {
  const userId  = req.user.id;                    // from verifyToken
  const eventId = parseInt(req.params.eventId, 10);

  try {
    await insertParticipation(userId, eventId);
    res.status(201).json({ message: "Joined event successfully." });
  } catch (error) {
    console.error("Join event error full:", JSON.stringify(error, null, 2));
  
    const isConflict = error.errorNum === 1 || error.code === "23505";
    if (isConflict) {
      return res.status(409).json({ message: "You have already joined this event." });
    }
  
    return res.status(500).json({ message: "Could not join event.", error: error.message });
  }  
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const event = await fetchEventById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await deleteEventById(eventId);

    const io = req.io;
    if (io) {
      io.emit('eventDeleted', { eventId });
      console.log("One event was recently deleted :", eventId);
    } else {
      console.error("Socket.IO instance not available in event controller.");
    }
    
    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};