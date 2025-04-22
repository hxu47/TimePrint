import { WEATHER_API_KEY } from '../config';

export const getWeatherData = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const weatherData = await response.json();
    
    return {
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};


/**
 * Gets an icon name based on weather condition
 * @param {string} condition - The weather condition
 * @returns {string} - The name of the Feather icon to use
 */
export const getWeatherIconName = (condition) => {
  if (!condition) return 'cloud';
  
  switch (condition.toLowerCase()) {
    case 'clear':
      return 'sun';
    case 'clouds':
      return 'cloud';
    case 'rain':
      return 'cloud-rain';
    case 'snow':
      return 'cloud-snow';
    case 'thunderstorm':
      return 'cloud-lightning';
    case 'drizzle':
      return 'cloud-drizzle';
    case 'mist':
    case 'smoke':
    case 'haze':
    case 'dust':
    case 'fog':
      return 'cloud-off';
    default:
      return 'cloud';
  }
};

/**
 * Gets an emoji representation of weather condition
 * @param {string} condition - The weather condition
 * @returns {string} - An emoji representing the weather
 */
export const getWeatherEmoji = (condition) => {
  if (!condition) return '🌤️';
  
  switch(condition.toLowerCase()) {
    case 'clear': return '☀️';
    case 'clouds': return '☁️';
    case 'rain': return '🌧️';
    case 'snow': return '❄️';
    case 'thunderstorm': return '⛈️';
    case 'drizzle': return '🌦️';
    case 'mist': return '🌫️';
    case 'smoke': return '🌫️';
    case 'haze': return '🌫️';
    case 'dust': return '🌫️';
    case 'fog': return '🌫️';
    default: return '🌤️';
  }
};