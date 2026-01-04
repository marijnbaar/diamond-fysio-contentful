// Integrated cache test
// Run met: node --env-file=.env.local tests/cache.test.mjs
// Of via yarn: yarn test:cache

import { cacheData, getCachedData } from '../lib/cache.js';

async function testCache() {
  console.log('🧪 Testing Cache with Environment Variables\n');

  console.log('Environment check:');
  console.log('URL:', process.env.STORAGE_KV_REST_API_URL);
  console.log('Token:', process.env.STORAGE_KV_REST_API_TOKEN?.substring(0, 15) + '...\n');

  if (!process.env.STORAGE_KV_REST_API_URL || !process.env.STORAGE_KV_REST_API_TOKEN) {
    console.error('❌ Environment variables not loaded!');
    console.error('Run with: node --env-file=.env.local tests/cache.test.mjs');
    return false;
  }

  // Test 1: Cache and retrieve simple object
  console.log('1️⃣ Testing cache with object data:');
  const testKey = 'test-cache-' + Date.now();
  const testData = {
    message: 'Hello from cache!',
    timestamp: new Date().toISOString(),
    nested: {
      a: 1,
      b: 2,
      c: [3, 4, 5]
    }
  };

  try {
    await cacheData(testKey, testData, 60);
    console.log('✅ Cached data successfully\n');
  } catch (error) {
    console.error('❌ Failed to cache:', error.message);
    return false;
  }

  // Test 2: Retrieve cached data
  console.log('2️⃣ Testing cache retrieval:');
  try {
    const retrieved = await getCachedData(testKey);

    if (!retrieved) {
      console.error('❌ No data retrieved');
      return false;
    }

    console.log('✅ Retrieved data successfully');

    // Verify data matches
    if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
      console.log('✅ Data matches perfectly!\n');
    } else {
      console.error('❌ Data mismatch!');
      console.log('Expected:', testData);
      console.log('Got:', retrieved);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to retrieve:', error.message);
    return false;
  }

  // Test 3: Cache miss (non-existent key)
  console.log('3️⃣ Testing cache miss:');
  const missing = await getCachedData('non-existent-key-xyz-' + Date.now());
  if (missing === null) {
    console.log('✅ Correctly returns null for missing key\n');
  } else {
    console.error('❌ Should return null, got:', missing);
    return false;
  }

  return true;
}

testCache()
  .then(success => {
    console.log('='.repeat(60));
    if (success) {
      console.log('🎉 ALL CACHE TESTS PASSED!');
      console.log('✅ Vercel KV is working correctly');
      console.log('✅ Cache functions are working as expected');
    } else {
      console.log('💥 CACHE TESTS FAILED');
      process.exit(1);
    }
    console.log('='.repeat(60));
  })
  .catch(error => {
    console.error('\n💥 TEST CRASHED:', error);
    process.exit(1);
  });
