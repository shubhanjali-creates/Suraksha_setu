import axios from "axios";

// Use an optional absolute API URL in production. During local development,
// CRA's proxy forwards relative /api-style requests to the Express server.
const DMS = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

export default DMS;
