// src/utils/uploadToIPFS.js
// Handles all IPFS uploads via Pinata
// Used by: Doctor Register, Patient Register, Doctor Settings, Patient Settings

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYTEyNWY5OS0xYWY3LTQwMGMtYWViNi1jMjkzNjc1ZTBjOTUiLCJlbWFpbCI6ImluZm8uYWJkOTR0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MGY1MmE3MTdmY2IxNzQ5ODYwYyIsInNjb3BlZEtleVNlY3JldCI6IjhjYTJkNDkxZjcwZWFmZmFlOWY3ZmVhZWE5MTY2MjhiMTc0MzJmOTEyNDBiZmE5OTc2ZTI2ZDBjZDQwMzMyMTYiLCJleHAiOjE4MDgwMDMwMzJ9.KW19Gvsx_UkNnh-0AdTlguuvrObwn50O633IY-IZsOw';
const PINATA_BASE = 'https://api.pinata.cloud';

// ── Upload a FILE (photo, certificate, PDF) ──────────────────────────────────
// Returns the IPFS CID (hash) of the uploaded file
export async function uploadFileToIPFS(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
  formData.append('pinataMetadata', JSON.stringify({ name: file.name }));

  const res = await fetch(`${PINATA_BASE}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS file upload failed: ${err}`);
  }

  const data = await res.json();
  return data.IpfsHash; // This is the CID you store on-chain
}

// ── Upload a JSON OBJECT (metadata) ─────────────────────────────────────────
// Returns the IPFS CID (hash) of the uploaded JSON
export async function uploadJSONToIPFS(jsonObject, name = 'metadata') {
  const res = await fetch(`${PINATA_BASE}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataOptions: { cidVersion: 1 },
      pinataMetadata: { name },
      pinataContent: jsonObject,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS JSON upload failed: ${err}`);
  }

  const data = await res.json();
  return data.IpfsHash; // This is the CID you store on-chain
}

// ── Build a full IPFS URL from a CID ────────────────────────────────────────
// Use this anywhere you want to display an image or link a file
export function ipfsUrl(cid) {
  if (!cid) return null;
  return `https://ipfs.io/ipfs/${cid}`;
}

// ── Fetch metadata JSON from IPFS by CID ────────────────────────────────────
// Tries primary gateway first, falls back to Pinata gateway
export async function fetchFromIPFS(cid) {
  if (!cid) return null;

  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
  ];

  for (const url of gateways) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return await res.json();
    } catch (_) {
      // try next gateway
    }
  }

  return null; // Both gateways failed
}