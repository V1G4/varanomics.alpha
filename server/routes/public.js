const express = require('express');
const router = express.Router();

const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Chapter = require('../models/Chapter');



router.get('', (req, res) => {
    const locals = { title: "Varanomix" };
    res.render('public/index', { locals });
});

router.get('/business-management', async (req, res) => {
    const locals = { title: "Business Management" };

    let units = [];
    const subject = await Subject.findOne({ name: "business-management" }).lean();
    
    if (subject && subject.units.length > 0) {

        for (let i = 0; i < subject.units.length; i++) {
            const unitId = subject.units[i];
            let unit = await Unit.findById(unitId).lean();

            if (unit.chapters && unit.chapters.length > 0) {
                let chapters = [];

                for (let j = 0; j < unit.chapters.length; j++) {
                    const chapterId = unit.chapters[j];
                    let chapter = await Chapter.findById(chapterId).lean();
                    chapters.push(chapter);
                }

                unit = { ...unit, chapters };
            } else {
                unit = { ...unit, chapters: [] };
            }

            units.push(unit);
        }
    }

    res.render('public/business-management', { locals, units });
});

router.get('/economics', async (req, res) => {
    const locals = { title: "Economics" };

    let units = [];
    const subject = await Subject.findOne({ name: "economics" }).lean();
    
    if (subject && subject.units.length > 0) {

        for (let i = 0; i < subject.units.length; i++) {
            const unitId = subject.units[i];
            let unit = await Unit.findById(unitId).lean();

            if (unit.chapters && unit.chapters.length > 0) {
                let chapters = [];

                for (let j = 0; j < unit.chapters.length; j++) {
                    const chapterId = unit.chapters[j];
                    let chapter = await Chapter.findById(chapterId).lean();
                    chapters.push(chapter);
                }

                unit = { ...unit, chapters };
            } else {
                unit = { ...unit, chapters: [] };
            }

            units.push(unit);
        }
    }

    res.render('public/economics', { locals, units });
});

router.get('/business-management/:chapterId', async (req, res) => {
    const { chapterId } = req.params;
    const locals = { title: "Business Management" };
    const chapter = await Chapter.findById(chapterId).lean();    

    res.render('public/chapter', { locals, chapter });
});

router.get('/economics/:chapterId', async (req, res) => {
    const { chapterId } = req.params;
    const locals = { title: "Economics" };
    const chapter = await Chapter.findById(chapterId).lean();

    res.render('public/chapter', { locals, chapter });
});

module.exports = router;