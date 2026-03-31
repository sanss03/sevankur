/**
 * validateEnv.js
 *
 * Run before starting the server to ensure all required environment
 * variables are present and correctly formed.
 *
 * Usage:  node scripts/validateEnv.js
 */

require('dotenv').config();

const REQUIRED = [
  {
    key: 'MONGODB_URI',
    validate: (v) => v.startsWith('mongodb'),
    hint: 'Must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)'
  },
  {
    key: 'JWT_SECRET',
    validate: (v) => v.length >= 32,
    hint: 'Must be at least 32 characters long'
  },
  {
    key: 'GROK_API_KEY',
    validate: (v) => v.startsWith('xai-'),
    hint: 'Must start with "xai-"'
  }
];

const OPTIONAL_DEFAULTS = {
  PORT: '5000',
  NODE_ENV: 'development',
  GROK_MODEL: 'grok-1',
  GROK_TIMEOUT_MS: '10000',
  GROK_MAX_RETRIES: '2',
  AI_TEMPERATURE: '0.7',
  AI_CONTEXT_WINDOW: '10',
  LOG_LEVEL: 'info'
};

let hasErrors = false;

console.log('\n🔍  Validating environment variables...\n');

// ── Required ──────────────────────────────────────────────────
for (const { key, validate, hint } of REQUIRED) {
  const val = process.env[key];
  if (!val) {
    console.error(`  ❌  ${key} is MISSING`);
    console.error(`      → ${hint}\n`);
    hasErrors = true;
  } else if (!validate(val)) {
    console.error(`  ❌  ${key} is INVALID`);
    console.error(`      → ${hint}\n`);
    hasErrors = true;
  } else {
    console.log(`  ✅  ${key}`);
  }
}

// ── Optional / defaults ────────────────────────────────────────
console.log('\n  Optional variables (using defaults where missing):');
for (const [key, def] of Object.entries(OPTIONAL_DEFAULTS)) {
  const val = process.env[key];
  if (!val) {
    console.log(`  ℹ️   ${key} not set — will use default: ${def}`);
  } else {
    console.log(`  ✅  ${key} = ${val}`);
  }
}

// ── Result ────────────────────────────────────────────────────
if (hasErrors) {
  console.error('\n❌  Environment validation FAILED. Fix the errors above before starting.\n');
  process.exit(1);
} else {
  console.log('\n✅  All required environment variables are valid. Ready to start.\n');
  process.exit(0);
}
