const HttpError = require('../models/http-error');
const getCoordinatesForAddress = require('../utils/location');
const { validationResult } = require('express-validator');
const { v4: uuid } = require('uuid');
const Place = require('../models/places-model');

// let DUMMY_PLACES = [
//   {
//     id: 'p1',
//     title: 'Empire State Building',
//     description: 'A really large building in New York City.',
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516,
//     },
//     address: '20 W 34th St New York, NY 10001',
//     creatorId: 'u1',
//   },
//   {
//     id: 'p2',
//     title: 'White House',
//     description: 'The big white house in Washington DC',
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516,
//     },
//     address: '20 W 34th St New York, NY 10001',
//     creatorId: 'u2',
//   },
//   {
//     id: 'p3',
//     title: 'Another place',
//     description: 'A another building somewhere in the world',
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516,
//     },
//     address: '20 W 34th St New York, NY 10001',
//     creatorId: 'u1',
//   },
// ];

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.placeId;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Couldn't retrieve place from the database.",
      500
    );
    return next(error);
  }

  if (!place) {
    return next(new HttpError('Place not found.', 404));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Failed to retreive places from the database.',
      500
    );
    return next(error);
  }

  if (places.length === 0) {
    return next(new HttpError('No places found for given user.', 404));
  }

  const placeObjs = places.map((place) => place.toObject({ getters: true }));

  res.json({ places: placeObjs });
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid data', 422);
    return next(error);
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    imageUrl:
      'https://cdn.pixabay.com/photo/2017/03/27/15/01/canyon-2179250_1280.jpg',
    creator,
  });

  try {
    await newPlace.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Place failed to save to database.', 500);
    return next(error);
  }

  res.status(201).json({ place: newPlace });
};

exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid data', 422);
    return next(error);
  }

  const placeId = req.params.placeId;
  const { title, description } = req.body;

  // Use the placeId to lookup the item in the database
  let existingPlace;
  try {
    existingPlace = await Place.findById(placeId);
  } catch (err) {
    console.log(err);
    const error = new HttpError('Failed to retrieve place from database.', 500);
    return next(error);
  }

  // update the properties of that object using the props in the request
  existingPlace.title = title;
  existingPlace.description = description;

  try {
    await existingPlace.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Failed to save updated place to the database.',
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ message: 'Successfully updated place.', place: existingPlace });
};

exports.deletePlace = async (req, res, next) => {
  // Lookup and reteive the place object using the ID given in the request
  const placeId = req.params.placeId;

  let existingPlace;
  try {
    existingPlace = await Place.findById(placeId);
  } catch (err) {
    console.log(err);
    const error = new HttpError('Failed to retrieve place from database.', 500);
    return next(error);
  }
  if (!existingPlace) {
    const error = new HttpError('No place found.', 404);
    return next(error);
  }

  // Delete that item
  try {
    await Place.deleteOne({ _id: placeId });
  } catch (err) {
    console.log(err);
    const error = new HttpError('Failed to delete place from database.', 500);
    return next(error);
  }

  // send success
  res.status(200).json({ message: 'Successfully deleted place.' });
};
