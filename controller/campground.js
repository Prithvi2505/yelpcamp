const Campground = require('../models/campgrounds');
const { cloudinary } = require('../cloudinary');
const maptileClient = require('@maptiler/client');
maptileClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })

};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async(req, res) => {
    const geoData = await maptileClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData.features[0].geometry.coordinates);
    // res.send(geoData.features[0].geometry);
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Campground created successfully!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...img);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log(campground);
    req.flash('success', 'Campground Edited successfully!');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds');
};