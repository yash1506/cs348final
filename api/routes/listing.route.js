import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import Listing from '../models/listing.model.js';

const router = express.Router();

router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);
router.get('/filters/types', async (req, res, next) => {
  try {
    const types = await Listing.distinct('type');
    res.json(types);
  } catch (error) {
    next(error);
  }
});

// Endpoint to get distinct 'bedrooms'
router.get('/filters/beds', async (req, res, next) => {
  try {
    const beds = await Listing.distinct('bedrooms');
    res.json(beds.filter(bed => bed !== null).sort((a, b) => a - b));  // Filtering null values and sorting
  } catch (error) {
    next(error);
  }
});

// Endpoint to get distinct 'bathrooms'
router.get('/filters/baths', async (req, res, next) => {
  try {
    const baths = await Listing.distinct('bathrooms');
    res.json(baths.filter(bath => bath !== null).sort((a, b) => a - b));  // Filtering null values and sorting
  } catch (error) {
    next(error);
  }
});

export default router;
