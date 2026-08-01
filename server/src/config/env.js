const Joi = require('joi');

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(5000),
    DATABASE_URL: Joi.string().required().description('PostgreSQL DB url'),
    JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
    EMAIL_USER: Joi.string().email().required().description('Gmail account user'),
    EMAIL_PASS: Joi.string().required().description('Gmail app password'),
    GEMINI_API_KEY: Joi.string().required().description('Google Gemini API Key'),
    SUPABASE_URL: Joi.string().required().description('Supabase API URL'),
    SUPABASE_SERVICE_KEY: Joi.string().required().description('Supabase Service Role Key'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Environment Configuration Validation Error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: envVars.DATABASE_URL,
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  email: {
    user: envVars.EMAIL_USER,
    password: envVars.EMAIL_PASS,
  },
  ai: {
    geminiKey: envVars.GEMINI_API_KEY,
  },
  supabase: {
    url: envVars.SUPABASE_URL,
    key: envVars.SUPABASE_SERVICE_KEY,
  },
};
