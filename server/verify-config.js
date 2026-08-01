require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const nodemailer = require('nodemailer');
const config = require('./src/config/env');

async function runVerification() {
  const report = {};

  // 1. Prisma / DB
  try {
    const prisma = require('./src/prisma');
    // try a simple query
    await prisma.$connect();
    // try a simple query
    await prisma.$queryRaw`SELECT 1`;
    report.database = '✅ Working';
    await prisma.$disconnect();
  } catch (err) {
    report.database = `❌ Failed: ${err.message}`;
  }

  // 2. Supabase Storage
  try {
    if (!config.supabase.url || !config.supabase.key) throw new Error('Missing Supabase URL or Key');
    const supabase = createClient(config.supabase.url, config.supabase.key);
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    // Check if clubmeet_documents exists
    const bucketExists = data.some(b => b.name === 'clubmeet_documents');
    if (bucketExists) {
      report.storage = '✅ Working (clubmeet_documents bucket found)';
    } else {
      report.storage = '⚠ Misconfigured: Connected, but clubmeet_documents bucket is missing.';
    }
  } catch (err) {
    report.storage = `❌ Failed: ${err.message}`;
  }

  // 3. Gemini API
  try {
    if (!config.ai.geminiKey) throw new Error('Missing Gemini API Key');
    const ai = new GoogleGenAI({ apiKey: config.ai.geminiKey });
    await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'Test connection. Reply with "OK".'
    });
    report.gemini = '✅ Working';
  } catch (err) {
    report.gemini = `❌ Failed: ${err.message}`;
  }

  // 4. Gmail SMTP
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.verify();
    report.email = '✅ Working';
  } catch (err) {
    report.email = `❌ Failed: ${err.message}`;
  }

  // 5. Env Vars check
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    EMAIL_USER: !!process.env.EMAIL_USER,
    EMAIL_PASS: !!process.env.EMAIL_PASS,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
  };
  
  const allVarsPresent = Object.values(envVars).every(v => v);
  if (allVarsPresent) {
    report.env = '✅ Working (All required variables present)';
  } else {
    const missing = Object.keys(envVars).filter(k => !envVars[k]);
    report.env = `⚠ Misconfigured: Missing ${missing.join(', ')}`;
  }

  console.log(JSON.stringify(report, null, 2));
}

runVerification();
