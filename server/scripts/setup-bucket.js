require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
  const bucketName = 'clubmeet_documents';
  
  console.log(`Checking if bucket '${bucketName}' exists...`);
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }
  
  const exists = buckets.find(b => b.name === bucketName);
  
  if (exists) {
    console.log(`Bucket '${bucketName}' already exists.`);
    
    if (!exists.public) {
      console.log(`Updating bucket '${bucketName}' to be public...`);
      const { data, error } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        allowedMimeTypes: null,
        fileSizeLimit: null
      });
      if (error) {
        console.error('Failed to update bucket:', error);
      } else {
        console.log('Bucket updated to public successfully.');
      }
    } else {
      console.log('Bucket is already public.');
    }
  } else {
    console.log(`Creating bucket '${bucketName}' as public...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: null,
      fileSizeLimit: null
    });
    
    if (error) {
      console.error('Failed to create bucket:', error);
    } else {
      console.log('Bucket created successfully!');
    }
  }
}

setupBucket();
