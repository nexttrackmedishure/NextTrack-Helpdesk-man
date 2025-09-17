#!/usr/bin/env node

/**
 * MongoDB Environment Setup Script
 * This script helps you set up your MongoDB connection for the NextTrack Helpdesk application
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️  MongoDB Environment Setup for NextTrack Helpdesk');
console.log('==================================================\n');

console.log('This script will help you create a .env.local file with your MongoDB connection details.\n');

console.log('📋 What you need:');
console.log('1. Your MongoDB Atlas connection string');
console.log('2. Your database name (default: nexttrack-helpdesk)\n');

console.log('🔗 To get your MongoDB connection string:');
console.log('1. Go to https://cloud.mongodb.com/');
console.log('2. Select your cluster');
console.log('3. Click "Connect" → "Connect your application"');
console.log('4. Copy the connection string\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupMongoDB() {
  try {
    const connectionString = await askQuestion('Enter your MongoDB connection string: ');
    
    if (!connectionString || connectionString.includes('<username>') || connectionString.includes('<password>')) {
      console.log('\n❌ Please provide a valid MongoDB connection string with your actual credentials.');
      console.log('Example: mongodb+srv://admin:password123@cluster0.abc123.mongodb.net/nexttrack-helpdesk?retryWrites=true&w=majority');
      rl.close();
      return;
    }

    const databaseName = await askQuestion('Enter your database name (press Enter for "nexttrack-helpdesk"): ') || 'nexttrack-helpdesk';

    // Create .env.local content
    const envContent = `# MongoDB Configuration
MONGODB_URI=${connectionString}
MONGODB_DB=${databaseName}

# Generated on ${new Date().toISOString()}
`;

    // Write to .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Successfully created .env.local file!');
    console.log(`📁 Location: ${envPath}`);
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your development server (npm run dev)');
    console.log('2. Try creating a new user - it should now save to MongoDB!');
    console.log('3. Check your MongoDB Atlas dashboard to see the new user');

  } catch (error) {
    console.error('\n❌ Error setting up MongoDB:', error.message);
  } finally {
    rl.close();
  }
}

// Test MongoDB connection
async function testConnection() {
  console.log('\n🧪 Testing MongoDB connection...');
  
  try {
    // Try to import and test the database service
    const { DatabaseService } = await import('./src/services/databaseService.js');
    const dbService = new DatabaseService();
    
    // Wait a moment for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (dbService.isConnected) {
      console.log('✅ MongoDB connection successful!');
      console.log('🎉 You can now create users and they will be saved to MongoDB.');
    } else {
      console.log('⚠️  MongoDB connection failed. Check your connection string and try again.');
    }
  } catch (error) {
    console.log('⚠️  Could not test connection. Make sure to restart your dev server after creating .env.local');
  }
}

// Main execution
setupMongoDB().then(() => {
  console.log('\n📝 Note: If you need to update your MongoDB connection later, just edit the .env.local file.');
  console.log('🔒 Keep your .env.local file secure and never commit it to version control.');
});
