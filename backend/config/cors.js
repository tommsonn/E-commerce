// CORS configuration helper
const getAllowedOrigins = () => {
  const origins = [
    // Development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    
    // Production - Add your deployed frontend URLs
    process.env.FRONTEND_URL,
    'https://tomshop.vercel.app',
    'https://tomshop.netlify.app',
    'https://www.tomshop.com',
    'https://tomshop.com',
  ].filter(Boolean);
  
  return origins;
};

export const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

export default getAllowedOrigins;