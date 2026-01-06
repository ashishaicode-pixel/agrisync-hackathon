# 🌾 AgriSync - Farm to Table Traceability

**Microsoft Cup 2026 Submission**

AgriSync empowers small producers to digitally synchronize their supply chain records with buyers through QR-based traceability. It ensures transparency, builds trust, and helps producers access premium markets by proving product origin and ethical practices.

## 🏆 Competition Ready
- ✅ Full-stack React + Node.js application
- ✅ Complete MVP with all features
- ✅ Azure deployment ready
- ✅ Production-grade code quality

## 🚀 Features

- **🔍 QR Code Traceability**: Generate unique QR codes for each batch
- **📝 Event Logging**: Track harvest, processing, certifications, and photos
- **✅ Buyer Verification**: Instant product verification via QR scan
- **⭐ Trust Scoring**: Automated trust calculation based on events and certifications
- **📱 Mobile Friendly**: Responsive design for all devices
- **📊 Producer Dashboard**: Manage batches and view analytics
- **🤖 AI Integration**: Smart chatbot for assistance
- **🌐 Multi-language**: Support for multiple languages
- **📈 Analytics**: Comprehensive data insights
- **🛒 Marketplace**: Direct buyer-producer connections

## 💻 Tech Stack

- **Frontend**: React 18, React Router, Axios, Lucide Icons
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT tokens
- **QR Codes**: QRCode library for generation, react-qr-code for display
- **Database**: SQLite with proper indexing
- **Deployment**: Vercel/Azure ready
- **Styling**: Modern CSS with responsive design

## 🎯 Microsoft Cup 2026

This project is specifically designed for Microsoft Cup 2026 competition:
- **Problem Statement**: Farm-to-table traceability for small producers
- **Solution**: QR-based supply chain transparency platform
- **Impact**: Helps farmers access premium markets through verified authenticity
- **Technology**: Modern full-stack web application
- **Scalability**: Ready for production deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agrisync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

## 📱 User Journey

### For Producers:
1. Visit the application
2. Click "Register" → Create account
3. Login → Access dashboard
4. Click "Create New Batch" → Add product details
5. View batch → Add supply chain events
6. Download QR code → Print and attach to products

### For Buyers:
1. Scan QR code with any camera app
2. View complete product verification page
3. See trust score, producer info, and supply chain journey

## 🌐 Deployment

Ready for deployment on:
- **Azure Static Web Apps** (recommended for Microsoft Cup)
- **Vercel**
- **Netlify**
- **Railway**
- **Heroku**

### Environment Variables

Create a `.env` file:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
DB_PATH=./database/agrisync.db
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- SQL injection prevention
- CORS configuration
- Input validation and sanitization

## 📊 Project Structure

```
agrisync/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── config/            # Configuration files
│   └── utils/             # Utility functions
├── routes/                # API routes
├── database/              # Database setup
├── middleware/            # Express middleware
├── services/              # Backend services
├── public/                # Static assets
└── package.json           # Dependencies
```

## 🏅 Competition Highlights

- **Innovation**: QR-based traceability for small farmers
- **Impact**: Bridges trust gap between producers and buyers
- **Technology**: Modern React + Node.js full-stack application
- **Scalability**: Production-ready architecture
- **User Experience**: Intuitive mobile-first design
- **Market Potential**: Addresses real-world agricultural challenges

## 📞 Support

For technical support or questions about this Microsoft Cup 2026 submission, please refer to the documentation or contact the development team.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Microsoft Cup 2026**
