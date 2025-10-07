# Ticket Tracking System

A comprehensive ticket tracking system built with Node.js, Express, MongoDB, and React. Users can register, login, create tickets, manage ticket status, and add comments.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Dashboard**: View all tickets with filtering and statistics
- **Ticket Management**: Create, view, update, and delete tickets
- **Status Management**: Track ticket status (Open, In Progress, Resolved, Closed)
- **Priority System**: Set ticket priority (Low, Medium, High, Urgent)
- **Categories**: Organize tickets by type (Bug, Feature, Support, Other)
- **Comments**: Add comments to tickets for collaboration
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tracker
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ticket-tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

## Running the Application

### Development Mode (Recommended)

Run both backend and frontend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Manual Setup

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
cd client
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Tickets
- `GET /api/tickets` - Get all tickets (with filtering)
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Comments
- `GET /api/comments/ticket/:ticketId` - Get comments for ticket
- `POST /api/comments` - Add comment to ticket
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View all tickets with filtering options
3. **Create Ticket**: Click "New Ticket" to create a new support ticket
4. **View Ticket**: Click on any ticket to view details and add comments
5. **Update Status**: Change ticket status from the ticket detail page
6. **Add Comments**: Collaborate by adding comments to tickets

## Project Structure

```
tracker/
├── server/                 # Backend code
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js          # Server entry point
├── client/                # Frontend code
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API services
│   │   └── App.tsx       # Main app component
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.



