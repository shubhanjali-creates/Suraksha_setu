import React, { useState, useEffect } from 'react';

import '../assets/CSS/Incidents.css';

import locicon from '../assets/images/location.png';

import { Map } from '../components';


export const Incidents = () => {

  const [AllLocations, setAllLocations] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [locations, setLocations] = useState(null);

  // =========================
  // INDIA LOCATION DATA
  // =========================

  const StatesAndUTs = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ];

  const [selectedState, setSelectedState] = useState("Chhattisgarh");
  const [district, setDistrict] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [village, setVillage] = useState("");
  const [exactLocation, setExactLocation] = useState("");

  // =========================
  // LOCATION / MAP
  // =========================

  const [locateOn, setlocateOn] = useState(false);
  const [myLocation, setMyLocation] = useState(null);

  // Raipur, Chhattisgarh
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);

  // =========================
  // LOCATION BUTTON
  // =========================

  const getMyLocation = () => {
    if (locateOn) {
      setlocateOn(false);
    } else {
      setlocateOn(true);
    }

    console.log('Location form opened');
  };

  const iconClick = () => {

    if (locateOn) {
      setlocateOn(false);
    } else {
      setMyLocation(null);
      setlocateOn(true);
    }

  };

  // =========================
  // SET LOCATION
  // =========================

  const setLocation = () => {

    const ExLoc =
      exactLocation +
      ", " +
      village +
      ", " +
      tehsil +
      ", " +
      district +
      ", " +
      selectedState;

    setMyLocation(ExLoc);
    setlocateOn(false);
  };

  // =========================
  // SUBMIT INCIDENT
  // =========================

  const submitIncident = async () => {

    const incidentType =
      document.getElementById('IncidentType').value;

    const incidentDate =
      document.getElementById('IncidentDate').value;

    const incidentLocation =
      document.getElementById('LocationID').value;

    const incidentDescription =
      document.getElementById('IncidentDescription').value;

    const affected =
      document.getElementById('Affected').value;

    const incidentStatus =
      document.getElementById('IncidentStatus').value;

    const urgency =
      document.getElementById('Urgency').value;

    const incidentLocationText =
      document.getElementById('IncidentLocation').value;

    console.log(
      incidentType,
      incidentDate,
      incidentLocation,
      incidentDescription,
      affected,
      incidentStatus,
      urgency
    );

    // =========================
    // GET LOGGED-IN USER
    // =========================

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      alert("Please login before reporting an incident.");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      alert("Your login session is invalid. Please login again.");
      return;
    }

    if (!user || !user.UserID) {
      alert("User information is missing. Please login again.");
      return;
    }

    // =========================
    // INCIDENT OBJECT
    // =========================

    const incident = {

      // Existing backend fields
      LocationID: incidentLocation,
      IncidentType: incidentType,
      Description: incidentDescription,
      ReportedBy: user.UserID,
      DateReported: incidentDate,
      Urgency: urgency,
      Status: incidentStatus,

      // Additional India-based location information
      State: selectedState,
      District: district,
      Tehsil: tehsil,
      Village: village,
      IncidentLocation: incidentLocationText,

      // Other information
      Affected: affected,
      Latitude: latitude,
      Longitude: longitude
    };

    console.log("Incident being sent to server:", incident);

    try {

      const response = await fetch(
        '/incident/create',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
          },

          body: JSON.stringify(incident)
        }
      );

      const data = await response.json();

      console.log("Server response:", data);

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to report incident."
        );
        return;
      }

      alert("Incident reported successfully!");

      window.location.reload();

    } catch (error) {

      console.error(
        "Error reporting incident:",
        error
      );

      alert(
        "Could not connect to the server. Make sure the backend is running."
      );
    }
  };

  // =========================
  // FETCH INCIDENTS
  // =========================

  useEffect(() => {

    fetch('/home')

      .then(res => res.json())

      .then(data => {

        setIncidents(data);

        const Maplocations = data.MapLocation || [];

        if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
          Maplocations.push({ position: [Number(latitude), Number(longitude)], popupText: "Selected location" });
        }

        console.log(Maplocations);

        setLocations(Maplocations);

        console.log(data);

      })

      .catch(error => {

        console.error(
          "Error fetching incident data:",
          error
        );

      });

  }, [latitude, longitude]);


  return (

    <div className='inc-container'>

      {/* =========================
          LOCATION SECTION
      ========================== */}

      <h1 className='section-header'>
        Your Location
      </h1>

      <div className="location-box">

        <div className="location-bar">

          <img
            className='loc-icon'
            src={locicon}
            onClick={iconClick}
            alt="location icon"
          />

          <div className="locator">

            {
              myLocation
                ? myLocation
                : (
                  <button
                    className="locate"
                    onClick={getMyLocation}
                  >
                    locate
                  </button>
                )
            }

          </div>

        </div>


        {/* =========================
            INDIA LOCATION FORM
        ========================== */}

        <form
          id='location-form'
          className='location-form'
          style={{
            display: locateOn
              ? "inline-block"
              : "none"
          }}
        >

          {/* Latitude */}

          <div className="form-item">

            <label htmlFor="latitude">
              Latitude
            </label>

            <input
              type='number'
              id="latitude"
              name="latitude"
              value={latitude}
              onChange={(e) => {
                setLatitude(e.target.value);
              }}
              style={{
                marginLeft: "55px"
              }}
            />

          </div>


          {/* Longitude */}

          <div className="form-item">

            <label htmlFor="longitude">
              Longitude
            </label>

            <input
              type="number"
              id="longitude"
              name="longitude"
              value={longitude}
              onChange={(e) => {
                setLongitude(e.target.value);
              }}
              style={{
                marginLeft: "40px"
              }}
            />

          </div>


          {/* State / UT */}

          <div className="form-item">

            <label htmlFor="State">
              State / UT
            </label>

            <select
              id="State"
              name="State"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
              }}
              style={{
                marginLeft: "45px"
              }}
            >

              {
                StatesAndUTs.map((state) => (

                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>

                ))
              }

            </select>

          </div>


          {/* District */}

          <div className="form-item">

            <label htmlFor="District">
              District
            </label>

            <input
              type="text"
              id="District"
              name="District"
              placeholder="Enter district"
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
              }}
              style={{
                marginLeft: "64px"
              }}
            />

          </div>


          {/* Tehsil */}

          <div className="form-item">

            <label htmlFor="Tehsil">
              Tehsil / Taluk / Block
            </label>

            <input
              type="text"
              id="Tehsil"
              name="Tehsil"
              placeholder="Enter Tehsil / Taluk / Block"
              value={tehsil}
              onChange={(e) => {
                setTehsil(e.target.value);
              }}
            />

          </div>


          {/* Village */}

          <div className="form-item">

            <label htmlFor="Village">
              Village / Local Area
            </label>

            <input
              type="text"
              id="Village"
              name="Village"
              placeholder="Enter village / local area"
              value={village}
              onChange={(e) => {
                setVillage(e.target.value);
              }}
            />

          </div>


          {/* Exact Location */}

          <div className="form-item">

            <label htmlFor="ExLoc">
              Exact Location
            </label>

            <input
              type="text"
              id="ExLoc"
              name="ExLoc"
              placeholder="Street, landmark, area..."
              value={exactLocation}
              onChange={(e) => {
                setExactLocation(e.target.value);
              }}
            />

          </div>


          <button
            type="button"
            className='submit-btn'
            onClick={(e) => {

              e.preventDefault();

              setLocation();

            }}
          >
            Submit
          </button>

        </form>

      </div>


      {/* =========================
          ALERT
      ========================== */}

      {
        myLocation &&

        <div className="alert-box">

          <h1>
            Alert !
          </h1>

          <p className='alert'>
            There are some incidents reported in your area.
            Please stay safe.
          </p>

        </div>
      }


      {/* =========================
          REPORT INCIDENT
      ========================== */}

      <form
        className='location-form'
        style={{
          display: "inline-block"
        }}
      >

        <h1 className='section-header'>
          Report an Incident
        </h1>


        {/* Incident Type */}

        <div className="form-item">

          <label htmlFor="IncidentType">
            Incident Type
          </label>

          <select
            id="IncidentType"
            name="IncidentType"
            style={{
              marginLeft: "66px"
            }}
          >

            <option value="Flood">
              Flood
            </option>

            <option value="Earthquake">
              Earthquake
            </option>

            <option value="Fire">
              Fire
            </option>

            <option value="Cyclone">
              Cyclone
            </option>

            <option value="Landslide">
              Landslide
            </option>

            <option value="Drought">
              Drought
            </option>

            <option value="Heatwave">
              Heatwave
            </option>

            <option value="Accident">
              Accident
            </option>

            <option value="Others">
              Others
            </option>

          </select>

        </div>


        {/* Date */}

        <div className="form-item">

          <label htmlFor="IncidentDate">
            Incident Date
          </label>

          <input
            type="datetime-local"
            id="IncidentDate"
            name="IncidentDate"
            style={{
              marginLeft: "66px"
            }}
          />

        </div>


        {/* Location ID */}

        <div className="form-item">

          <label htmlFor="LocationID">
            Location ID
          </label>

          <input
            type="number"
            id="LocationID"
            name="LocationID"
            style={{
              marginLeft: "82px"
            }}
          />

        </div>


        {/* Incident Location */}

        <div className="form-item">

          <label htmlFor="IncidentLocation">
            Incident Location
          </label>

          <input
            type="text"
            id="IncidentLocation"
            name="IncidentLocation"
            placeholder="Area / landmark / street"
            style={{
              marginLeft: "34px"
            }}
          />

        </div>


        {/* Description */}

        <div className="form-item">

          <label htmlFor="IncidentDescription">
            Incident Description
          </label>

          <input
            id="IncidentDescription"
            name="IncidentDescription"
            placeholder="Describe the incident"
            style={{
              marginLeft: "10px"
            }}
          />

        </div>


        {/* Affected */}

        <div className="form-item">

          <label htmlFor="Affected">
            Affected Individuals
          </label>

          <input
            type="number"
            id="Affected"
            name="Affected"
            style={{
              marginLeft: "12px"
            }}
          />

        </div>


        {/* Status */}

        <div className="form-item">

          <label htmlFor="IncidentStatus">
            Incident Status
          </label>

          <select
            id="IncidentStatus"
            name="IncidentStatus"
            style={{
              marginLeft: "51px"
            }}
          >

            <option value="Running">
              Running
            </option>

            <option value="Expired">
              Expired
            </option>

          </select>

        </div>


        {/* Urgency */}

        <div className="form-item">

          <label htmlFor="Urgency">
            Urgency
          </label>

          <select
            id="Urgency"
            name="Urgency"
            style={{
              marginLeft: "107px"
            }}
          >

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

        </div>


        {/* Submit */}

        <button
          type='button'
          className='submit-btn'
          onClick={() => {
            submitIncident();
          }}
        >
          Submit
        </button>

      </form>


      {/* =========================
          MAP
      ========================== */}

      <h1 className='section-header'>
        Scan your area
      </h1>


      {
        locations &&

        <Map
          locations={locations}
          longitude={longitude}
          latitude={latitude}
          defaultZoom={12.5}
        />

      }


      {/* =========================
          INCIDENT LIST
      ========================== */}

      <h1 className='section-header'>
        Recent List of Incidents
      </h1>


      <table className='incident-table'>

        <thead>

          <tr>

            <th>
              Incident ID
            </th>

            <th>
              Incident Type
            </th>

            <th>
              Incident Date
            </th>

            <th>
              Incident Location
            </th>

            <th>
              Incident Description
            </th>

            <th>
              Incident Status
            </th>

            <th>
              Urgency
            </th>

          </tr>

        </thead>


        <tbody>

          {
            incidents &&
            incidents.incidentList &&
            incidents.incidentList.map((incident) => (

              <tr
                key={incident.IncidentID}
              >

                <td>
                  {incident.IncidentID}
                </td>

                <td>
                  {incident.IncidentType}
                </td>

                <td>
                  {incident.DateReported}
                </td>

                <td>
                  {incident.Location}
                </td>

                <td>
                  {incident.Description}
                </td>

                <td>
                  {incident.Status}
                </td>

                <td>
                  {incident.Urgency}
                </td>

              </tr>

            ))
          }

        </tbody>

      </table>

    </div>
  );
};