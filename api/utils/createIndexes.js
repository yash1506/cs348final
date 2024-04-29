import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';

export const createListingIndexes = async () => {
    try {
        await Listing.createIndexes({
            'type': 1, 'offer': 1, 'furnished': 1, 'parking': 1,
            'regularPrice': 1,
            'createdAt': -1,
            'bedrooms': 1, 'bathrooms': 1,
            'userRef': 1
        });
        console.log('Indexes created for Listings');
    } catch (err) {
        console.error('Error creating indexes for Listings:', err);
    }
};

export const createUserIndexes = async () => {
    try {
        await User.createIndexes({
            'email': 1,
            'username': 1
        });
        console.log('Indexes created for Users');
    } catch (err) {
        console.error('Error creating indexes for Users:', err);
    }
};
