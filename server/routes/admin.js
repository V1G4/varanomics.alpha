const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Chapter = require('../models/Chapter');
const Administrator = require('../models/Administrator');



router.get('/admin', async (req, res) => {
    const token = req.cookies.token;

    if (token) {
        return res.redirect('/dashboard');
    }

    const locals = { title: "Admin Login" };
    res.render('admin/index', { locals });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const administrator = await Administrator.findOne({ username });

    if (!administrator) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, administrator.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: administrator._id}, jwtSecret);
    res.cookie('token', token, { httpOnly: true});
    res.redirect('/dashboard');
});

router.post('/logout', async (req, res) => {
    try {
        res.cookie('token', '', { expires: new Date(0), httpOnly: true });
        res.redirect('/admin');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// router.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//         const administrator = await Administrator.create({ username, password:hashedPassword });
//         res.status(201).json({ message: "Administrator Created', administrator });
//     } catch (error) {

//         if (error.code === 11000) {
//             res.status(409).json({ message: "Username already in use" });
//         }

//         res.status(500).json({ message: "Internal server error" });
//     }
// });


const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch(error) {
        res.status(401).json({ message: "Unauthorized" });
    }
}

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        let businessUnits = [];
        const businessSubject = await Subject.findOne({ name: "business-management" }).lean();
        
        if (businessSubject && businessSubject.units.length > 0) {

            for (let i = 0; i < businessSubject.units.length; i++) {
                const unitId = businessSubject.units[i];
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

                businessUnits.push(unit);
            }
        }

        let economicsUnits = [];
        const economicsSubject = await Subject.findOne({ name: "economics" }).lean();
        
        if (economicsSubject && economicsSubject.units.length > 0) {

            for (let i = 0; i < economicsSubject.units.length; i++) {
                const unitId = economicsSubject.units[i];
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

                economicsUnits.push(unit);
            }
        }

        res.render('admin/dashboard', { 
            locals: { title: "Admin Dashboard" },
            businessUnits,
            economicsUnits
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


// router.post('/subject', authMiddleware, async (req, res) => {
//     const { name } = req.body;

//     try {
//         const subject = await Subject.create({ name });
//         res.status(201).json({ message: "Subject Created', subject });
//     } catch (error) {

//         if (error.code === 11000) {
//             res.status(409).json({ message: "Subject name already in use" });
//         }

//         res.status(500).json({ message: "Internal server error" });
//     }
// });


// Unit Routing

router.post('/unit/create/:subjectName', authMiddleware, async (req, res) => {
    const { subjectName } = req.params;
    const subject = await Subject.findOne({ name: subjectName });

    if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
    }

    try {
        const unit = await Unit.create({});
        subject.units.push(unit._id);
        await subject.save();

        res.redirect('/dashboard');

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            res.status(409).json({ message: "Unit creation conflict" });
        } else {
            res.status(500).json({ message: "Internal server error during unit creation" });
        }
    }
});

router.get('/unit/rename/:unitId', authMiddleware, async (req, res) => {
    const { unitId } = req.params;
    const unit = await Unit.findOne({ _id: unitId });

    try {
        res.render('admin/rename-unit', { 
            locals: { title: "Editor" },
            unit: unit
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.patch('/unit/rename/:unitId', authMiddleware, async (req, res) => {
    const { unitId } = req.params;
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    try {
        await Unit.findByIdAndUpdate(unitId, { title: title });
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.patch('/unit/move-up/:subjectName/:unitId', authMiddleware, async (req, res) => {
    const { subjectName, unitId } = req.params;

    try {
        const subject = await Subject.findOne({ name: subjectName });

        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const unitIndex = subject.units.findIndex(unit => unit.toString() === unitId);

        if (unitIndex > 0) {
            const temp = subject.units[unitIndex];
            subject.units[unitIndex] = subject.units[unitIndex - 1];
            subject.units[unitIndex - 1] = temp;

            await subject.save();
            res.redirect('/dashboard');

        } else if (unitIndex === 0) {
            res.redirect('/dashboard');
        } else {
            res.status(404).json({ message: "Unit not found" });
        } 

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete('/unit/delete/:subjectName/:unitId', authMiddleware, async (req, res) => {
    const { subjectName, unitId } = req.params;

    try {
        const subject = await Subject.findOne({ name: subjectName });

        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const isUnitInSubject = subject.units.includes(unitId);

        if (!isUnitInSubject) {
            return res.status(404).json({ message: "Unit not found in this subject" });
        }

        const unit = await Unit.findById(unitId);

        if (!unit) {
            return res.status(404).json({ message: "Unit not found" });
        }

        if (unit.chapters && unit.chapters.length > 0) {
            return res.status(400).json({ message: "Unit cannot be deleted because it contains chapters." });
        }

        await Subject.updateOne({ name: subjectName }, { $pull: { units: unitId } });
        await Unit.findByIdAndDelete(unitId);

        res.redirect('/dashboard')

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Chapter Routing

router.post('/chapter/create/:unitId', authMiddleware, async (req, res) => {
    const { unitId } = req.params;
    const unit = await Unit.findOne({ _id: unitId });

    if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
    }

    try {
        const chapter = await Chapter.create({});
        unit.chapters.push(chapter._id);
        await unit.save();

        res.redirect('/dashboard');

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            res.status(409).json({ message: "Chapter creation conflict" });
        } else {
            res.status(500).json({ message: "Internal server error during chapter creation" });
        }
    }
});

router.get('/chapter/edit/:chapterId', authMiddleware, async (req, res) => {
    const { chapterId } = req.params;
    const chapter = await Chapter.findOne({ _id: chapterId });

    try {
        res.render('admin/edit-chapter', { 
            locals: { title: "Editor" },
            chapter: chapter
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.patch('/chapter/edit/:chapterId', authMiddleware, async (req, res) => {
    const { chapterId } = req.params;
    const { title, body } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    try {
        await Chapter.findByIdAndUpdate(chapterId, {
            title: title,
            body: body
        });

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.patch('/chapter/move-up/:unitId/:chapterId', authMiddleware, async (req, res) => {
    const { unitId, chapterId } = req.params;

    try {
        const unit = await Unit.findOne({ _id: unitId });

        if (!unit) {
            return res.status(404).json({ message: "Unit not found" });
        }

        const chapterIndex = unit.chapters.findIndex(chapter => chapter.toString() === chapterId);

        if (chapterIndex > 0) {
            const temp = unit.chapters[chapterIndex];
            unit.chapters[chapterIndex] = unit.chapters[chapterIndex - 1];
            unit.chapters[chapterIndex - 1] = temp;

            await unit.save();
            res.redirect('/dashboard');

        } else if (chapterIndex === 0) {
            res.redirect('/dashboard');
        } else {
            res.status(404).json({ message: "Chapter not found" });
        } 

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete('/chapter/delete/:unitId/:chapterId', authMiddleware, async (req, res) => {
    const { unitId, chapterId } = req.params;

    try {
        const unit = await Unit.findOne({ _id: unitId });

        if (!unit) {
            return res.status(404).json({ message: "Unit not found" });
        }

        const isChapterInUnit = unit.chapters.includes(chapterId);

        if (!isChapterInUnit) {
            return res.status(404).json({ message: "Chapter not found in this unit" });
        }

        const chapter = await Chapter.findById(chapterId);

        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        await Unit.updateOne({ _id: unitId }, { $pull: { chapters: chapterId } });
        await Chapter.findByIdAndDelete(chapterId);

        res.redirect('/dashboard')

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;