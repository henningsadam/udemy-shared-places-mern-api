const HttpError = require('../models/http-error');
const getCoordinatesForAddress = require('../utils/location');
const { validationResult } = require('express-validator');
const { v4: uuid } = require('uuid');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'A really large building in New York City.',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St New York, NY 10001',
    creatorId: 'u1',
  },
  {
    id: 'p2',
    title: 'White House',
    description: 'The big white house in Washington DC',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St New York, NY 10001',
    creatorId: 'u2',
  },
  {
    id: 'p3',
    title: 'Another place',
    description: 'A another building somewhere in the world',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St New York, NY 10001',
    creatorId: 'u1',
  },
];

exports.getPlaceById = (req, res, next) => {
  const placeId = req.params.placeId;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    return next(new HttpError('Place not found.', 404));
  }

  res.json({ place });
};

exports.getPlacesByUserId = (req, res, next) => {
  const userId = req.params.userId;
  const places = DUMMY_PLACES.filter((p) => p.creatorId === userId);

  if (places.length === 0) {
    return next(new HttpError('No places found for given user.', 404));
  }

  res.json({ places });
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid data', 422);
    return next(error);
  }

  const { title, description, address, creatorId } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creatorId,
  };

  DUMMY_PLACES.push(newPlace);

  res.status(201).json({ place: newPlace });
};

exports.updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid data', 422);
    return next(error);
  }

  const placeId = req.params.placeId;
  const { title, description } = req.body;

  const existingPlace = DUMMY_PLACES.find((p) => p.id === placeId);

  // update the properties of that object using the props in the request
  const updatedPlace = {
    ...existingPlace,
    title,
    description,
  };

  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  DUMMY_PLACES[placeIndex] = updatedPlace;

  res
    .status(200)
    .json({ message: 'Successfully updated place.', place: updatedPlace });
};

exports.deletePlace = (req, res, next) => {
  // Lookup and reteive the place object using the ID given in the request
  const placeId = req.params.placeId;

  const existingPlace = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!existingPlace) {
    const error = new HttpError('No place found.', 404);
    return next(error);
  }

  // remove that item from the array
  const DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);

  // send success
  res.status(200).json({ message: 'Successfully deleted place.' });
};
