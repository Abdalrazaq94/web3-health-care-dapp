// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University
import { useState, useEffect, useRef } from "react";
import HomeNavbar from "../components/shared/Homenavbar";
import HomeFooter from "../components/shared/Homefooter";

// ── Blockchain canvas — light ─────────────────────────────────────────────────

// ── SVG Icon Library ──────────────────────────────────────────────────────────
const SVG = {
  shield:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  cpu:       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="9" width="6" height="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></svg>,
  code:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>,
  globe:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>,
  link:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
  document:  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  user:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  pencil:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  fuel:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
  search:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  cube:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
  hospital:  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  doctor:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v2m0 0v2m0-2h2m-2 0h-2"/></svg>,
  adminshield:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  calendar:  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  stethoscope:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  chat:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  pill:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>,
  chart:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  speakerphone:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>,
  warning:   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  clipboard:  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  brain:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  key:       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>,
  lock:      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  server:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>,
  eye:       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  lightbulb: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  users:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
};

function Icon({ name, className = "w-5 h-5" }) {
  const icons = {
    shield:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>,
    cpu:        <><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="9" width="6" height="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></>,
    code:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>,
    globe:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>,
    link:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>,
    document:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>,
    user:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>,
    pencil:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>,
    fuel:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>,
    search:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>,
    cube:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>,
    hospital:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>,
    calendar:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>,
    stethoscope:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>,
    chat:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>,
    pill:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>,
    chart:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
    speakerphone:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>,
    warning:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>,
    clipboard:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>,
    brain:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>,
    key:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>,
    lock:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>,
    server:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>,
    eye:        <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>,
    users:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
    records:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name] || icons.shield}
    </svg>
  );
}

// ── Blockchain canvas — light ─────────────────────────────────────────────────
function BlockchainCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const NODE_COUNT = 22;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 2, pulse: Math.random() * Math.PI * 2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.025;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 160) * 0.22})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grad.addColorStop(0, `rgba(99,102,241,${0.55 * glow + 0.2})`);
        grad.addColorStop(1, "rgba(99,102,241,0)");
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${0.7 + glow * 0.3})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-25" />;
}

// ── Floating card ─────────────────────────────────────────────────────────────
const CARD_ICONS = {
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  cpu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v18m6-18h2a2 2 0 012 2v2m0 0v10a2 2 0 01-2 2h-2m0 0H9m6 0v-4M9 21v-4m0 0H7a2 2 0 01-2-2v-2m14 0h-2m0 0V9" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
  ),
};

const CARD_COLORS = {
  shield: "text-blue-600 bg-blue-50",
  cpu:    "text-purple-600 bg-purple-50",
  code:   "text-indigo-600 bg-indigo-50",
  globe:  "text-green-600 bg-green-50",
};

