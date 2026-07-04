#!/usr/bin/env node

/**
 * Production Environment Validator
 * Validates that all required environment variables and configuration are set
 * for production deployment
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'WEB_ORIGIN'
];

const RECOMMENDED_VARS = [
  'LOG_LEVEL',
  'UPLOAD_SIZE_LIMIT',
  'SESSION_TIMEOUT'
];

const OPTIONAL_VARS = [
  'DATABASE_URL',
  'STORAGE_DRIVER'
];

function validateEnvironment() {
  console.log('🔍 Validating production environment configuration...\n');
  
  // Check if .env file exists
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ ERROR: .env file not found');
    console.error('   Create .env from .env.production template');
    process.exit(1);
  }
  
  // Load environment variables from .env
  require('dotenv').config();
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required variables
  console.log('📋 Required Variables:');
  REQUIRED_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.error(`  ❌ ${varName} is missing`);
      hasErrors = true;
    } else if (varName === 'JWT_SECRET' && value.length < 32) {
      console.error(`  ⚠️  ${varName} is too short (${value.length} chars, minimum 32 recommended)`);
      hasWarnings = true;
    } else if (varName === 'NODE_ENV' && value !== 'production') {
      console.error(`  ⚠️  ${varName} is set to "${value}", should be "production"`);
      hasWarnings = true;
    } else if (varName === 'WEB_ORIGIN' && value.includes('localhost')) {
      console.error(`  ⚠️  ${varName} contains localhost, update for production domain`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ ${varName}`);
    }
  });
  
  // Check recommended variables
  console.log('\n💡 Recommended Variables:');
  RECOMMENDED_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.warn(`  ⚠️  ${varName} is not set (using default)`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ ${varName} = ${value}`);
    }
  });
  
  // Check optional variables
  console.log('\n🔧 Optional Variables:');
  OPTIONAL_VARS.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName} = ${value}`);
    } else {
      console.log(`  ℹ️  ${varName} (not set)`);
    }
  });
  
  // Check file system
  console.log('\n📁 File System Check:');
  const dirs = [
    'apps/api/uploads',
    'apps/api/generated',
    'apps/api/storage'
  ];
  
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`  ✅ ${dir} exists`);
    } else {
      console.log(`  ⚠️  ${dir} does not exist (will be created on startup)`);
    }
  });
  
  // Check Node version
  console.log('\n🚀 Runtime Check:');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion >= 18) {
    console.log(`  ✅ Node.js ${nodeVersion} (supported)`);
  } else {
    console.error(`  ❌ Node.js ${nodeVersion} (minimum 18.x required)`);
    hasErrors = true;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('\n❌ VALIDATION FAILED - Please fix errors above');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('\n⚠️  VALIDATION PASSED WITH WARNINGS');
    console.warn('   Please review warnings and update configuration if needed');
    process.exit(0);
  } else {
    console.log('\n✅ VALIDATION PASSED - Ready for production!');
    process.exit(0);
  }
}

// Run validation
validateEnvironment();
