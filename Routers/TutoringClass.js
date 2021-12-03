const TutoringClass = require('../Models/TutoringClass.js');
const User = require('../Models/User.js');
const { checkLoggedIn, getLoggedInUser } = require('../helpers.js');

const { Router } = require('express');
const router = Router();

router.get('/tutoring-classes', async (req, res) => {
    let subject = req.query.subject;
    let filter = subject ? { subject } : {};
    let classes = await TutoringClass.find(filter, "-_id -__v");
    res.send(classes);
});

router.get('/tutoring-classes/:id', async (req, res) => {
    let { id } = req.params;
    TutoringClass.findOne({ id }, "-_id -__v")
    .catch(() => res.sendStatus(400))
    .then(tclass => {
        if(!tclass) res.sendStatus(404);
        else res.send(tclass);
    });
});

router.post('/tutoring-classes', async (req, res) => {
    let userId = getLoggedInUser(req);
    if(!userId) { res.status(401).send("Utilizatorul nu este logat."); return; } 

    try { 
        var user = await User.findOne({ id: userId }); 
        if(!user) throw Error();
    } catch { 
        res.status(403);
        res.send("Tokenul de autentificare este gresit (posibil falsificat)!");
        return; 
    }
    if(user.role != 'teacher') { 
        res.status(403);
        res.send("Utilizatorul logat nu este profesor");
        return; 
    }

    let { description, subject } = req.body;
    let tclass = new TutoringClass({ teacher_id: userId, description, subject });

    try { await tclass.save(); }
    catch(err) { res.status(400).send(err.message); return; }

    user.tutoring_classes.push(tclass.id);
    user.save().then(() => res.sendStatus(200));
});

router.patch('/tutoring-classes/:id', async (req, res) => {
    let { id } = req.params;
    let { description } = req.body;

    try {
        var tclass = await TutoringClass.findOne({ id });
        if(!tclass) res.sendStatus(404);
    } catch {
        res.status(400).send("Parametrul id trebuie sa fie numeric");
        return;
    }

    let log = checkLoggedIn(req, tclass.teacher_id);
    if(log[0] != 200) { res.status(log[0]).send(log[1]); return; }

    TutoringClass.updateOne({ id }, { description }, { upsert: false, runValidators: true }, 
    (err, writeOpResults) => {
        if(err) res.sendStatus(400);
        else if(writeOpResults.matchedCount == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

router.delete('/tutoring-classes/:id', async (req, res) => {
    let { id } = req.params;
    
    try {
        var tclass = await TutoringClass.findOne({ id });
        if(!tclass) res.sendStatus(404);
    } catch {
        res.status(400).send("Parametrul id trebuie sa fie numeric");
        return;
    }

    let log = checkLoggedIn(req, tclass.teacher_id);
    if(log[0] != 200) { res.status(log[0]).send(log[1]); return; }

    let teacher = await User.findOne({ id: tclass.teacher_id });
    let index = teacher.tutoring_classes.indexOf(id);
    if(index > -1) teacher.tutoring_classes.splice(index, 1);
    await teacher.save();

    let students = await User.find({ id: { $in: tclass.users } });
    for(let student of students) {
        let index = student.tutoring_classes.indexOf(id);
        if(index > -1) student.tutoring_classes.splice(index, 1);
        await student.save();
    }

    TutoringClass.deleteOne({ id }, (_err, deleteOpResults) => {
        if(deleteOpResults.deletedCount == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

router.post('/tutoring-classes/:id/enroll', async (req, res) => {
    let { id: tclassId } = req.params;

    let userId = getLoggedInUser(req);
    if(!userId) { res.status(401).send("Utilizatorul nu este logat"); return; }

    try { 
        var user = await User.findOne({ id: userId }); 
        console.log(userId);
        if(!user) {
            res.status(403).send("Utilizatorul logat nu exista");
            return;
        }
    } catch { 
        res.status(403);
        res.send("Parametrul id trebuie sa fie numeric");
        return; 
    }
    if(user.role != 'student') { 
        res.status(403);
        res.send("Utilizatorul logat nu este student.");
        return; 
    }

    try { 
        var tclass = await TutoringClass.findOne({ id: tclassId });
        if(!tclass) throw Error();
    } catch { res.sendStatus(404); return; }

    if(tclass.users.indexOf(userId) > -1) {
        res.status(400);
        res.send("Utilizatorul este deja inregistrat la acest curs");
        return;
    }
    tclass.users.push(userId);
    user.tutoring_classes.push(tclassId);
    await tclass.save(); 
    await user.save();
    res.sendStatus(200);
});

module.exports = router;