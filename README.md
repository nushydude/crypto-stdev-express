# Crypto Stdev API Gateway

## Overview
This repository hosts the Express backend for the Crypto Stdev project, written in Typescript. It serves as the API Gateway, reverse proxying requests to various microservices. Both the API Gateway and the microservices are deployed on Vercel, with the microservices being secured by a secret header.

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation

1. **Clone the Repository**
```bash
git clone [repository-url]
```

2. **Install Dependencies**
```bash
npm ci
```

3. **Environment Setup**
Create a .env file in the project root and populate it with the necessary secrets and configurations. Refer to the .env.example file.

### Running Locally
To run the project locally:

Start the Server

```bash
npm run dev
```

This will spin up the server using nodemon, allowing for live reloading.
