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
