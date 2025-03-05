const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("Database is connected")
    })
    .catch((e) => {
        console.log("You Have an Error");
        console.log(e);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];
const price = Math.floor(Math.random() * 30) + 10;
const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '67b75970d0bda30a790afe23',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            // image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, maxime deleniti? Commodi vitae excepturi magni corporis dignissimos eos reprehenderit, culpa accusamus vel rem voluptate placeat explicabo ipsa harum, deserunt dicta!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [{
                    url: 'https://res.cloudinary.com/diseb3qei/image/upload/v1740468116/YelpCamp/jpkcxicggtn1gg7osju5.jpg',
                    filename: 'YelpCamp/jpkcxicggtn1gg7osju5'
                },
                {
                    url: 'https://res.cloudinary.com/diseb3qei/image/upload/v1740468117/YelpCamp/gi9awbya6ww6hyqznjsd.jpg',
                    filename: 'YelpCamp/gi9awbya6ww6hyqznjsd'
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})