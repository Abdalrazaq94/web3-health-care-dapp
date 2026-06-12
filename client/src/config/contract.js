export const CONTRACT_ADDRESS = "0x18B5630bACFcd916BAF39274955cFF014b672560";


  export const CONTRACT_ABI =  
  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        }
      ],
      "name": "AccessGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        }
      ],
      "name": "AccessRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "appointmentId",
          "type": "uint256"
        }
      ],
      "name": "AppointmentApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "appointmentId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        }
      ],
      "name": "AppointmentBooked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "appointmentId",
          "type": "uint256"
        }
      ],
      "name": "AppointmentCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "appointmentId",
          "type": "uint256"
        }
      ],
      "name": "AppointmentCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "doctorId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        }
      ],
      "name": "DoctorApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "doctorId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        }
      ],
      "name": "DoctorRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        }
      ],
      "name": "MedicalRecordAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "medicationId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        }
      ],
      "name": "MedicationAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "metadataHash",
          "type": "string"
        }
      ],
      "name": "MetadataUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "notificationId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipientAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "name": "NotificationSent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "patientId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        }
      ],
      "name": "PatientRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "reviewId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "rating",
          "type": "uint8"
        }
      ],
      "name": "ReviewAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "accessControl",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_diagnosis",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_treatment",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_prescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_notes",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_appointmentId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_metadataHash",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "_severity",
          "type": "uint8"
        }
      ],
      "name": "addMedicalRecordFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_dosage",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_frequency",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_duration",
          "type": "string"
        }
      ],
      "name": "addMedicationFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_appointmentId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "_rating",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "_comment",
          "type": "string"
        }
      ],
      "name": "addReviewFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "appointmentCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "appointments",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "appointmentDate",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "appointmentTime",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        },
        {
          "internalType": "enum HealthcareSystem.AppointmentStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "dateCreated",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "linkedRecordId",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "approveAppointment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        }
      ],
      "name": "approveDoctor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_date",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_time",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_reason",
          "type": "string"
        }
      ],
      "name": "bookAppointmentFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "cancelAppointmentFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        }
      ],
      "name": "checkAccess",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "completeAppointmentFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "doctorById",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "specialization",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "licenseNumber",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isApproved",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "metadataHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "totalPatients",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalAppointments",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalRecordsAdded",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalRating",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reviewCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "registrationDate",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "doctorCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "doctors",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "specialization",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "licenseNumber",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isApproved",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "metadataHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "totalPatients",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalAppointments",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalRecordsAdded",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalRating",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reviewCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "registrationDate",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllApprovedDoctors",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "specialization",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "licenseNumber",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isApproved",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "metadataHash",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "totalPatients",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalAppointments",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalRecordsAdded",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalRating",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "reviewCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "registrationDate",
              "type": "uint256"
            }
          ],
          "internalType": "struct HealthcareSystem.Doctor[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        }
      ],
      "name": "getDoctorAverageRating",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        }
      ],
      "name": "getDoctorReviews",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_spec",
          "type": "string"
        }
      ],
      "name": "getDoctorsBySpecialization",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "specialization",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "licenseNumber",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isApproved",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "metadataHash",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "totalPatients",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalAppointments",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalRecordsAdded",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalRating",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "reviewCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "registrationDate",
              "type": "uint256"
            }
          ],
          "internalType": "struct HealthcareSystem.Doctor[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_requester",
          "type": "address"
        }
      ],
      "name": "getMedicalRecord",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "patientAddress",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "doctorAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "appointmentId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "diagnosis",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "treatment",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "prescription",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "notes",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "metadataHash",
              "type": "string"
            },
            {
              "internalType": "uint8",
              "name": "severity",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct HealthcareSystem.MedicalRecord",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyAccessList",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyAppointmentIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyNotificationIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyPatients",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyRole",
      "outputs": [
        {
          "internalType": "enum HealthcareSystem.Role",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        }
      ],
      "name": "getPatientAppointmentIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        }
      ],
      "name": "getPatientMedications",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        }
      ],
      "name": "getPatientRecordIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPendingDoctors",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "specialization",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "licenseNumber",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isApproved",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "metadataHash",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "totalPatients",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalAppointments",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalRecordsAdded",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalRating",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "reviewCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "registrationDate",
              "type": "uint256"
            }
          ],
          "internalType": "struct HealthcareSystem.Doctor[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        }
      ],
      "name": "grantAccessFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "medicalRecords",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "appointmentId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "diagnosis",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "treatment",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "prescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "notes",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "metadataHash",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "severity",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "medicationCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "medications",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dosage",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "frequency",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "duration",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "notificationCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "patientById",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "age",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "bloodType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "gender",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isRegistered",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "metadataHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "totalRecords",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalAppointments",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "registrationDate",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "patientCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "patients",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "age",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "bloodType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "gender",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isRegistered",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "metadataHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "totalRecords",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalAppointments",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "registrationDate",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "recordCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_specialization",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_license",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_metadataHash",
          "type": "string"
        }
      ],
      "name": "registerDoctorFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_age",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_bloodType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_gender",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_metadataHash",
          "type": "string"
        }
      ],
      "name": "registerPatientFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reviewCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "reviews",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "patientAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "doctorAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "appointmentId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "rating",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "comment",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        }
      ],
      "name": "revokeAccessFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_isActive",
          "type": "bool"
        }
      ],
      "name": "setDoctorAvailabilityFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "stopMedicationFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_doctor",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_metadataHash",
          "type": "string"
        }
      ],
      "name": "updateDoctorMetadataFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_metadataHash",
          "type": "string"
        }
      ],
      "name": "updatePatientMetadataFor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userRoles",
      "outputs": [
        {
          "internalType": "enum HealthcareSystem.Role",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]