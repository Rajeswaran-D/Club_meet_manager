require('dotenv').config();
const prisma = require('./src/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function debug() {
  console.log("==============================");
  console.log("STEP 3: CONFIGURATION");
  console.log("==============================");
  console.log("CWD:", process.cwd());
  console.log("DATABASE_URL Loaded?", !!process.env.DATABASE_URL);
  console.log("DIRECT_URL Loaded?", !!process.env.DIRECT_URL);
  console.log("JWT_SECRET Loaded?", !!process.env.JWT_SECRET);
  console.log("");

  console.log("==============================");
  console.log("STEP 4 & 5: PRISMA TEST");
  console.log("==============================");
  try {
    console.log("Executing prisma.user.findFirst()...");
    const user = await prisma.user.findFirst();
    console.log("Result:", user ? `User found (${user.email})` : "No users found in table.");
    
    if (user) {
      console.log("\n==============================");
      console.log("STEP 1: LOGIN FLOW TRACE");
      console.log("==============================");
      console.log("Controller entered");
      console.log("Request body validated (email, password present)");
      
      console.log("Prisma query starts (findUnique by email)");
      const foundUser = await prisma.user.findUnique({ where: { email: user.email } });
      console.log("Prisma query completes");
      console.log(`User found? ${!!foundUser}`);
      
      console.log("Password compare");
      const isMatch = await bcrypt.compare("password123", foundUser.passwordHash).catch(e => {
        console.error("Bcrypt Error:", e);
        return false;
      });
      console.log(`Password match? ${isMatch}`);
      
      console.log("JWT generation");
      try {
        const token = jwt.sign(
          { id: foundUser.id, role: foundUser.role, email: foundUser.email },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        console.log("JWT signed successfully.");
      } catch (jwtErr) {
        console.error("JWT Error:", jwtErr);
      }
      
      console.log("Response sent");
    }
  } catch (err) {
    console.log("\n==============================");
    console.log("STEP 2: FULL STACK TRACE");
    console.log("==============================");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
