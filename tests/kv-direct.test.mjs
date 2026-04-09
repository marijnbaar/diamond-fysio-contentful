// Direct test van Vercel KV zonder wrappers
// Run met: node --env-file=.env.local tests/kv-direct.test.mjs
// Of via yarn: yarn test:kv

import { createClient } from '@vercel/kv';

console.log('Environment check:');
console.log('KV URL configured:', Boolean(process.env.STORAGE_KV_REST_API_URL));
console.log('KV token configured:', Boolean(process.env.STORAGE_KV_REST_API_TOKEN), '\n');

const kv = createClient({
  url: process.env.STORAGE_KV_REST_API_URL,
  token: process.env.STORAGE_KV_REST_API_TOKEN
});

async function testDirect() {
  console.log('🧪 Direct Vercel KV Test\n');

  const testKey = 'direct-test-' + Date.now();
  const testValue = 'Hello World!';

  try {
    // Test 1: Simple set
    console.log('1️⃣ Testing kv.set()...');
    await kv.set(testKey, testValue);
    console.log('✅ Set successful\n');

    // Test 2: Simple get
    console.log('2️⃣ Testing kv.get()...');
    const result = await kv.get(testKey);
    console.log('Result:', result);
    console.log('Type:', typeof result);

    if (result === testValue) {
      console.log('✅ Get successful - values match!\n');
    } else {
      console.log('❌ Values do not match');
      console.log('Expected:', testValue);
      console.log('Got:', result, '\n');
    }

    // Test 3: Set with expiration
    console.log('3️⃣ Testing kv.set() with expiration...');
    const exKey = 'ex-test-' + Date.now();
    await kv.set(exKey, 'expires in 60s', { ex: 60 });
    console.log('✅ Set with expiration successful\n');

    // Test 4: Get the expiring key
    console.log('4️⃣ Testing get of expiring key...');
    const exResult = await kv.get(exKey);
    console.log('Result:', exResult);
    if (exResult === 'expires in 60s') {
      console.log('✅ Get of expiring key successful!\n');
    } else {
      console.log('❌ Failed to get expiring key\n');
    }

    // Test 5: Set JSON
    console.log('5️⃣ Testing with JSON data...');
    const jsonKey = 'json-test-' + Date.now();
    const jsonData = { name: 'Test', value: 123, nested: { a: 1, b: 2 } };
    await kv.set(jsonKey, JSON.stringify(jsonData), { ex: 60 });
    console.log('✅ JSON set successful\n');

    // Test 6: Get JSON
    console.log('6️⃣ Testing get of JSON data...');
    const jsonResult = await kv.get(jsonKey);
    console.log('Raw result:', jsonResult);
    console.log('Type:', typeof jsonResult);

    if (typeof jsonResult === 'string') {
      const parsed = JSON.parse(jsonResult);
      console.log('Parsed:', parsed);
      if (JSON.stringify(parsed) === JSON.stringify(jsonData)) {
        console.log('✅ JSON round-trip successful!\n');
      } else {
        console.log('❌ JSON data mismatch\n');
      }
    } else {
      console.log('❌ Expected string, got:', typeof jsonResult, '\n');
    }

    console.log('🎉 All direct KV tests passed!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  }
}

testDirect();
