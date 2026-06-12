// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title NHS Healthcare System - Optimized for Deployment
 * @notice Uses IPFS for extended data storage to stay under contract size limit
 */
contract HealthcareSystem {

    address public admin;
    
    uint256 public doctorCount;
    uint256 public patientCount;
    uint256 public appointmentCount;
    uint256 public recordCount;
    uint256 public notificationCount;
    uint256 public medicationCount;
    uint256 public reviewCount;

    enum Role { None, Admin, Doctor, Patient }
    enum AppointmentStatus { Pending, Approved, Rejected, Completed, Cancelled }

    struct Doctor {
        uint256 id;
        string name;
        string specialization;
        string licenseNumber;
        address walletAddress;
        bool isApproved;
        bool isActive;
        string metadataHash; // IPFS hash containing all extended info
        uint256 totalPatients;
        uint256 totalAppointments;
        uint256 totalRecordsAdded;
        uint256 totalRating;
        uint256 reviewCount;
        uint256 registrationDate;
    }

    struct Patient {
        uint256 id;
        string name;
        uint256 age;
        string bloodType;
        string gender;
        address walletAddress;
        bool isRegistered;
        string metadataHash; // IPFS hash containing all extended info
        uint256 totalRecords;
        uint256 totalAppointments;
        uint256 registrationDate;
    }

    struct MedicalRecord {
        uint256 id;
        address patientAddress;
        address doctorAddress;
        uint256 appointmentId;
        string diagnosis;
        string treatment;
        string prescription;
        string notes;
        string metadataHash; // IPFS hash for images, vitals, lab results
        uint8 severity;
        uint256 timestamp;
    }

    struct Medication {
        uint256 id;
        address patientAddress;
        address doctorAddress;
        string name;
        string dosage;
        string frequency;
        string duration;
        bool isActive;
        uint256 timestamp;
    }

    struct Appointment {
        uint256 id;
        address patientAddress;
        address doctorAddress;
        string appointmentDate;
        string appointmentTime;
        string reason;
        AppointmentStatus status;
        uint256 dateCreated;
        uint256 linkedRecordId;
    }

    struct Review {
        uint256 id;
        address patientAddress;
        address doctorAddress;
        uint256 appointmentId;
        uint8 rating;
        string comment;
        uint256 timestamp;
    }

    // Mappings
    mapping(address => Role) public userRoles;
    mapping(address => Doctor) public doctors;
    mapping(address => Patient) public patients;
    mapping(uint256 => Doctor) public doctorById;
    mapping(uint256 => Patient) public patientById;
    
    mapping(uint256 => MedicalRecord) public medicalRecords;
    mapping(address => uint256[]) private patientRecordIds;
    
    mapping(uint256 => Medication) public medications;
    mapping(address => uint256[]) private patientMedicationIds;
    
    mapping(uint256 => Appointment) public appointments;
    mapping(address => uint256[]) private patientAppointmentIds;
    mapping(address => uint256[]) private doctorAppointmentIds;
    
    mapping(address => mapping(address => bool)) public accessControl;
    mapping(address => address[]) private patientAccessList;
    mapping(address => address[]) private doctorPatientsList;
    
    mapping(uint256 => Review) public reviews;
    mapping(address => uint256[]) private doctorReviewIds;
    mapping(uint256 => bool) private appointmentHasReview;
    
    mapping(address => uint256[]) private userNotificationIds;

    // Events
    event DoctorRegistered(uint256 indexed doctorId, address indexed doctorAddress);
    event DoctorApproved(uint256 indexed doctorId, address indexed doctorAddress);
    event PatientRegistered(uint256 indexed patientId, address indexed patientAddress);
    event AppointmentBooked(uint256 indexed appointmentId, address indexed patientAddress, address indexed doctorAddress);
    event AppointmentApproved(uint256 indexed appointmentId);
    event AppointmentCompleted(uint256 indexed appointmentId);
    event AppointmentCancelled(uint256 indexed appointmentId);
    event AccessGranted(address indexed patientAddress, address indexed doctorAddress);
    event AccessRevoked(address indexed patientAddress, address indexed doctorAddress);
    event MedicalRecordAdded(uint256 indexed recordId, address indexed patientAddress, address indexed doctorAddress);
    event MedicationAdded(uint256 indexed medicationId, address indexed patientAddress);
    event ReviewAdded(uint256 indexed reviewId, address indexed doctorAddress, uint8 rating);
    event NotificationSent(uint256 indexed notificationId, address indexed recipientAddress, string message);
    event MetadataUpdated(address indexed userAddress, string metadataHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyApprovedDoctor() {
        require(userRoles[msg.sender] == Role.Doctor && doctors[msg.sender].isApproved && doctors[msg.sender].isActive, "Not approved doctor");
        _;
    }

    modifier onlyPatient() {
        require(userRoles[msg.sender] == Role.Patient, "Only patients");
        _;
    }

    modifier onlyRegisteredPatient() {
        require(patients[msg.sender].isRegistered, "Not registered");
        _;
    }

    constructor() {
        admin = msg.sender;
        userRoles[msg.sender] = Role.Admin;
    }

    // Doctor Registration
    function registerDoctor(
        string memory _name,
        string memory _specialization,
        string memory _license,
        string memory _metadataHash
    ) external {
        require(userRoles[msg.sender] == Role.None, "Already registered");
        
        doctorCount++;
        doctors[msg.sender] = Doctor({
            id: doctorCount,
            name: _name,
            specialization: _specialization,
            licenseNumber: _license,
            walletAddress: msg.sender,
            isApproved: false,
            isActive: false,
            metadataHash: _metadataHash,
            totalPatients: 0,
            totalAppointments: 0,
            totalRecordsAdded: 0,
            totalRating: 0,
            reviewCount: 0,
            registrationDate: block.timestamp
        });

        doctorById[doctorCount] = doctors[msg.sender];
        userRoles[msg.sender] = Role.Doctor;

        emit DoctorRegistered(doctorCount, msg.sender);
        _sendNotification(admin, "New doctor registration");
    }

    // Patient Registration
    function registerPatient(
        string memory _name,
        uint256 _age,
        string memory _bloodType,
        string memory _gender,
        string memory _metadataHash
    ) external {
        require(userRoles[msg.sender] == Role.None, "Already registered");
        
        patientCount++;
        patients[msg.sender] = Patient({
            id: patientCount,
            name: _name,
            age: _age,
            bloodType: _bloodType,
            gender: _gender,
            walletAddress: msg.sender,
            isRegistered: true,
            metadataHash: _metadataHash,
            totalRecords: 0,
            totalAppointments: 0,
            registrationDate: block.timestamp
        });

        patientById[patientCount] = patients[msg.sender];
        userRoles[msg.sender] = Role.Patient;

        emit PatientRegistered(patientCount, msg.sender);
        _sendNotification(msg.sender, "Welcome to NHS Healthcare!");
    }

    // Update metadata (for profile updates)
    function updateDoctorMetadata(string memory _metadataHash) external {
        require(userRoles[msg.sender] == Role.Doctor, "Not a doctor");
        doctors[msg.sender].metadataHash = _metadataHash;
        doctorById[doctors[msg.sender].id].metadataHash = _metadataHash;
        emit MetadataUpdated(msg.sender, _metadataHash);
    }

    function updatePatientMetadata(string memory _metadataHash) external onlyPatient {
        patients[msg.sender].metadataHash = _metadataHash;
        patientById[patients[msg.sender].id].metadataHash = _metadataHash;
        emit MetadataUpdated(msg.sender, _metadataHash);
    }

    function setDoctorAvailability(bool _isActive) external {
        require(userRoles[msg.sender] == Role.Doctor && doctors[msg.sender].isApproved, "Not approved doctor");
        doctors[msg.sender].isActive = _isActive;
        doctorById[doctors[msg.sender].id].isActive = _isActive;
    }

    // Admin functions
    function approveDoctor(address _doctor) external onlyAdmin {
        require(userRoles[_doctor] == Role.Doctor, "Not a doctor");
        doctors[_doctor].isApproved = true;
        doctors[_doctor].isActive = true;
        doctorById[doctors[_doctor].id].isApproved = true;
        doctorById[doctors[_doctor].id].isActive = true;
        emit DoctorApproved(doctors[_doctor].id, _doctor);
        _sendNotification(_doctor, "Registration approved!");
    }

    // Appointments
    function bookAppointment(
        address _doctor,
        string memory _date,
        string memory _time,
        string memory _reason
    ) external onlyRegisteredPatient {
        require(doctors[_doctor].isApproved && doctors[_doctor].isActive, "Doctor unavailable");
        
        appointmentCount++;
        appointments[appointmentCount] = Appointment({
            id: appointmentCount,
            patientAddress: msg.sender,
            doctorAddress: _doctor,
            appointmentDate: _date,
            appointmentTime: _time,
            reason: _reason,
            status: AppointmentStatus.Pending,
            dateCreated: block.timestamp,
            linkedRecordId: 0
        });

        patientAppointmentIds[msg.sender].push(appointmentCount);
        doctorAppointmentIds[_doctor].push(appointmentCount);
        patients[msg.sender].totalAppointments++;

        if (!accessControl[msg.sender][_doctor]) {
            _grantAccessInternal(msg.sender, _doctor);
        }

        emit AppointmentBooked(appointmentCount, msg.sender, _doctor);
        _sendNotification(_doctor, "New appointment request");
    }

    function approveAppointment(uint256 _id) external onlyApprovedDoctor {
        Appointment storage appt = appointments[_id];
        require(appt.doctorAddress == msg.sender && appt.status == AppointmentStatus.Pending, "Invalid");
        appt.status = AppointmentStatus.Approved;
        doctors[msg.sender].totalAppointments++;
        emit AppointmentApproved(_id);
        _sendNotification(appt.patientAddress, "Appointment approved!");
    }

    function completeAppointment(uint256 _id) external onlyApprovedDoctor {
        Appointment storage appt = appointments[_id];
        require(appt.doctorAddress == msg.sender && appt.status == AppointmentStatus.Approved, "Invalid");
        appt.status = AppointmentStatus.Completed;
        emit AppointmentCompleted(_id);
        _sendNotification(appt.patientAddress, "Appointment completed");
    }

    function cancelAppointment(uint256 _id) external onlyPatient {
        Appointment storage appt = appointments[_id];
        require(appt.patientAddress == msg.sender, "Not your appointment");
        require(appt.status == AppointmentStatus.Pending || appt.status == AppointmentStatus.Approved, "Cannot cancel");
        appt.status = AppointmentStatus.Cancelled;
        emit AppointmentCancelled(_id);
    }

    // Access control
    function grantAccess(address _doctor) external onlyRegisteredPatient {
        require(doctors[_doctor].isApproved && !accessControl[msg.sender][_doctor], "Invalid");
        _grantAccessInternal(msg.sender, _doctor);
        _sendNotification(_doctor, "Access granted");
    }

    function _grantAccessInternal(address _patient, address _doctor) internal {
        accessControl[_patient][_doctor] = true;
        patientAccessList[_patient].push(_doctor);
        doctorPatientsList[_doctor].push(_patient);
        doctors[_doctor].totalPatients++;
        emit AccessGranted(_patient, _doctor);
    }

    function revokeAccess(address _doctor) external onlyRegisteredPatient {
        require(accessControl[msg.sender][_doctor], "No access");
        accessControl[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    function checkAccess(address _patient, address _doctor) external view returns (bool) {
        return accessControl[_patient][_doctor];
    }

    // Medical records
    function addMedicalRecord(
        address _patient,
        string memory _diagnosis,
        string memory _treatment,
        string memory _prescription,
        string memory _notes,
        uint256 _appointmentId,
        string memory _metadataHash,
        uint8 _severity
    ) external onlyApprovedDoctor {
        require(accessControl[_patient][msg.sender], "No access");
        
        recordCount++;
        medicalRecords[recordCount] = MedicalRecord({
            id: recordCount,
            patientAddress: _patient,
            doctorAddress: msg.sender,
            appointmentId: _appointmentId,
            diagnosis: _diagnosis,
            treatment: _treatment,
            prescription: _prescription,
            notes: _notes,
            metadataHash: _metadataHash,
            severity: _severity,
            timestamp: block.timestamp
        });

        patientRecordIds[_patient].push(recordCount);
        patients[_patient].totalRecords++;
        doctors[msg.sender].totalRecordsAdded++;

        if (_appointmentId > 0) {
            appointments[_appointmentId].linkedRecordId = recordCount;
        }

        emit MedicalRecordAdded(recordCount, _patient, msg.sender);
        _sendNotification(_patient, "New medical record added");
    }

    function getPatientRecordIds(address _patient) external view returns (uint256[] memory) {
        require(msg.sender == _patient || accessControl[_patient][msg.sender] || msg.sender == admin, "No permission");
        return patientRecordIds[_patient];
    }

    function getMedicalRecord(uint256 _id, address _requester) external view returns (MedicalRecord memory) {
        MedicalRecord memory record = medicalRecords[_id];
        require(_requester == record.patientAddress || accessControl[record.patientAddress][_requester] || _requester == admin, "No permission");
        return record;
    }

    // Medications
    function addMedication(
        address _patient,
        string memory _name,
        string memory _dosage,
        string memory _frequency,
        string memory _duration
    ) external onlyApprovedDoctor {
        require(accessControl[_patient][msg.sender], "No access");
        
        medicationCount++;
        medications[medicationCount] = Medication({
            id: medicationCount,
            patientAddress: _patient,
            doctorAddress: msg.sender,
            name: _name,
            dosage: _dosage,
            frequency: _frequency,
            duration: _duration,
            isActive: true,
            timestamp: block.timestamp
        });

        patientMedicationIds[_patient].push(medicationCount);
        emit MedicationAdded(medicationCount, _patient);
        _sendNotification(_patient, "New medication prescribed");
    }

    function stopMedication(uint256 _id) external onlyApprovedDoctor {
        require(medications[_id].doctorAddress == msg.sender && medications[_id].isActive, "Invalid");
        medications[_id].isActive = false;
    }

    function getPatientMedications(address _patient) external view returns (uint256[] memory) {
        require(msg.sender == _patient || accessControl[_patient][msg.sender] || msg.sender == admin, "No permission");
        return patientMedicationIds[_patient];
    }

    // Reviews
    function addReview(uint256 _appointmentId, uint8 _rating, string memory _comment) external onlyPatient {
        require(_rating >= 1 && _rating <= 5 && !appointmentHasReview[_appointmentId], "Invalid");
        Appointment storage appt = appointments[_appointmentId];
        require(appt.patientAddress == msg.sender && appt.status == AppointmentStatus.Completed, "Invalid");

        reviewCount++;
        reviews[reviewCount] = Review({
            id: reviewCount,
            patientAddress: msg.sender,
            doctorAddress: appt.doctorAddress,
            appointmentId: _appointmentId,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp
        });

        doctorReviewIds[appt.doctorAddress].push(reviewCount);
        appointmentHasReview[_appointmentId] = true;

        doctors[appt.doctorAddress].totalRating += _rating;
        doctors[appt.doctorAddress].reviewCount++;
        doctorById[doctors[appt.doctorAddress].id].totalRating += _rating;
        doctorById[doctors[appt.doctorAddress].id].reviewCount++;

        emit ReviewAdded(reviewCount, appt.doctorAddress, _rating);
    }

    function getDoctorReviews(address _doctor) external view returns (uint256[] memory) {
        return doctorReviewIds[_doctor];
    }

    function getDoctorAverageRating(address _doctor) external view returns (uint256) {
        if (doctors[_doctor].reviewCount == 0) return 0;
        return (doctors[_doctor].totalRating * 100) / doctors[_doctor].reviewCount;
    }

    // Helpers
    function _sendNotification(address _recipient, string memory _message) internal {
        notificationCount++;
        userNotificationIds[_recipient].push(notificationCount);
        emit NotificationSent(notificationCount, _recipient, _message);
    }

    function getMyNotificationIds() external view returns (uint256[] memory) {
        return userNotificationIds[msg.sender];
    }

    function getAllApprovedDoctors() external view returns (Doctor[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= doctorCount; i++) {
            if (doctorById[i].isApproved && doctorById[i].isActive) count++;
        }
        Doctor[] memory result = new Doctor[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= doctorCount; i++) {
            if (doctorById[i].isApproved && doctorById[i].isActive) {
                result[index++] = doctorById[i];
            }
        }
        return result;
    }

    function getDoctorsBySpecialization(string memory _spec) external view returns (Doctor[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= doctorCount; i++) {
            if (doctorById[i].isApproved && doctorById[i].isActive && 
                keccak256(bytes(doctorById[i].specialization)) == keccak256(bytes(_spec))) count++;
        }
        Doctor[] memory result = new Doctor[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= doctorCount; i++) {
            if (doctorById[i].isApproved && doctorById[i].isActive && 
                keccak256(bytes(doctorById[i].specialization)) == keccak256(bytes(_spec))) {
                result[index++] = doctorById[i];
            }
        }
        return result;
    }

    function getPendingDoctors() external view onlyAdmin returns (Doctor[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= doctorCount; i++) {
            if (!doctorById[i].isApproved) count++;
        }
        Doctor[] memory result = new Doctor[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= doctorCount; i++) {
            if (!doctorById[i].isApproved) result[index++] = doctorById[i];
        }
        return result;
    }

    function getMyAppointmentIds() external view returns (uint256[] memory) {
        if (userRoles[msg.sender] == Role.Patient) return patientAppointmentIds[msg.sender];
        if (userRoles[msg.sender] == Role.Doctor) return doctorAppointmentIds[msg.sender];
        revert("Invalid role");
    }

    function getMyPatients() external view onlyApprovedDoctor returns (address[] memory) {
        return doctorPatientsList[msg.sender];
    }

    function getMyAccessList() external view onlyRegisteredPatient returns (address[] memory) {
        return patientAccessList[msg.sender];
    }

    function getMyRole() external view returns (Role) {
        return userRoles[msg.sender];
    }
}
