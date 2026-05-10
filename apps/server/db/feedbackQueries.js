import OracleDB from "oracledb";
import { getConnection } from "./db.js";
import { readClob } from "../utils/event.js"; // in case comment_text is CLOB

export const fetchFeedbackByEventId = async (eventId) => {
  const conn = await getConnection();
  try {
    const query = `
      SELECT
        f.feedback_id,
        f.event_id,
        f.user_id,
        u.name AS user_name,
        f.comment_text,
        f.created_at
      FROM feedback f
      JOIN users u
        ON u.id = f.user_id
      WHERE f.event_id = :eventId
      ORDER BY f.created_at DESC
    `;

    const params = { eventId };

    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        // Convert CLOB to string if necessary
        if (row.COMMENT_TEXT && typeof row.COMMENT_TEXT === "object") {
          row.COMMENT_TEXT = await readClob(row.COMMENT_TEXT);
        }
        return row;
      })
    );

    return rows;
  } finally {
    await conn.close();
  }
};

export const insertFeedback = async (eventId, userId, commentText) => {
  const conn = await getConnection();
  try {
    const query = `
      INSERT INTO feedback (event_id, user_id, comment_text)
      VALUES (:eventId, :userId, :commentText)
      RETURNING feedback_id, event_id, user_id, comment_text, created_at
      INTO :feedback_id, :event_id, :user_id, :comment_text, :created_at
    `;

    const binds = {
      eventId,
      userId,
      commentText,
      feedback_id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
      event_id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
      user_id: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
      comment_text: { dir: OracleDB.BIND_OUT, type: OracleDB.STRING },
      created_at: { dir: OracleDB.BIND_OUT, type: OracleDB.DATE },
    };

    const result = await conn.execute(query, binds, { autoCommit: true });

    return {
      feedback_id: result.outBinds.feedback_id,
      event_id: result.outBinds.event_id,
      user_id: result.outBinds.user_id,
      comment_text: result.outBinds.comment_text,
      created_at: result.outBinds.created_at,
    };
  } finally {
    await conn.close();
  }
};

