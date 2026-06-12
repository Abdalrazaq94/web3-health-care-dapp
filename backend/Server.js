const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ── Provider & Admin Wallet ───────────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const adminWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ── Contract Setup ────────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = '0x18B5630bACFcd916BAF39274955cFF014b672560';
const ABI = [
  'function registerPatientFor(address _patient, string _name, uint256 _age, string _bloodType, string _gender, string _metadataHash) external',
  'function updatePatientMetadataFor(address _patient, string _metadataHash) external',
  'function bookAppointmentFor(address _patient, address _doctor, string _date, string _time, string _reason) external',
  'function cancelAppointmentFor(address _patient, uint256 _id) external',
  'function grantAccessFor(address _patient, address _doctor) external',
  'function revokeAccessFor(address _patient, address _doctor) external',
  'function addReviewFor(address _patient, uint256 _appointmentId, uint8 _rating, string _comment) external',
  'function registerDoctorFor(address _doctor, string _name, string _specialization, string _license, string _metadataHash) external',
  'function updateDoctorMetadataFor(address _doctor, string _metadataHash) external',
  'function setDoctorAvailabilityFor(address _doctor, bool _isActive) external',
  'function addMedicalRecordFor(address _doctor, address _patient, string _diagnosis, string _treatment, string _prescription, string _notes, uint256 _appointmentId, string _metadataHash, uint8 _severity) external',
  'function addMedicationFor(address _doctor, address _patient, string _name, string _dosage, string _frequency, string _duration) external',
  'function stopMedicationFor(address _doctor, uint256 _id) external',
  'function completeAppointmentFor(address _doctor, uint256 _id) external',
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);

// ── Helper: send tx and wait ──────────────────────────────────────────────────
async function sendTx(fn, ...args) {
  const tx = await fn(...args);
  const receipt = await tx.wait();
  return receipt.hash;
}

// ── Helper: validate addresses ────────────────────────────────────────────────
function validateAddresses(res, ...addresses) {
  for (const addr of addresses) {
    if (!addr || addr === 'null' || addr === 'undefined') {
      res.status(400).json({ success: false, error: `Missing or invalid address: ${addr}` });
      return false;
    }
    try {
      ethers.getAddress(addr); // checksum validation
    } catch {
      res.status(400).json({ success: false, error: `Invalid Ethereum address: ${addr}` });
      return false;
    }
  }
  return true;
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', admin: adminWallet.address });
});

