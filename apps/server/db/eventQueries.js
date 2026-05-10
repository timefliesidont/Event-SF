import { getConnection } from "./db.js";
import OracleDB from "oracledb";
import {readClob} from "../utils/event.js"

export const createEventQuery = async ({
  title,
  description,
  location,
  start_date,
  start_time,
  end_time,
  organizer_id,
}) => {
  const conn = await getConnection();
  try {
    await conn.execute(
      `INSERT INTO events (event_title, event_description, event_location, event_start_date, event_start_time, event_end_time, event_organizer_id)
       VALUES (:title, :description, :location, TO_DATE(:start_date, 'YYYY-MM-DD'), :start_time, :end_time, :organizer_id)`,
      {
        title,
        description,
        location,
        start_date,
        start_time,
        end_time,
        organizer_id,
      },
      { autoCommit: true }
    );
    return { success: true };
  } catch (err) {
    console.error("DB Error:", err);
    return { success: false, msg: err.message };
  } finally {
    await conn.close();
  }
};

export const fetchEventById = async (eventId) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT * FROM events
      WHERE event_id = :eventId
      `,
      [eventId],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT, }
    );

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        if (row.EVENT_DESCRIPTION && typeof row.EVENT_DESCRIPTION === "object") {
          row.EVENT_DESCRIPTION = await readClob(row.EVENT_DESCRIPTION);
        }
        return row;
      })
    );

    return rows[0] || null;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};


export const getAllEventsQuery = async (date, month, location = '') => {
  const conn = await getConnection();

  try {
    let query = `
      SELECT
        event_id,
        event_title,
        event_description,
        event_organizer_id,
        event_start_date,
        event_start_time,
        event_end_time,
        event_location,
        event_created_at
      FROM events
    `;

    const clauses = [];
    const params = {};

    // 1) Filter by exact date (YYYY-MM-DD)
    if (typeof date === 'string' && date.trim() !== '') {
      params.bDate = date.trim();
      clauses.push(`TRUNC(event_start_date) = TO_DATE(:bDate, 'YYYY-MM-DD')`);
    }

    // 2) Filter by month (1–12)
    if (typeof month === 'string' && month.trim() !== '') {
      const m = parseInt(month, 10);
      if (!isNaN(m)) {
        params.bMonth = m;
        clauses.push(`EXTRACT(MONTH FROM event_start_date) = :bMonth`);
      }
    }

    // 3) Filter by location
    if (typeof location === 'string' && location.trim() !== '') {
      params.bLocation = location.trim();
      clauses.push(`event_location = :bLocation`);
    }

    // Build WHERE clause if any filters are present
    if (clauses.length) {
      query += ' WHERE ' + clauses.join(' AND ');
    }

    // Execute the query
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });

    // Convert any CLOBs to strings
    const rows = await Promise.all(
      result.rows.map(async (row) => {
        if (row.EVENT_DESCRIPTION && typeof row.EVENT_DESCRIPTION === 'object') {
          row.EVENT_DESCRIPTION = await readClob(row.EVENT_DESCRIPTION);
        }
        return row;
      })
    );

    return rows;
  } finally {
    await conn.close();
  }
};



export const getOrganizerEventsQuery = async (organizerId, date, month) => {
  const conn = await getConnection();
  try {
    console.log("organizerId:", organizerId, "Type:", typeof organizerId);
    let query = `SELECT * FROM events WHERE event_organizer_id = :organizerId`;
    let params = { organizerId };


    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        if (row.EVENT_DESCRIPTION && typeof row.EVENT_DESCRIPTION === "object") {
          row.EVENT_DESCRIPTION = await readClob(row.EVENT_DESCRIPTION);
        }
        return row;
      })
    );

    return rows;
  } catch (err) {
    console.error("DB Query Error:", err.message);
    throw new Error("Failed to execute organizer event query");
  } finally {
    await conn.close();
  }
};

export const getMyEventsQuery = async (userId, date, month) => {
  const conn = await getConnection();
  try {
    let query = `
      SELECT
        e.event_id AS EVENT_ID,
        e.event_title AS EVENT_TITLE,
        e.event_description AS EVENT_DESCRIPTION,
        e.event_location AS EVENT_LOCATION,
        e.event_start_date AS EVENT_START_DATE,
        e.event_start_time AS EVENT_START_TIME,
        e.event_end_time AS EVENT_END_TIME,
        pe.joined_at AS JOINED_AT
      FROM events e
      JOIN participant_events pe
        ON pe.event_id = e.event_id
    `;
    const params = { userId };

    const clauses = [ `pe.user_id = :userId`];

    // 1) Filter by exact date (YYYY-MM-DD)
    if (typeof date === 'string' && date.trim() !== '') {
      params.bDate = date.trim();
      clauses.push(`TRUNC(event_start_date) = TO_DATE(:bDate, 'YYYY-MM-DD')`);
    }

    // 2) Filter by month (1–12)
    if (typeof month === 'string' && month.trim() !== '') {
      const m = parseInt(month, 10);
      if (!isNaN(m)) {
        params.bMonth = m;
        clauses.push(`EXTRACT(MONTH FROM event_start_date) = :bMonth`);
      }
    }


    // Build WHERE clause if any filters are present
    if (clauses.length) {
      query += ' WHERE ' + clauses.join(' AND ');
    }

    // Execute the query
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        if (row.EVENT_DESCRIPTION && typeof row.EVENT_DESCRIPTION === "object") {
          row.EVENT_DESCRIPTION = await readClob(row.EVENT_DESCRIPTION);
        }
        return row;
      })
    );

    return rows;
  } catch (error) {
    console.error("Error fetching my events:", error);
    throw error;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

export const insertParticipation = async (userId, eventId) => {
  const conn = await getConnection();
  try {
    const sql = `
      INSERT INTO participant_events (user_id, event_id, joined_at)
      VALUES (:userId, :eventId, SYSTIMESTAMP)
    `;
    await conn.execute(
      sql,
      { userId, eventId },
      { autoCommit: true }
    );
  } finally {
    await conn.close();
  }
};

export const deleteEventById = async (eventId) => {
  const conn = await getConnection();
  try {
    await conn.execute(
      `DELETE FROM events
       WHERE event_id = :eventId`,
      { eventId },
      { autoCommit: true }
    );
  } finally {
    await conn.close();
  }
};
