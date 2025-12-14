# Intervue Poll System

A real-time polling application built with React, TypeScript, and Socket.IO for interactive classroom sessions.

## Features

### For Teachers
- **Live Poll Creation**: Create and manage polls in real-time
- **Student Management**: View connected students and manage participation
- **Real-time Results**: See live poll results as students respond
- **Session History**: Access past poll sessions and results
- **Interactive Chat**: Communicate with students during sessions
- **Automatic Session Management**: Sessions start and end automatically

### For Students
- **Easy Join**: Simple name-based entry to sessions
- **Live Polling**: Answer questions in real-time
- **Visual Feedback**: See results and compare with classmates
- **Interactive Chat**: Participate in classroom discussions
- **Responsive Design**: Works seamlessly on all devices

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Socket.IO, TypeScript
- **Database**: In-memory storage with Drizzle ORM
- **Real-time Communication**: Socket.IO
- **UI Components**: Radix UI, Lucide Icons
- **Build Tools**: Vite, ESBuild

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd intervue-poll-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
- **Teacher Dashboard**: http://localhost:5173/teacher
- **Student Portal**: http://localhost:5173/student

## Usage

### For Teachers

1. **Start Session**: Access the teacher dashboard to begin a polling session
2. **Create Polls**: Add questions with multiple choice options
3. **Manage Students**: View connected participants in real-time
4. **Monitor Results**: Watch responses come in live
5. **Chat Communication**: Use the integrated chat for classroom interaction
6. **View History**: Access past sessions and detailed results

### For Students

1. **Join Session**: Enter your name on the student portal
2. **Wait for Questions**: The interface will show when polls are active
3. **Answer Polls**: Select options and submit responses
4. **View Results**: See real-time results and class statistics
5. **Participate in Chat**: Join classroom discussions

## Project Structure

```
intervue-poll-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Page components
├── server/                # Express backend
│   ├── index.ts           # Main server file
│   ├── socket.ts          # Socket.IO event handlers
│   ├── storage.ts         # In-memory data storage
│   └── routes.ts          # API routes
├── shared/                # Shared types and schemas
└── package.json           # Dependencies and scripts
```

## Screenshots

### Application Interface

![Screenshot 1](./images/img1.png)
![Screenshot 2](./images/img2.png)
![Screenshot 3](./images/img3.png)
![Screenshot 4](./images/img4.png)
![Screenshot 5](./images/img5.png)
![Screenshot 6](./images/img6.png)
![Screenshot 7](./images/img7.png)
![Screenshot 8](./images/img8.png)
![Screenshot 9](./images/img9.png)
![Screenshot 10](./images/img10.png)
![Screenshot 11](./images/img11.png)
![Screenshot 12](./images/img12.png)
![Screenshot 13](./images/img13.png)
![Screenshot 14](./images/img14.png)
![Screenshot 15](./images/img15.png)
![Screenshot 16](./images/img16.png)
![Screenshot 17](./images/img17.png)
![Screenshot 18](./images/img18.png)
![Screenshot 19](./images/img19.png)
![Screenshot 20](./images/img20.png)
![Screenshot 21](./images/img21.png)

## Key Features Explained

### Real-time Communication
- Uses Socket.IO for instant message delivery
- Supports simultaneous teacher-student interactions
- Handles connection/disconnection events gracefully

### Session Management
- Automatic session creation on teacher join
- Session termination on question completion
- Incremental session naming (Question 1, Question 2, etc.)

### Poll System
- Multiple choice question support
- Real-time vote counting and result calculation
- Visual result representation with charts
- Historical data persistence

### Chat System
- Role-based messaging (teacher/student)
- Online status indicators
- Message history and unread counts

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Database schema updates

### Configuration
The project uses environment variables for configuration. Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please refer to the project documentation or create an issue in the repository.
