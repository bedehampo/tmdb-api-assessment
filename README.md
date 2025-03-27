# TMDB RESTful API

A RESTful API integrating The Movie Database (TMDB) with NestJS and MongoDB, built for a technical assessment. This project will fetch, store, and manage movie data, providing endpoints to list, search, filter, and rate movies.

## Current Status
This is the initial setup, establishing the foundation with:
- **NestJS**: Backend framework running on Node.js 20 (Alpine).
- **MongoDB**: Local database container for storing movie data.
- **Yarn**: Dependency management.
- **Docker Compose**: Container orchestration.

The app currently responds with a basic endpoint (`GET /`) to verify MongoDB connectivity.

## Setup
### Prerequisites
- Docker and Docker Compose
- Yarn
- A TMDB API key (replace `TMDB_API_KEY` in `docker-compose.yml`)

### Running the Project
1. Clone the repository:
   ```bash
   git clone https://github.com/bedehampo/tmdb-api-assessment.git
   cd tmdb-api-assessment

## Features

### Data Synchronization
- **Overview**: Automatically fetches popular movies from TMDB and populates the MongoDB database on application startup.
- **Implementation**: 
  - Uses the TMDB `/movie/popular` endpoint to retrieve 20 movies per sync.
  - Syncs data via the `MoviesService` `populateDBWithMovies` method, triggered by NestJS’s `OnModuleInit` lifecycle hook.
  - Skips synchronization if the database already contains data (checked via document count).
- **Schema Design**:
  - **Fields**:
    - `movieId` (Number, unique): TMDB movie ID for deduplication and reference.
    - `title` (String, required): Movie title.
    - `overview` (String): Movie description.
    - `release_date` (Date): Release date.
    - `genres` (Array of `{ id: Number }`): Genre IDs from TMDB, adaptable for future name mapping.
    - `created_at` (Date): Timestamp for creation.
    - `updated_at` (Date): Timestamp for updates.
  - **Scalability**: 
    - Uses `movieId` as a unique key instead of MongoDB’s default `_id` to align with TMDB’s data model.
    - Flexible `genres` array supports future expansion (e.g., adding genre names).
    - Timestamps enable tracking of data updates.
  - **Adaptability**: Schema can be extended with additional TMDB fields (e.g., `poster_path`, `vote_average`) without breaking existing functionality.
