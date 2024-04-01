import logo from './logo.svg';
import './App.css';
import React, {useState} from "react";
import FetchCoordinates from "./Fetch_functions";
import {SoilMoistureTable,SoilTempTable} from "./d3_func";


function App() {
  const [cityName, setName] = useState(null);
  const [sendStatus, setSend] = useState(false);
  const [cityResults, setResults] = useState(null);


  function getName(val) {
    setName(val.target.value);
    setSend(false);
  }

  async function buttonClickHandler(placeName) {
    try {
      const results = await FetchCoordinates(placeName);
      setResults(results);
    } catch (error) {
      console.error('Error:', error);
    }
    setSend(true);
  }

  function CityTable({ cityName, latitude, longitude }) {
    return (
      <table>
        <thead>
          <tr>
            <th>City Name</th>
            <th>Latitude</th>
            <th>Longitude</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{cityName}</td>
            <td>{latitude}</td>
            <td>{longitude}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {sendStatus &&
            <CityTable cityName={cityName} latitude={cityResults?.coordinates[1]} longitude={cityResults?.coordinates[0]} />
          }
          <input type='text' onChange={getName} />
          <button onClick={() => buttonClickHandler(cityName)}> Set city </button>
        </p>
        <h1>Weather Results </h1>
        {cityResults &&
        <SoilMoistureTable jsonData={cityResults.weatherData} />
        }
        {cityResults &&
        <SoilTempTable jsonData={cityResults.weatherData} />}

      </header>
    </div>
  );
}

export default App;