// ══════════════════════════════════════════════════════════════════════════════
//  PATIENT ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/register-patient
app.post('/api/register-patient', async (req, res) => {
  try {
    const { patientAddress, name, age, bloodType, gender, metadataHash } = req.body;
    if (!validateAddresses(res, patientAddress)) return;
    const hash = await sendTx(
      contract.registerPatientFor,
      patientAddress, name, Number(age), bloodType, gender, metadataHash || ''
    );
    res.json({ success: true, hash });
  } catch (err) {
    console.error('register-patient error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/update-patient-metadata
app.post('/api/update-patient-metadata', async (req, res) => {
  try {
    const { patientAddress, metadataHash } = req.body;
    if (!validateAddresses(res, patientAddress)) return;
    const hash = await sendTx(contract.updatePatientMetadataFor, patientAddress, metadataHash);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('update-patient-metadata error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/book-appointment
app.post('/api/book-appointment', async (req, res) => {
  try {
    const { patientAddress, doctorAddress, date, time, reason } = req.body;
    if (!validateAddresses(res, patientAddress, doctorAddress)) return;
    const hash = await sendTx(
      contract.bookAppointmentFor,
      patientAddress, doctorAddress, date, time, reason
    );
    res.json({ success: true, hash });
  } catch (err) {
    console.error('book-appointment error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/cancel-appointment
app.post('/api/cancel-appointment', async (req, res) => {
  try {
    const { patientAddress, appointmentId } = req.body;
    if (!validateAddresses(res, patientAddress)) return;
    const hash = await sendTx(contract.cancelAppointmentFor, patientAddress, appointmentId);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('cancel-appointment error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/grant-access
app.post('/api/grant-access', async (req, res) => {
  try {
    const { patientAddress, doctorAddress } = req.body;
    if (!validateAddresses(res, patientAddress, doctorAddress)) return;
    const hash = await sendTx(contract.grantAccessFor, patientAddress, doctorAddress);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('grant-access error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/revoke-access
app.post('/api/revoke-access', async (req, res) => {
  try {
    const { patientAddress, doctorAddress } = req.body;
    if (!validateAddresses(res, patientAddress, doctorAddress)) return;
    const hash = await sendTx(contract.revokeAccessFor, patientAddress, doctorAddress);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('revoke-access error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/add-review
app.post('/api/add-review', async (req, res) => {
  try {
    const { patientAddress, appointmentId, rating, comment } = req.body;
    if (!validateAddresses(res, patientAddress)) return;
    const hash = await sendTx(
      contract.addReviewFor,
      patientAddress, appointmentId, rating, comment
    );
    res.json({ success: true, hash });
  } catch (err) {
    console.error('add-review error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  DOCTOR ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/register-doctor
app.post('/api/register-doctor', async (req, res) => {
  try {
    const { doctorAddress, name, specialization, license, metadataHash } = req.body;
    if (!validateAddresses(res, doctorAddress)) return;
    const hash = await sendTx(
      contract.registerDoctorFor,
      doctorAddress, name, specialization, license, metadataHash || ''
    );
    res.json({ success: true, hash });
  } catch (err) {
    console.error('register-doctor error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/update-doctor-metadata
app.post('/api/update-doctor-metadata', async (req, res) => {
  try {
    const { doctorAddress, metadataHash } = req.body;
    if (!validateAddresses(res, doctorAddress)) return;
    const hash = await sendTx(contract.updateDoctorMetadataFor, doctorAddress, metadataHash);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('update-doctor-metadata error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/set-doctor-availability
app.post('/api/set-doctor-availability', async (req, res) => {
  try {
    const { doctorAddress, isActive } = req.body;
    if (!validateAddresses(res, doctorAddress)) return;
    const hash = await sendTx(contract.setDoctorAvailabilityFor, doctorAddress, isActive);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('set-doctor-availability error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/add-medical-record
app.post('/api/add-medical-record', async (req, res) => {
  try {
    const { doctorAddress, patientAddress, diagnosis, treatment, prescription, notes, appointmentId, metadataHash, severity } = req.body;
    if (!validateAddresses(res, doctorAddress, patientAddress)) return;
    const hash = await sendTx(
      contract.addMedicalRecordFor,
      doctorAddress, patientAddress,
      diagnosis, treatment, prescription, notes,
      appointmentId || 0, metadataHash || '', severity || 1
    );
    res.json({ success: true, hash });
  } catch (err) {
    console.error('add-medical-record error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/add-medication
app.post('/api/add-medication', async (req, res) => {
  try {
    const { doctorAddress, patientAddress, name, dosage, frequency, duration } = req.body;
    if (!validateAddresses(res, doctorAddress, patientAddress)) return;
    const hash = await sendTx(
      contract.addMedicationFor,
      doctorAddress, patientAddress, name, dosage, frequency, duration
    );
    res.json({ success: true, hash });
  } catch (err) {
    console.error('add-medication error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/stop-medication
app.post('/api/stop-medication', async (req, res) => {
  try {
    const { doctorAddress, medicationId } = req.body;
    if (!validateAddresses(res, doctorAddress)) return;
    const hash = await sendTx(contract.stopMedicationFor, doctorAddress, medicationId);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('stop-medication error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// POST /api/complete-appointment
app.post('/api/complete-appointment', async (req, res) => {
  try {
    const { doctorAddress, appointmentId } = req.body;
    if (!validateAddresses(res, doctorAddress)) return;
    const hash = await sendTx(contract.completeAppointmentFor, doctorAddress, appointmentId);
    res.json({ success: true, hash });
  } catch (err) {
    console.error('complete-appointment error:', err);
    res.status(500).json({ success: false, error: err.reason || err.message });
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Relayer backend running on http://localhost:${PORT}`);
  console.log(`👛 Admin wallet: ${adminWallet.address}`);
});