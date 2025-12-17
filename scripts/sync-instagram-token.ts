#!/usr/bin/env tsx
/**
 * Script to sync Instagram token from Vercel to local .env file
 * Usage: npm run instagram:token:sync
 *
 * This uses Vercel CLI to pull environment variables since the API
 * doesn't return decrypted values for security reasons.
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

async function getTokenFromVercel(): Promise<string | null> {
  try {
    // Use Vercel CLI to pull env vars
    // This writes to .env.local by default
    console.log('🔄 Pulling environment variables from Vercel...');
    console.log('   (This uses Vercel CLI - make sure you have it installed: npm i -g vercel)');

    // Try to use Vercel CLI, fallback to npx if not globally installed
    let vercelCmd = 'vercel';
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch {
      // Fallback to npx
      vercelCmd = 'npx vercel';
      console.log('   Using npx vercel (Vercel CLI not globally installed)');
    }

    try {
      // Remove VERCEL_PROJECT_ID from environment if set, so Vercel CLI uses .vercel/project.json instead
      const env = { ...process.env };
      if (env.VERCEL_PROJECT_ID && !env.VERCEL_ORG_ID) {
        delete env.VERCEL_PROJECT_ID;
      }

      execSync(`${vercelCmd} env pull .env.local --yes`, {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: env
      });
    } catch (error: any) {
      if (error.message.includes('command not found') || error.code === 'ENOENT') {
        console.error('❌ Vercel CLI not found. Trying alternatives...');
        // Try npx as last resort
        try {
          // Remove VERCEL_PROJECT_ID from environment if set, so Vercel CLI uses .vercel/project.json instead
          const env = { ...process.env };
          if (env.VERCEL_PROJECT_ID && !env.VERCEL_ORG_ID) {
            delete env.VERCEL_PROJECT_ID;
          }

          execSync('npx vercel env pull .env.local --yes', {
            stdio: 'inherit',
            cwd: process.cwd(),
            env: env
          });
        } catch (npxError: any) {
          const errorMsg = npxError.message || npxError.toString();
          if (errorMsg.includes('VERCEL_PROJECT_ID') && errorMsg.includes('VERCEL_ORG_ID')) {
            console.error('❌ Vercel CLI requires both VERCEL_PROJECT_ID and VERCEL_ORG_ID');
            console.error(
              '   Solution: Remove VERCEL_PROJECT_ID from your .env, or add VERCEL_ORG_ID'
            );
            console.error('   Alternatively, run "vercel link" to create .vercel/project.json');
            throw new Error('Vercel configuration incomplete');
          }
          console.error('❌ Could not run Vercel CLI. Please:');
          console.error('   1. Install: npm i -g vercel');
          console.error('   2. Login: vercel login');
          console.error('   3. Link project: vercel link');
          throw new Error('Vercel CLI not available');
        }
      } else {
        // Check if it's the VERCEL_PROJECT_ID/VERCEL_ORG_ID error
        const errorMsg = error.message || error.toString();
        if (errorMsg.includes('VERCEL_PROJECT_ID') && errorMsg.includes('VERCEL_ORG_ID')) {
          console.error('❌ Vercel CLI requires both VERCEL_PROJECT_ID and VERCEL_ORG_ID');
          console.error(
            '   Solution: Remove VERCEL_PROJECT_ID from your .env, or add VERCEL_ORG_ID'
          );
          console.error('   Alternatively, run "vercel link" to create .vercel/project.json');
          throw new Error('Vercel configuration incomplete');
        }
        throw error;
      }
    }

    // Read the .env.local file that was just created/updated
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envLocalPath)) {
      throw new Error('.env.local file not created by Vercel CLI');
    }

    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    const match = envContent.match(/^INSTAGRAM_API_KEY=(.+)$/m);

    if (match && match[1]) {
      return match[1].trim();
    }

    // If not in .env.local, check .env
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent2 = fs.readFileSync(envPath, 'utf-8');
      const match2 = envContent2.match(/^INSTAGRAM_API_KEY=(.+)$/m);
      if (match2 && match2[1]) {
        return match2[1].trim();
      }
    }

    return null;
  } catch (error: any) {
    console.error('Error pulling from Vercel:', error.message);
    throw error;
  }
}

// No need to update manually - Vercel CLI already wrote .env.local

async function main() {
  try {
    console.log('🔄 Fetching Instagram token from Vercel...');
    const token = await getTokenFromVercel();

    if (!token) {
      console.error('❌ Token not found or is empty in Vercel');
      process.exit(1);
    }

    console.log('✅ Token retrieved from Vercel');
    console.log(`✅ Token found: ${token.substring(0, 20)}...`);
    console.log('✅ Token is now in your .env.local file (pulled by Vercel CLI)');
    console.log('   Restart your dev server (npm run dev) for changes to take effect.');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Make sure:');
    console.error('  1. You have Vercel CLI installed: npm i -g vercel');
    console.error('  2. You are logged in to Vercel: vercel login');
    console.error('  3. Your project is linked: vercel link (if not already)');
    console.error('  4. Or use npx instead: npx vercel env pull .env.local');
    process.exit(1);
  }
}

main();
