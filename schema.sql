DROP TABLE IF EXISTS city08;

CREATE TABLE IF NOT EXISTS city08 (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(225),
    longitude NUMERIC(10,7),
    latitude NUMERIC(10,7),
    formatted_query VARCHAR (225)
    );