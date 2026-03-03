# ⚽ Football Team Manager

A modern web application for managing your football team - players, formations, lineups, training sessions, and matches.

![Version](https://img.shields.io/badge/version-1.20.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)

## ✨ Features

- **Player Management** - FIFA Ultimate Team style player cards with customizable attributes
- **Formation Builder** - Create and edit tactical formations with visual pitch display
- **Lineup Generator** - AI-powered lineup suggestions based on player skills and availability
- **Event Management** - Schedule training sessions and matches with RSVP tracking
- **Match Results** - Record scores, goalscorers, and assists
- **Performance Ratings** - Rate player performances after matches
- **Role-Based Access** - Admin, Manager, and Player roles with appropriate permissions
- **Mobile Responsive** - Works great on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (optional, for cloud database)
- Vercel account (optional, for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/football-team-manager.git
   cd football-team-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials (optional)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Supabase Setup

See `supabase/schema.sql` for the database schema. Run this in your Supabase SQL editor to set up all tables.

## 🔐 Default Login

When running locally without Supabase, you can log in with any of the pre-configured users:

| User | Role | Password |
|------|------|----------|
| Admin | admin | admin123 |
| Coach Mike | manager | coach123 |
| Any Player | player | pass123 |

## 🛠 Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Custom CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel

## 📁 Project Structure

```
football-team-manager/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and API clients
│   ├── pages/           # Page components
│   ├── styles/          # Additional styles
│   ├── App.jsx          # Main application
│   └── main.jsx         # Entry point
├── supabase/            # Database schema
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by FIFA Ultimate Team card design
- Built with React and Tailwind CSS
- Powered by Supabase and Vercel
"# football-team-manager-deploy" 
"# football-team-manager-deploy" 
