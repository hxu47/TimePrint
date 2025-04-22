import React from 'react';
import { Feather } from '@expo/vector-icons';
import { getWeatherIconName } from '../../services/weatherService';

/**
 * Renders a weather icon based on the weather condition
 * @param {Object} props - Component props
 * @param {string} props.condition - Weather condition
 * @param {number} props.size - Icon size
 * @param {string} props.color - Icon color
 * @returns {React.Component} - A Feather icon representing the weather
 */
const WeatherIcon = ({ condition, size = 20, color = '#666' }) => {
  const iconName = getWeatherIconName(condition);
  return <Feather name={iconName} size={size} color={color} />;
};

export default WeatherIcon;