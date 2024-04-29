import Listing from '../models/listing.model.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const {
      limit = 9,
      startIndex = 0,
      offer = 'false',
      furnished = 'false',
      parking = 'false',
      type = 'all',
      beds,
      baths,
      minPrice,
      maxPrice,
      searchTerm = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const queryConditions = {
      offer: { $in: offer === 'false' ? [false, true] : [true] },
      furnished: { $in: furnished === 'false' ? [false, true] : [true] },
      parking: { $in: parking === 'false' ? [false, true] : [true] },
      type: type === 'all' ? { $in: ['sale', 'rent'] } : type,
      ...(beds && { bedrooms: { $eq: parseInt(beds) } }),
      ...(baths && { bathrooms: { $eq: parseInt(baths) } }),
      ...(minPrice && maxPrice && { regularPrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) } }),
      name: { $regex: searchTerm, $options: 'i' },
    };

    const listings = await Listing.find(queryConditions)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(parseInt(startIndex));
    
      const stats = await Listing.aggregate([
        { $match: queryConditions },
        { $group: {
          _id: null,
          averagePrice: { $avg: "$regularPrice" },
          averageBeds: { $avg: "$bedrooms" },
          averageBaths: { $avg: "$bathrooms" },
          averageAmenityScore: { $avg: {
            $add: [
              { $cond: ["$furnished", 1, 0] },
              { $cond: ["$parking", 1, 0] }
            ]
          }}
        }}
      ]);

    return res.status(200).json({ listings, stats: stats[0] });
  } catch (error) {
    next(error);
  }
};
