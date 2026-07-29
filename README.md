# CloudNest

**Live Link:** https://cloud-nest-smoky.vercel.app

CloudNest is a modern cloud-based file sharing platform built with React, TypeScript, AWS, and Vite. It enables users to securely upload, organize, manage, and share files using AWS cloud services. The project demonstrates a serverless architecture with secure authentication, cloud storage, and scalable backend services.

## Features

- Secure user authentication with Amazon Cognito
- Upload files directly to Amazon S3
- Download files securely using pre-signed URLs
- Organize files into folders
- Search and filter files
- Sort files by different criteria
- Mark files as favorites
- Storage usage overview
- File statistics dashboard
- Responsive modern user interface
- Serverless backend using AWS Lambda
- REST API with Amazon API Gateway
- Metadata management using Amazon DynamoDB

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Recharts
- CSS

### Backend

- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- Amazon S3
- Amazon Cognito
- IAM

## AWS Services Used

- Amazon S3
- Amazon Cognito
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- AWS IAM

## Project Structure

```
CloudNest
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.ts
│
└── backend
    ├── lambda
    └── infrastructure
```

## Installation

Clone the repository

```bash
git clone https://github.com/singhnandini60810-sys/CloudNest.git
```

Navigate to the frontend

```bash
cd CloudNest/frontend
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Create a `.env` file inside the frontend directory.

Example:

```env
VITE_API_BASE_URL=YOUR_API_GATEWAY_URL
VITE_COGNITO_USER_POOL_ID=YOUR_USER_POOL_ID
VITE_COGNITO_CLIENT_ID=YOUR_CLIENT_ID
VITE_AWS_REGION=eu-north-1
```

## Production Build

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

## Deployment

CloudNest is deployed on **Vercel**.

Live Website

https://cloud-nest-smoky.vercel.app

## Screenshots

Add screenshots of:

- Login Page
- Dashboard
- My Files
- Upload Modal
- Storage Overview
- File Statistics

## Future Improvements

- File versioning
- Shared folders
- Activity logs
- Role-based access control
- Drag and drop uploads
- File preview support
- Storage analytics
- Notifications

## Author

**Nandini Singh**

GitHub

https://github.com/singhnandini60810-sys

Portfolio

https://nandini-singh-portfolio-ictw.vercel.app

LinkedIn

https://www.linkedin.com/in/nandini-singh/

## License

This project is developed for educational purposes and demonstrates the implementation of a secure cloud-based file sharing platform using AWS serverless services.
