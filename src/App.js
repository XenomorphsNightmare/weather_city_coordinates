import './App.css';
import React, {useState} from "react";
import FetchCoordinates from "./Fetch_functions";
import {AirGraph, SoilMoistureTable,SoilTempTable} from "./d3_func";


function App() {
  const [cityName, setName] = useState(null);
  const [sendStatus, setSend] = useState(false);
  const [cityResults, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("");


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

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

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
        <button
            className={activeTab === '0' ? 'active' : ''}
            onClick={() => handleTabChange('0')}
          >
            Soil Moisture
          </button>
          <button
            className={activeTab === '1' ? 'active' : ''}
            onClick={() => handleTabChange('1')}
          >
            Soil Temperature
          </button>
          <button
            className={activeTab === '2' ? 'active' : ''}
            onClick={() => handleTabChange('2')}
          >
            Air Temperature
          </button>
        <h1>Weather Results </h1>
 
        {activeTab === '0' && (
          <div>
            {cityResults &&  <SoilMoistureTable jsonData={cityResults.weatherData} />}
          </div>
        )}
        {activeTab === '1' && (
          <div>
            {cityResults && <SoilTempTable jsonData={cityResults.weatherData} />}
          </div>
        )}
         {activeTab === '2' && (
          <div>
            {cityResults && <AirGraph jsonData={cityResults.weatherData} />}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;