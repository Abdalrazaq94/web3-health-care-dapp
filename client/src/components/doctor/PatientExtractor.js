// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useEffect } from 'react';

function PatientExtractor({ appointmentId, doctorAddress, onPatientFound }) {
  const { data: appointment } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'appointments',
    args: [appointmentId],
  });

  useEffect(() => {
    console.log('Checking appointment:', appointmentId, appointment);
    if (appointment) {
      const apptDoctorAddress = appointment[2];
      const patientAddress = appointment[1];
      console.log('Doctor match?', apptDoctorAddress, 'vs', doctorAddress);
      
      if (apptDoctorAddress?.toLowerCase() === doctorAddress?.toLowerCase()) {
        console.log('Found patient:', patientAddress);
        onPatientFound(patientAddress);
      }
    }
  }, [appointment, doctorAddress, onPatientFound]);

  return null;
}

export default PatientExtractor;