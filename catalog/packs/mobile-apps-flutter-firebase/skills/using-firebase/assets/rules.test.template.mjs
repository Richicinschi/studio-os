// Rules unit test for firestore.rules and storage.rules (copied from the two .template files).
// Needs firestore.rules and storage.rules in the same folder as this file.
// Setup: copy this file to rules.test.mjs, then `npm install --save-dev @firebase/rules-unit-testing firebase`.
// Run against the emulators, with a demo- project id so no real project is touched:
//   npx firebase-tools@15.36.0 emulators:exec --only firestore,storage --project demo-rules "node --test rules.test.mjs"
// Add a case here for every rule you change.

import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getMetadata, ref, updateMetadata, uploadBytes } from 'firebase/storage';

const rules = (name) => readFileSync(new URL(`./${name}`, import.meta.url), 'utf8');
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rules',
    firestore: { rules: rules('firestore.rules') },
    storage: { rules: rules('storage.rules') },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/alice'), { email: 'alice@example.com', createdAt: new Date() });
    await setDoc(doc(db, 'posts/p1/comments/c1'), { authorId: 'alice', text: 'hi' });
    const bucket = ctx.storage();
    await uploadBytes(ref(bucket, 'users/alice/photo.png'), png, { contentType: 'image/png' });
    await uploadBytes(ref(bucket, 'public/x'), png, {
      contentType: 'image/png',
      customMetadata: { owner: 'alice' },
    });
  });
});

after(async () => {
  await env?.cleanup();
});

const alice = () => env.authenticatedContext('alice');
const bob = () => env.authenticatedContext('bob');

// ---- Firestore: users ----
test('a signed-out visitor cannot read /users/{uid}', async () => {
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users/alice')));
});

test('another signed-in user cannot read /users/{uid}', async () => {
  await assertFails(getDoc(doc(bob().firestore(), 'users/alice')));
});

test('the owner can read /users/{uid}', async () => {
  await assertSucceeds(getDoc(doc(alice().firestore(), 'users/alice')));
});

// ---- Firestore: comments ----
test('the author cannot hand a comment to someone else by changing authorId', async () => {
  await assertFails(updateDoc(doc(alice().firestore(), 'posts/p1/comments/c1'), { authorId: 'bob' }));
});

test('the author can edit a comment while authorId stays the same', async () => {
  await assertSucceeds(updateDoc(doc(alice().firestore(), 'posts/p1/comments/c1'), { text: 'edited' }));
});

// ---- Storage: per-user folder ----
test('another signed-in user cannot read a file in users/{uid}/', async () => {
  await assertFails(getMetadata(ref(bob().storage(), 'users/alice/photo.png')));
});

test('the owner can read a file in users/{uid}/', async () => {
  await assertSucceeds(getMetadata(ref(alice().storage(), 'users/alice/photo.png')));
});

// ---- Storage: avatars ----
test('the owner can upload avatar.png', async () => {
  await assertSucceeds(
    uploadBytes(ref(alice().storage(), 'profiles/alice/avatar.png'), png, { contentType: 'image/png' }),
  );
});

test('the owner cannot upload another file name into profiles/{uid}/', async () => {
  await assertFails(
    uploadBytes(ref(alice().storage(), 'profiles/alice/notes.png'), png, { contentType: 'image/png' }),
  );
});

// ---- Storage: public folder ----
test('a signed-in non-owner cannot overwrite /public/x', async () => {
  await assertFails(
    uploadBytes(ref(bob().storage(), 'public/x'), png, {
      contentType: 'image/png',
      customMetadata: { owner: 'bob' },
    }),
  );
});

test('a signed-in non-owner cannot change the metadata of /public/x', async () => {
  await assertFails(
    updateMetadata(ref(bob().storage(), 'public/x'), { customMetadata: { owner: 'bob' } }),
  );
});

test('the owner can change the metadata of /public/x', async () => {
  await assertSucceeds(
    updateMetadata(ref(alice().storage(), 'public/x'), {
      customMetadata: { owner: 'alice', caption: 'sunset' },
    }),
  );
});

test('a signed-in user can create a new /public image tagged with their own uid', async () => {
  await assertSucceeds(
    uploadBytes(ref(bob().storage(), 'public/y'), png, {
      contentType: 'image/png',
      customMetadata: { owner: 'bob' },
    }),
  );
});

test('a signed-in user cannot create a /public file without naming themselves owner', async () => {
  await assertFails(
    uploadBytes(ref(bob().storage(), 'public/y'), png, { contentType: 'image/png' }),
  );
});

test('the owner cannot write a non-image to /public/x', async () => {
  await assertFails(
    uploadBytes(ref(alice().storage(), 'public/x'), new TextEncoder().encode('hello'), {
      contentType: 'text/plain',
      customMetadata: { owner: 'alice' },
    }),
  );
});

test('the owner can replace /public/x with an image', async () => {
  await assertSucceeds(
    uploadBytes(ref(alice().storage(), 'public/x'), png, {
      contentType: 'image/png',
      customMetadata: { owner: 'alice' },
    }),
  );
});
