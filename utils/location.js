const axios = require('axios');
const HttpError = require('../models/http-error');
require('dotenv').config();

const getCoordinatesForAddress = async (address) => {
  const getUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  
  const response = await axios.get(getUrl);
  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS ') {
    const error = new HttpError('No location found for given address.', 422);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;
  return coordinates;
};

module.exports = getCoordinatesForAddress;