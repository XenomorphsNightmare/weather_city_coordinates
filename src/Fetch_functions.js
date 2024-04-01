import axios from 'axios';

async function fetchWeatherData(latitude, longitude) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}2&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm&forecast_days=3`;
    console.log(latitude,longitude)
    try {
      const response = await axios.get(apiUrl, {
        headers: {
            "User-Agent" : "my React app",
        }
    });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
  

async function FetchCoordinates (cityName) {
    try {
        const encodedCityName = encodeURIComponent(cityName);

        const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodedCityName}&format=geojson`;

        const response = await axios.get(apiUrl,{
            headers: {
                "User-Agent" : "my React app",
            }
        });

        const coordinates = response.data.features[0].geometry.coordinates;

        const weatherData = await fetchWeatherData(coordinates[1],coordinates[0])

        console.log(weatherData)

        const results = {"coordinates" : coordinates, "weatherData" : weatherData};

        return results;

    } catch (error) {
        console.error('Error fetching location:', error);
        return null;    
    }
}

export default FetchCoordinates;