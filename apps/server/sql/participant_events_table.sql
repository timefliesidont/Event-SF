DROP TABLE participant_events CASCADE CONSTRAINTS;

CREATE TABLE participant_events (
  user_id    INT       NOT NULL,
  event_id   INT       NOT NULL,
  joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),

  FOREIGN KEY (user_id)
    REFERENCES users(id),
   

  FOREIGN KEY (event_id)
    REFERENCES events(event_id)

);

select * from participant_events;