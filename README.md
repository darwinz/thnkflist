
# thnkfl

**A daily gratitude journal**  
Live site: https://thnkflapp.com

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Prerequisites](#prerequisites)  
5. [Setup & Installation](#setup--installation)  
6. [Usage](#usage)  
7. [Running with Docker / on Servers](#running-with-docker--on-servers)  
8. [Project Structure](#project-structure)  
9. [Contributing](#contributing)  
10. [License](#license)  
11. [Contact / Acknowledgements](#contact--acknowledgements)

---

## Overview

thnkfl is a simple, elegant web application for maintaining a daily gratitude journal. The goal is to help users reflect on and log what they are thankful for each day.

---

## Features

- Create new gratitude entries  
- View past entries  
- Minimal, distraction-free UI  
- Supports deployment with Docker  
- Built with modern web technologies  
- Configuration via environment variables  

---

## Tech Stack

| Layer | Technology / Tool |
|-------|--------------------|
| Frontend | React, Next.js |
| Backend / BaaS | Appwrite (or similar backend service) |
| Styling | Tailwind CSS |
| Build / Tooling | CRACO, Webpack (or Next.js build) |
| Deployment | Docker, Docker Compose |
| Configuration | `.env.local`, `appwrite.json`, etc. |

---

## Prerequisites

Ensure you have the following installed:

- Node.js (v10.0.0 or later)
- npm (v5.6.0 or later)
- Docker & Docker Compose (for containerized setup)  

---

## Setup & Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/darwinz/thnkfl.git
   cd thnkfl
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   * Create a `.env.local` file (or use `.env`) based on `.env.local.example` or as defined in the project.
   * Configure backend endpoints, API keys, etc.

4. **Run the app locally**

   ```bash
   make run
   ```

   This typically starts the development server, possibly spinning up backend services if needed.

---

## Usage

* Visit `http://localhost:3000` (or whichever port is defined)
* Sign up or log in (if authentication exists)
* Create new gratitude entries
* Browse past entries

---

## Running with Docker / on Servers

To run thnkfl in a containerized environment:

```bash
make run         # brings up app + any dependencies (e.g., backend) via docker-compose
```

To shut it down:

```bash
make teardown
```

You can customize `docker-compose.yml` and related configurations for production deployment (e.g. volumes, networks, environment variables, SSL).

---

## Project Structure

```
.
├── public/
│   └── screenshots/         # Screenshots or static images
├── src/                     # Application source code
├── .env.local               # Local environment variables (ignored in git)
├── craco.config.js
├── docker-compose.yml
├── package.json
├── tailwind.config.js
├── appwrite.json            # or similar backend configuration
├── Makefile
└── LICENSE.md
```

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

Please make sure to update tests (if any) and adhere to code style.

---

## License

This project is licensed under the **Apache License 2.0**. See [LICENSE.md](LICENSE.md) for full details.

---

## Contact / Acknowledgements

* Built by **darwinz**
* Thanks to all open source libraries used (React, Next.js, Tailwind, Appwrite, etc.)
* If you deploy or adapt this, a mention or attribution is appreciated
