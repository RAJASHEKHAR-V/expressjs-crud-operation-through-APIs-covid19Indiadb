//import express, core path, sqlite open instance, sqlite3 methods

//express js initialization and path

const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());

//sqlite and sqlite3 initialization

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

//initializing database and server
let db = null;

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

//API-1 Get or Retrieve list of all the states in the state table

app.get("/states/", async (request, response) => {
  const getAllStatesQuery = `
    SELECT state_id AS stateId, state_name AS stateName,
    population AS population FROM state`;
  const arrayOfListOfStates = await db.all(getAllStatesQuery);
  response.send(arrayOfListOfStates);
});

//API-2 Get or Retrieve state based on specific Id from state table

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getIdStateQuery = `
    SELECT state_id AS stateId,
    state_name AS stateName,
    population AS population
    FROM state
    WHERE state_id=${stateId}`;
  const idSateObject = await db.get(getIdStateQuery);
  response.send(idSateObject);
});

//API-3 Create New District details in District table

app.post("/districts/", async (request, response) => {
  const newDistrictDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = newDistrictDetails;
  const createDistrictQuery = `
    INSERT INTO district (district_name, state_id, cases, cured,
        active, deaths)
        VALUES (
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths});`;
  const dbResponse = await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});

//API-4 Get Or retrieve the district based on specific id from district table

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getIdDistrictQuery = `
    SELECT district_id AS districtId,
    district_name AS districtName,
    state_id AS stateId,
    cases AS cases,
    cured AS cured,
    active AS active,
    deaths AS deaths FROM district
    WHERE district_id=${districtId}`;
  const districtObject = await db.get(getIdDistrictQuery);
  response.send(districtObject);
});

//API-5 Delete district details based on Id from District table.

app.delete("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const deleteIdDistrictQuery = `
    DELETE FROM district WHERE district_id=${districtId}`;
  await db.run(deleteIdDistrictQuery);
  response.send("District Removed");
});

//API-6 Update specific district based on district id=755.

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const updateDistrictDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = updateDistrictDetails;
  const updateIdDistrictQuery = `
    UPDATE district
    SET 
    district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    WHERE district_id=${districtId}`;
  await db.run(updateIdDistrictQuery);
  response.send("District Details Updated");
});

//API-7 Get Or retrieve the statics of the cases, cured, deaths from district table based on specific state id.

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statsIdStateQuery = `
    SELECT SUM(cases) AS totalCases,
    SUM(cured) AS totalCured,
    SUM(active) AS totalActive,
    SUM(deaths) AS totalDeaths
    FROM district
    WHERE state_id=${stateId}`;
  const statsDetails = await db.get(statsIdStateQuery);
  response.send(statsDetails);
});

//API-8 Get state name based on district id using state and district table

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateIdQuery = `
    SELECT state_id FROM district WHERE district_id=${districtId}`;
  const { state_id } = await db.get(getStateIdQuery);
  const getStateNameQuery = `
    SELECT state_name AS stateName
    FROM state
    WHERE state_id=${state_id}`;
  const stateName = await db.get(getStateNameQuery);
  response.send(stateName);
});

module.exports = app;
