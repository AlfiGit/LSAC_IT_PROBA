const Review = require('../Models/Review.js')
const User = require('../Models/User.js');
const { checkLoggedIn, getLoggedInUser } = require('../helpers.js');

const { Router } = require('express');
const { TokenExpiredError } = require('jsonwebtoken');
const router = Router();

router.get('/reviews', async (req, res) => {
    let revs = await Review.find({}, "-_id -__v");
    res.status(200).send(revs);
});

router.get('/reviews/:id', async (req, res) => {
    let { id } = req.params;
    Review.findOne({ id }, "-_id -__v")
    .then(rev => {
        if(!rev) res.sendStatus(404);
        else res.status(200).send(rev);
    })
    .catch(() => res.status(400).send("Parametrul id trebuie sa fie numeric"))
});

router.post('/reviews', async (req, res) => {
    try { var user_id = getLoggedInUser(req); }
    catch(err) { 
        if(err instanceof TokenExpiredError) 
        res.status(403).send("Autentificarea a expirat");
        return;
    }
    if(!user_id) { res.status(401).send("Utilizatorul nu este logat"); return; }

    try { 
        var user = await User.findOne({ id: user_id });
        if(!user) throw Error();
    } catch { 
        res.status(403);
        res.send("Tokenul de autorizare este gresit (probabil falsificat)!");
        return; 
    }

    let { message } = req.body;
    let rev = new Review({ message, user_id });    

    rev.save()
    .then(() => { user.reviews.push(rev.id); user.save(); })
    .then(() => res.sendStatus(200))
    .catch(err => res.status(400).send(err.message));
});

router.patch('/reviews/:id', async (req, res) => {
    let { id } = req.params;
    let { message } = req.body;

    try {
        var rev = await Review.findOne({ id });
        if(!rev) res.sendStatus(404);
    } catch {
        res.status(400).send("Parametrul id trebuie sa fie numeric");
        return;
    }

    let log = checkLoggedIn(req, rev.user_id);
    if(log[0] != 200) { res.status(log[0]).send(log[1]); return; }

    Review.updateOne({ id }, { message }, { upsert: false, runValidators: true }, 
    (err, writeOpResults) => {
        if(err) res.status(400).send(err.message);
        else if(writeOpResults.matchedCount == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

router.delete('/reviews/:id', async (req, res) => {
    let { id } = req.params;
    
    try {
        var rev = await Review.findOne({ id });
        if(!rev) { res.sendStatus(404); return; }
    } catch {
        res.status(400).send("Parametrul id trebuie sa fie numeric");
        return;
    }

    let log = checkLoggedIn(req, rev.user_id);
    if(log[0] != 200) { res.status(log[0]).send(log[1]); return; }

    Review.deleteOne({ id }, (err, deleteOpResults) => {
        if(err) res.status(400).send(err.message);
        else if(deleteOpResults.deletedCount == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

module.exports = router;

