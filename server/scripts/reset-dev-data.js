require('dotenv').config();
const prisma = require('../src/prisma');

async function main() {
  console.log('Starting data reset...');

  // Using a transaction to ensure all dummy data is removed safely
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete all audit logs
      const deletedLogs = await tx.auditLog.deleteMany({});
      console.log(`Deleted ${deletedLogs.count} audit logs.`);

      // 2. Delete all documents (Supabase storage objects remain, but DB references clear)
      const deletedDocs = await tx.document.deleteMany({});
      console.log(`Deleted ${deletedDocs.count} documents.`);

      // 3. Delete all meeting participants
      const deletedParticipants = await tx.meetingParticipant.deleteMany({});
      console.log(`Deleted ${deletedParticipants.count} meeting participants.`);

      // 4. Delete all meetings
      const deletedMeetings = await tx.meeting.deleteMany({});
      console.log(`Deleted ${deletedMeetings.count} meetings.`);

      // 5. Delete all members
      const deletedMembers = await tx.member.deleteMany({});
      console.log(`Deleted ${deletedMembers.count} members.`);

      // Note: We deliberately DO NOT delete Users, keeping admin accounts intact.
    });

    console.log('✅ Development data successfully cleaned! Database is production-ready.');
  } catch (error) {
    console.error('❌ Error cleaning data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
