const express = require('express');
const router = express.Router();
// const Post = require('../models/Post');

router.get('', (req, res) => {
    const locals = { title: "Varanomics" };
    res.render('public/index', { locals });
});

router.get('/business-management', (req, res) => {
    const locals = { title: "Business Management" };
    res.render('public/business-management', { locals });
});

router.get('/economics', (req, res) => {
    const locals = { title: "Economics" };
    res.render('public/economics', { locals });
});

module.exports = router;