function FloatingCard({ delay, style, icon, label, sub, color }) {
  return (
    <div className={`absolute rounded-2xl border shadow-xl backdrop-blur-sm px-4 py-3 flex items-center gap-3 ${color}`}
      style={{ animation: `floatBlock 5s ease-in-out infinite`, animationDelay: delay, ...style }}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${CARD_COLORS[icon] || "text-gray-600 bg-gray-50"}`}>
        {CARD_ICONS[icon] || null}
      </div>
      <div>
        <p className="text-xs font-black text-gray-800 leading-tight">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Home",          href: "#home"     },
    { label: "About",         href: "#about"    },
    { label: "Smart Contract",href: "#contract" },
    { label: "AI Features",   href: "#ai"       },
    { label: "Privacy",       href: "#privacy"  },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100" : "bg-white/80 backdrop-blur-md"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-black text-lg leading-none tracking-tight">MediChain</p>
            <p className="text-indigo-500 text-xs font-bold tracking-widest uppercase">NHS · Blockchain</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-gray-600 hover:text-indigo-600 text-sm font-semibold transition-colors duration-200">{l.label}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="px-4 py-2 text-indigo-600 border border-indigo-200 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all">Login</a>
          <a href="/patient/register" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105">Get Started</a>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
          <div className={`w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <div className={`w-6 h-0.5 bg-gray-700 my-1.5 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 space-y-4 shadow-xl">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className="block text-gray-700 hover:text-indigo-600 font-semibold text-lg">{l.label}</a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
            <a href="/login"            className="text-center py-3 border border-indigo-200 text-indigo-600 rounded-xl font-bold">Login</a>
            <a href="/patient/register" className="text-center py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold">Register as Patient</a>
            <a href="/doctor/register"  className="text-center py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold">Register as Doctor</a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const [count, setCount] = useState({ patients: 0, doctors: 0, records: 0 });
  useEffect(() => {
    const targets = { patients: 20, doctors: 10, records: 30 };
    let step = 0;
    const interval = setInterval(() => {
      step++; const ease = 1 - Math.pow(1 - step / 60, 3);
      setCount({ patients: Math.round(targets.patients * ease), doctors: Math.round(targets.doctors * ease), records: Math.round(targets.records * ease) });
      if (step >= 60) clearInterval(interval);
    }, 2000 / 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60 flex items-center overflow-hidden pt-20">
      <BlockchainCanvas />
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 opacity-30 blur-3xl pointer-events-none" />

      {/* 4 floating cards */}
      <FloatingCard delay="0s"   icon="shield" label="End-to-End Encrypted"  sub="Your data, your keys"       color="bg-white/90 border-blue-100"   style={{ top: "22%", right: "8%",  width: 210 }} />
      <FloatingCard delay="1.8s" icon="cpu"    label="AI Health Assistant"   sub="On-premise, private"        color="bg-white/90 border-purple-100" style={{ top: "55%", right: "5%",  width: 210 }} />
      <FloatingCard delay="3.2s" icon="code"   label="Smart Contract"        sub="Self-executing on Ethereum" color="bg-white/90 border-indigo-100" style={{ top: "38%", right: "20%", width: 210 }} />
      <FloatingCard delay="0.9s" icon="globe"  label="Stored on IPFS"        sub="Decentralised storage"      color="bg-white/90 border-green-100"  style={{ bottom: "22%", right: "12%", width: 200 }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 mb-8"
            style={{ animation: "fadeUp .6s ease-out both" }}>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-indigo-700 text-sm font-bold">Built on Ethereum · Solidity Smart Contracts · IPFS</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-none tracking-tight mb-6"
            style={{ animation: "fadeUp .7s ease-out .1s both" }}>
            Your Health.<br />
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">Your Control.</span>
          </h1>

          <p className="text-gray-600 text-xl leading-relaxed mb-10"
            style={{ animation: "fadeUp .7s ease-out .2s both" }}>
            A Web3 blockchain healthcare DApp where smart contracts enforce patient ownership,
            doctors are cryptographically verified, and AI assists  privately, on your terms.
          </p>

          <div className="flex flex-wrap gap-4 mb-16" style={{ animation: "fadeUp .7s ease-out .3s both" }}>
            <a href="/patient/register"
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all transform hover:scale-105 text-lg">
              <Icon name="hospital" className="w-5 h-5" /> I'm a Patient
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="/doctor/register"
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-green-500/25 transition-all transform hover:scale-105 text-lg">
              <Icon name="stethoscope" className="w-5 h-5" /> I'm a Doctor
            </a>
            <a href="#contract"
              className="flex items-center gap-2 px-8 py-4 border-2 border-gray-200 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 font-semibold rounded-2xl transition-all text-lg">
              How It Works
            </a>
          </div>

          <div className="flex flex-wrap gap-10" style={{ animation: "fadeUp .7s ease-out .4s both" }}>
            {[
              { label: "Patients",         value: count.patients, icon: "users",    color: "text-blue-600"   },
              { label: "Verified Doctors", value: count.doctors,  icon: "stethoscope", color: "text-green-600"  },
              { label: "Medical Records",  value: count.records,  icon: "records", color: "text-indigo-600" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 ${s.color}`}><Icon name={s.icon} /></div>
                <div>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value.toLocaleString()}+</p>
                  <p className="text-gray-500 text-sm font-semibold">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-gray-400 text-xs tracking-widest uppercase font-semibold">Scroll</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

// ── About / The Problem ───────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="bg-white py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-3">The Problem</p>
            <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">Patient Data Has a Single Point of Failure<br /><span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Single Point of Failure</span></h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
             Every day, millions of patient records sit on centralised servers controlled by institutions, not by patients. A single cyberattack, system failure, or data breach can expose thousands of records, cancel appointments, and cut off access to critical medical histories in an instant.

            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
             This is not a freak occurrence. It is a consequence of architecture. Centralised databases create single points of failure. When that server goes down, so does patient care. Patients have no visibility into who accesses their data, no mechanism to control it, and no guarantee it has not been altered. This project was built to change that, giving patients cryptographic ownership of their own records and making unauthorised access architecturally impossible.
            </p>
            {/* <div className="flex flex-col gap-4">
              {[
                { icon: "warning", label: "19,000+ appointments cancelled",    sub: "WannaCry ransomware, NHS 2017"            },
                { icon: "chart", label: "£30 billion NHS deficit pressure",   sub: "Centralised systems cost more to secure" },
                { icon: "users", label: "100,000+ staff shortages",           sub: "Interoperability failures slow care"      },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0"><Icon name={s.icon} /></div>
                  <div>
                    <p className="font-black text-gray-900">{s.label}</p>
                    <p className="text-gray-500 text-sm">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100">
            <p className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-5">The MediChain Solution</p>
            <div className="space-y-5">
              {[
                { icon:"link", color:"bg-blue-100 text-blue-600",   title:"Decentralised by Design",    desc:"No central server. Data distributed across Ethereum nodes and IPFS globally no single point of failure." },
                { icon:"document", color:"bg-indigo-100 text-indigo-600", title:"Smart Contract Enforcement", desc:"Rules written in Solidity and deployed on Ethereum. No human can override access permissions only code can." },
                { icon:"user", color:"bg-purple-100 text-purple-600", title:"Patient Ownership",          desc:"Your records belong to you. Doctors only see what you explicitly grant them and you can revoke that instantly." },
                { icon:"globe", color:"bg-green-100 text-green-600",  title:"IPFS Off-Chain Storage",     desc:"Medical files stored on IPFS. Only cryptographic hashes on-chain. GDPR-aligned hybrid architecture." },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><Icon name={s.icon} /></div>
                  <div>
                    <p className="font-bold text-gray-900">{s.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Smart Contract Deep Dive ──────────────────────────────────────────────────
function SmartContractSection() {
  const [activeTab, setActiveTab] = useState("what");
  const tabs = [
    { id: "what",     label: "What Is It?"     },
    { id: "how",      label: "How It Works"    },
    { id: "roles",    label: "Roles & Access"  },
    { id: "onchain",  label: "On vs Off-Chain" },
  ];

  const content = {
    what: (
      <div className="space-y-5">
        <p className="text-gray-700 text-lg leading-relaxed">
          A smart contract is a self-executing program deployed on the Ethereum blockchain, written in <strong className="text-indigo-600">Solidity</strong>. It contains the rules of the system who can register, who can view records, who can approve doctors and enforces them automatically without any human intermediary.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Once deployed, the contract is immutable. No one  not even the developer can change the logic. Every action triggers an on-chain transaction, permanently recorded and publicly auditable on the <strong className="text-indigo-600">Ethereum Sepolia</strong> testnet.
        </p>
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Contract Address</p>
          <p className="font-mono text-sm text-indigo-800 break-all">0x18B5630bACFcd916BAF39274955cFF014b672560</p>
        </div>
        <p className="text-gray-600 text-sm italic">
          As described in the dissertation: "Smart contracts provide unbreakable promises between users within the healthcare system ensuring transparency, security, accuracy, speed, and automation."
        </p>
      </div>
    ),
    how: (
      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed mb-2">The Ethereum Virtual Machine (EVM) executes the Solidity contract. When a patient books an appointment or a doctor adds a record, it triggers a contract function verified by the blockchain network and recorded permanently.</p>
        {[
          { step:"01", icon:"pencil", title:"User Action",       desc:"Patient registers, doctor adds a record, or admin approves any action calls a Solidity function." },
          { step:"02", icon:"fuel", title:"Gas & Transaction", desc:"The transaction is signed and broadcast to Ethereum. A relayer covers gas fees for patients they never need ETH." },
          { step:"03", icon:"search", title:"EVM Execution",     desc:"The Ethereum Virtual Machine runs the contract function, validates all conditions, and updates the blockchain state." },
          { step:"04", icon:"cube", title:"Block Confirmed",  desc:"The transaction is confirmed in a new block. The record is now permanent, tamper-proof, and publicly verifiable." },
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black flex-shrink-0">{s.step}</div>
            <div>
              <p className="font-bold text-gray-900 flex items-center gap-2"><Icon name={s.icon} className="w-4 h-4 text-indigo-500" /> {s.title}</p>
              <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
    roles: (
      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed mb-2">The contract enforces three roles using <strong>role-based access control</strong> written directly in Solidity. Functions are gated only the correct role can call them.</p>
        {[
          { role:"Patient", icon:"hospital", color:"bg-blue-50 border-blue-200",   badge:"bg-blue-100 text-blue-700",
            perms:["Register with biometric passkey via Privy","Book & cancel appointments","Grant / revoke doctor access","View own medical records","Upload documents to IPFS"] },
          { role:"Doctor",  icon:"stethoscope", color:"bg-green-50 border-green-200", badge:"bg-green-100 text-green-700",
            perms:["Register with MetaMask wallet","Approved by admin on-chain","Approve & complete appointments","Add medical records (IPFS hash on-chain)","Set availability status"] },
          { role:"Admin",   icon:"shield", color:"bg-purple-50 border-purple-200",badge:"bg-purple-100 text-purple-700",
            perms:["Single admin wallet defined at deployment","Approve / reject doctor registrations","All actions signed via MetaMask","Full audit trail on Ethereum","No ability to read patient data"] },
        ].map((r, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${r.color}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center"><Icon name={r.icon} className="w-4 h-4" /></div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${r.badge}`}>{r.role}</span>
            </div>
            <div className="space-y-1.5">
              {r.perms.map((p, j) => (
                <div key={j} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />{p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    onchain: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Storing large files directly on Ethereum is prohibitively expensive. MediChain uses a <strong className="text-indigo-600">hybrid on-chain / off-chain architecture</strong> a design pattern validated in the dissertation literature review.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <p className="font-black text-indigo-700 mb-3 flex items-center gap-2">⛓️ On-Chain (Ethereum)</p>
            <div className="space-y-2 text-sm text-gray-700">
              {["Patient registration data","Doctor credentials & approval status","Appointment records","IPFS metadata hashes (CIDs)","Access control permissions","Transaction timestamps"].map((item, i) => (
                <div key={i} className="flex items-center gap-2"><span className="text-indigo-400">→</span>{item}</div>
              ))}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="font-black text-green-700 mb-3 flex items-center gap-2">🌐 Off-Chain (IPFS via Pinata)</p>
            <div className="space-y-2 text-sm text-gray-700">
              {["Medical record files (PDF, images)","Doctor photos & certificates","Patient profile metadata","Prescription documents","Extended doctor profiles","Personal uploaded documents"].map((item, i) => (
                <div key={i} className="flex items-center gap-2"><span className="text-green-500">→</span>{item}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0"><Icon name="lightbulb" /></div>
          <p className="text-sm text-amber-800">
            <strong>GDPR alignment:</strong> Personal data lives off-chain on IPFS. Only the cryptographic hash (CID) is stored on Ethereum. This satisfies GDPR's data minimisation principle while maintaining on-chain verifiability a hybrid architecture recommended by Harwich & Stevens (2018) in the literature review.
          </p>
        </div>
      </div>
    ),
  };

  return (
    <section id="contract" className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-3">The Core Engine</p>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-5">Smart Contracts</h2>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto">
            Written in Solidity, deployed on Ethereum. The contract is the system's backbone, enforcing every rule, every permission, every record without any human middleman.
          </p>
        </div>

        {/* Tech stack badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { label:"Solidity 0.8.20",  color:"bg-gray-800 text-white"          },
            { label:"Ethereum Sepolia", color:"bg-indigo-100 text-indigo-700"   },
            { label:"Hardhat",          color:"bg-yellow-100 text-yellow-800"   },
            { label:"Wagmi + Ethers v6",color:"bg-blue-100 text-blue-700"       },
            { label:"Alchemy RPC",      color:"bg-purple-100 text-purple-700"   },
            { label:"IPFS / Pinata",    color:"bg-green-100 text-green-700"     },
            { label:"Privy Auth",       color:"bg-pink-100 text-pink-700"       },
            { label:"React + Tailwind", color:"bg-cyan-100 text-cyan-700"       },
          ].map((b, i) => (
            <span key={i} className={`px-4 py-2 rounded-full text-sm font-bold ${b.color}`}>{b.label}</span>
          ))}
        </div>

        {/* Tabbed content */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-indigo-100/30 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max px-6 py-4 text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-8">{content[activeTab]}</div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works (steps) ──────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n:"01", icon:"pencil", title:"Register",            color:"from-blue-500 to-indigo-600",  glow:"shadow-blue-200",
      desc:"Patients sign up with biometric passkeys no wallet needed. Doctors register with MetaMask. Both stored on Ethereum via smart contract." },
    { n:"02", icon:"shield", title:"Smart Contract Verify",color:"from-purple-500 to-violet-600",glow:"shadow-purple-200",
      desc:"The Solidity contract enforces role-based access. Doctor credentials are reviewed and approved on-chain  permanently auditable on Ethereum." },
    { n:"03", icon:"calendar", title:"Book Appointments",   color:"from-green-500 to-teal-600",   glow:"shadow-green-200",
      desc:"Patients book with verified doctors. A relayer covers all gas fees  patients never need ETH or a crypto wallet to interact with the chain." },
    { n:"04", icon:"stethoscope", title:"Access Records",       color:"from-orange-500 to-rose-500",  glow:"shadow-orange-200",
      desc:"Doctors add encrypted records to IPFS. The hash is stored on-chain. Patients control access grant or revoke any doctor at any time." },
  ];
  return (
    <section className="bg-white py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-3">The Process</p>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-5">How It Works</h2>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto">Four steps every one of them enforced by smart contract, not by trust.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent z-10" />
              )}
              <div className="bg-white border border-gray-100 hover:border-indigo-200 rounded-3xl p-7 h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-indigo-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 text-8xl font-black text-gray-50 select-none leading-none -mt-2 -mr-2">{s.n}</div>
                <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} items-center justify-center shadow-lg ${s.glow} mb-5 text-white`}><Icon name={s.icon} className="w-7 h-7" /></div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI Section ────────────────────────────────────────────────────────────────
function AISection() {
  const patientBenefits = [
    { icon:"chat", title:"Ask Health Questions",   desc:"Chat with AI trained on your own medical records. Ask about your diagnosis, medications, or treatment plan in plain English  without needing to call a GP." },
    { icon:"pill", title:"Medication Guidance",    desc:"Understand your prescriptions, dosage schedules, and potential interactions  explained clearly, without medical jargon." },
    { icon:"chart", title:"Health Trend Analysis",  desc:"AI analyses your records over time to spot patterns and flag unusual changes worth discussing with your doctor at the next appointment." },
    { icon:"speakerphone", title:"Pre-Visit Summary",      desc:"Before an appointment, AI generates a summary of your recent records so your doctor arrives fully prepared." },
  ];
  const doctorBenefits = [
    { icon:"search", title:"Full Record Analysis",   desc:"Instantly analyse a patient's complete medical history. AI surfaces relevant insights  saving valuable consultation time." },
    { icon:"warning", title:"Anomaly Detection",      desc:"AI cross-references blockchain-logged data to flag unusual patterns abnormal vitals, conflicting medications, or missing follow-ups." },
    { icon:"clipboard", title:"Smart Summaries",        desc:"Auto-generate concise, clinically structured patient summaries before consultations readable and relevant." },
    { icon:"brain", title:"Decision Support",       desc:"Cross-reference symptoms and records with AI-generated differential diagnosis suggestions as an evidence-based support tool." },
  ];

  return (
    <section id="ai" className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white py-32 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400" />
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-purple-500 font-bold tracking-widest uppercase text-sm mb-3">Artificial Intelligence</p>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-5">
            AI That Works For You <br />
            <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Privately.</span>
          </h2>
          <p className="text-gray-500 text-xl max-w-3xl mx-auto">
            Unlike cloud AI tools that send your data to external servers, MediChain runs AI entirely on-premise using local models. Your medical records never leave the system.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white border-2 border-purple-200 rounded-2xl p-6 mb-16 shadow-lg shadow-purple-100/50 max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white"><Icon name="hospital" className="w-7 h-7" /></div>
          <div>
            <p className="font-black text-gray-900 text-lg">On-Premise AI, GDPR Compliant</p>
            <p className="text-gray-500 text-sm mt-1">AI models run locally on the server. Patient data is never sent to OpenAI, Google, or any third-party a deliberate architectural decision for NHS and GDPR compliance.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-xl shadow-blue-50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg text-white"><Icon name="hospital" className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-black text-blue-500 uppercase tracking-widest">For Patients</p>
                <h3 className="text-2xl font-black text-gray-900">Your Personal AI Health Guide</h3>
              </div>
            </div>
            <div className="space-y-4">
              {patientBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-indigo-500"><Icon name={b.icon} /></div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">{b.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-green-100 p-8 shadow-xl shadow-green-50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg text-white"><Icon name="stethoscope" className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-black text-green-600 uppercase tracking-widest">For Doctors</p>
                <h3 className="text-2xl font-black text-gray-900">Clinical AI Decision Support</h3>
              </div>
            </div>
            <div className="space-y-4">
              {doctorBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-green-50/50 hover:bg-green-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-indigo-500"><Icon name={b.icon} /></div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">{b.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Privacy & Ownership ───────────────────────────────────────────────────────
function PrivacySection() {
  const pillars = [
    { icon:"user", color:"from-blue-500 to-indigo-600",   glow:"shadow-blue-200",   bg:"bg-blue-50",
      title:"You Own Your Data",
      desc:"In traditional healthcare, hospitals own your records. On MediChain, your data is tied to your identity  not an institution. No hospital, no government, no company can access your records without your explicit on-chain permission." },
    { icon:"key", color:"from-purple-500 to-violet-600", glow:"shadow-purple-200", bg:"bg-purple-50",
      title:"You Control Access",
      desc:"Grant a doctor access in one click. Revoke it instantly. Every access event is logged on Ethereum with a timestamp giving you a complete, tamper-proof audit trail of who saw what and when." },
    { icon:"lock", color:"from-green-500 to-teal-600",    glow:"shadow-green-200",  bg:"bg-green-50",
      title:"Encrypted at Rest",
      desc:"All medical files are encrypted before being stored on IPFS. Even if someone obtained the raw data, they could not read it without the encryption key which only you hold." },
    { icon:"globe", color:"from-orange-500 to-rose-500",   glow:"shadow-orange-200", bg:"bg-orange-50",
      title:"No Central Database",
      desc:"There is no single server to hack. Records are distributed across the global IPFS network. Only cryptographic hash references live on the blockchain your actual files are decentralised." },
    { icon:"clipboard", color:"from-teal-500 to-cyan-600",     glow:"shadow-teal-200",   bg:"bg-teal-50",
      title:"GDPR by Design",
      desc:"Personal data never touches centralised servers. AI runs on-premise. Only hashes on-chain. A hybrid architecture aligned with GDPR's data minimisation principle and the right to data portability." },
    { icon:"eye", color:"from-indigo-500 to-blue-600",   glow:"shadow-indigo-200", bg:"bg-indigo-50",
      title:"Full Transparency",
      desc:"Every approval, every record addition, every access grant  all written to the Ethereum blockchain. Publicly verifiable. Permanently auditable. No hidden actions, no secret modifications." },
  ];

  return (
    <section id="privacy" className="bg-white py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-3">Privacy & Ownership</p>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-5">
            Your Records.<br />
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Your Rules.</span>
          </h2>
          <p className="text-gray-500 text-xl max-w-3xl mx-auto">
            Traditional healthcare stores your most sensitive data in centralised, vulnerable databases prone to breaches, data sales, and unauthorised access. We built something fundamentally different.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <div key={i} className={`group ${p.bg} rounded-3xl p-7 border border-transparent hover:border-gray-200 hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-gray-100`}>
              <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} items-center justify-center shadow-lg ${p.glow} mb-5 group-hover:scale-110 transition-transform text-white`}><Icon name={p.icon} className="w-7 h-7" /></div>
              <h3 className="text-lg font-black text-gray-900 mb-3">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "30px 30px" }} />
      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Ready to Own Your<br />Health Data?</h2>
        <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">Join MediChain today. No crypto experience needed. Your data stays yours always.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="/patient/register"
            className="px-10 py-5 bg-white hover:bg-blue-50 text-indigo-700 font-black rounded-2xl shadow-2xl transition-all transform hover:scale-105 text-lg">
            Register as Patient
          </a>
          <a href="/doctor/register"
            className="px-10 py-5 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-black rounded-2xl transition-all transform hover:scale-105 text-lg backdrop-blur-sm">
            Register as Doctor
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">MediChain</p>
                <p className="text-indigo-400 text-xs tracking-widest uppercase font-bold">NHS · Blockchain</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-5">
              A Web3 blockchain healthcare DApp  BSc (Hons) Software Development dissertation project, Glasgow Caledonian University. Supervised by Mr Ross Crawford.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Ethereum Sepolia","IPFS / Pinata","Privy Auth","Solidity 0.8.20","On-Premise AI"].map(t => (
                <span key={t} className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-semibold">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Navigate</p>
            <div className="space-y-3">
              {[["Home","#home"],["About","#about"],["Smart Contract","#contract"],["AI Features","#ai"],["Privacy","#privacy"]].map(([l,h]) => (
                <a key={l} href={h} className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Get Started</p>
            <div className="space-y-3">
              {[["Register as Patient","/patient/register"],["Register as Doctor","/doctor/register"],["Login","/login"]].map(([l,h]) => (
                <a key={l} href={h} className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">{l}</a>
              ))}
            </div>
            <div className="mt-6 p-3 bg-gray-800 rounded-xl">
              <p className="text-gray-500 text-xs font-semibold mb-1">Contract Address</p>
              <p className="text-gray-400 text-xs font-mono break-all">0x18B5630b...672560</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2025 MediChain · Abedulalrazaq Altaih · s2428152 · Glasgow Caledonian University</p>
          <p className="text-gray-700 text-xs">Deployed on Ethereum Sepolia Testnet</p>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatBlock { 0%,100% { transform:translateY(0px) rotate(-1deg); } 50% { transform:translateY(-18px) rotate(1deg); } }
      `}</style>
      <HomeNavbar />
      <Hero />
      <About />
      <SmartContractSection />
      <HowItWorks />
      <AISection />
      <PrivacySection />
      <CTABanner />
      <HomeFooter />
    </div>
  );
}