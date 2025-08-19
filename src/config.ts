export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/minha_prefeitura',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  
  // Server
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
