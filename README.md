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

### Endpoint Updates
- **Overview**: Provides endpoints to interact with the stored movie data, enhanced with search and filtering capabilities.
- **Implementation**: 
- GET /movies: Retrieves a list of movies with optional search and filtering.
- **Query Parameters**:
- search (String): Filters movies by title (case-insensitive partial match).
- genre (Number): Filters movies by a specific genre ID.
- year (Number): Filters movies by release year.

- Example: GET `GET /movies?search=interstellar&genre=18&release_year=2014`
- search (String): Filters movies by title (case-insensitive partial match).

- **Authentication**:
  - Predefined users are populated on startup if they don’t exist:
    - `magdy@buen.ro` / `password`
    - `van@buen.ro` / `password`
    - `hampoherobede@gmail.com` / `password`
  - Passwords are hashed with `bcrypt` for security.
  - JWT tokens are issued via the `/auth/login` endpoint and required for protected routes, secured with `@nestjs/passport` and `passport-jwt`.
  - **Login Example**:
  Example: `POST /user/login`, `GET /movies/genre`, `GET /movies/:id` `POST /movies/rate-movie` `GET /movies/rating/:id`

- **Testing**: 
 - Run yarn test
  - Passing Suites: 4 out of 5 test suites pass successfully:
  - `src/user/user.controller.spec.ts`
  - `src/user/user.service.spec.ts`
  - `src/tmdb/tmdb.service.spec.ts`
  - `src/app.controller.spec.ts`
- Failing Suite:`src/movies/movies.service.spec.ts` fails with: 


## Database Setup

This project uses MongoDB as its database and Mongoose as the ODM (Object Data Modeling) library for NestJS. The database connection is configured using `MongooseModule.forRootAsync`.

### Configuration

The database connection URI and other settings are managed using environment variables. This allows for flexibility across different environments (local development, Docker containers, production).

The following environment variables are used:

* `DATABASE_HOST`:   The hostname or IP address of the MongoDB server.
* `DATABASE_PORT`:   The port number where the MongoDB server is listening.
* `DATABASE_NAME`:   The name of the database to connect to.

**Optional (commented out in the provided code):**

* `DATABASE_USER`:   Username for MongoDB authentication (if enabled).
* `DATABASE_PASSWORD`: Password for MongoDB authentication (if enabled).

### Local Machine Setup

1.  **Install MongoDB:** Ensure MongoDB is installed and running on your local machine. You can download it from the official MongoDB website.
2.  **Environment Variables:**
    * Create a `.env` file in the root of your project.
    * Define the necessary environment variables in your `.env` file. For example:

        ```
        DATABASE_HOST=localhost
        DATABASE_PORT=27017
        DATABASE_NAME=your_local_db_name
        # DATABASE_USER=your_user  (if applicable)
        # DATABASE_PASSWORD=your_password (if applicable)
        ```
    * Adjust the values as needed to match your local MongoDB setup. The host is often `localhost` and the port is often the default `27017`.
3.  **Run the Application:** When you run the application (e.g., `npm start` or `yarn start`), NestJS will use the configuration from your `.env` file to connect to the MongoDB instance running on your local machine.

### Docker Setup

1.  **MongoDB Container:** When using Docker, you'll typically have a separate Docker container for your MongoDB instance.
2.  **Docker Compose (Recommended):** Docker Compose is commonly used to define and manage multi-container Docker applications. A `docker-compose.yml` file will define both your NestJS application container and your MongoDB container.
3.  **Environment Variables:**
    * In your `docker-compose.yml` file, you'll define the environment variables for your NestJS application container.
    * These variables will need to match the settings of your MongoDB container.
    * Example `docker-compose.yml` snippet:

        ```yaml
        version: '3.8'
        services:
          app:
            # ... your NestJS app configuration ...
            environment:
              DATABASE_HOST: mongo # 'mongo' is often the service name of the MongoDB container
              DATABASE_PORT: 27017
              DATABASE_NAME: your_docker_db_name
              # DATABASE_USER: your_docker_user (if applicable)
              # DATABASE_PASSWORD: your_docker_password (if applicable)
            # ... other app settings ...
          mongo:
            image: mongo # Use the official MongoDB image
            # ... mongo container settings ...
        ```
    * **Important:** Note that `DATABASE_HOST` is often set to the *service name* of the MongoDB container in `docker-compose.yml` (e.g., `mongo`). Docker's DNS will resolve this service name to the correct IP address of the MongoDB container.
4.  **Running with Docker Compose:** When you use `docker-compose up`, Docker Compose will start both your NestJS application container and the MongoDB container. Your NestJS application will use the environment variables defined in `docker-compose.yml` to connect to the MongoDB container.

**Key Differences Summarized**

* **DATABASE\_HOST:**
    * **Local:** Usually `localhost` or `127.0.0.1` if MongoDB is running on the same machine.
    * **Docker:** Often the *service name* of the MongoDB container (e.g., `mongo`) so that Docker's DNS can handle the connection.
* **Environment Variable Definition:**
    * **Local:** In a `.env` file.
    * **Docker:** In the `docker-compose.yml` file (or through other Docker environment variable mechanisms).

By following this setup, your NestJS application will be able to connect to a MongoDB database correctly, whether it's running on your local machine or within a Docker container.


### APIs Documentation - **http://localhost:3000/api**
