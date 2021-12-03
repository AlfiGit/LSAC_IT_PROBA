const User = require('../Models/User.js');
const TutoringClass = require('../Models/TutoringClass.js');

const { Router } = require('express');
const router = Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretString = require('../secret-string.js');
const { checkLoggedIn } = require('../helpers.js');

const createToken = id => {
    let maxAge = 3 * 24 * 3600; // 3 days in SECONDS 
    return jwt.sign({ id }, secretString, { expiresIn: maxAge });
}

router.get('/users', async (_req, res) => {
    let users = await User.find({}, "-_id -__v -password -salt");
    res.send(users);
});

router.get('/users/:id', async (req, res) => {
    let { id } = req.params;
    User.findOne({ id }, "-_id -__v -password -salt")
        .catch(() => res.status(404).send("Parametrul id trebuie sa fie numeric"))
        .then(user => {
            if(!user) res.sendStatus(404);
            else res.send(user);
        });
});

router.post('/auth/register', async (req, res) => {
    let { email, lastname, firstname, password, role, confirmation_password } = req.body;
    if(confirmation_password != password) {
        res.status(400);
        if(!confirmation_password) res.send("Campul confirmation_password nu exista");
        else res.send("Parolele nu se potrivesc")
        return;
    }
    let user = new User({ email, lastname, firstname, password, role });
    user.save().then(() => res.sendStatus(200))
    .catch(err => res.status(400).send(err.message));
});

router.post('/auth/login', (req, res) => {
    let { email, password } = req.body;
    if(!password) { res.status(400).send("Campul password lipseste"); return; }
    
    User.findOne({ email })
    .then(user => {
        console.log(user);
        if(!user) return Promise.reject();
        return Promise.all([bcrypt.hash(password, user.salt), user]);
    })
    .then(([hashedPassword, user]) => {
        if(hashedPassword != user.password) res.status(401).send('parola gresita');
        else res.status(200).send(createToken(user.id));
    })
    .catch(() => res.status(401).send('email gresit'));
});

router.patch('/users/:id', async (req, res) => {
    let { id } = req.params;
    let { confirmation_password, password } = req.body;

    let log = checkLoggedIn(req, id);
    if(log[0] != 200) { res.status(log[0]).send(log[1]); return; }

    if('reviews' in req.body) delete req.body.reviews;
    if('salt' in req.body) delete req.body.salt;
    if('tutoring_classes' in req.body) delete req.body.tutoring_classes;

    if(confirmation_password != password) { 
        res.status(400).send('parolele nu se potrivesc'); 
        return; 
    }
    if(password) await encryptPassword(req.body);

    User.updateOne({ id }, req.body, { upsert: false, runValidators: true }, 
    (err, writeOpResults) => {
        if(err) res.status(400).send(err.message);
        else if(writeOpResults.matchedCounts == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

router.delete('/users/:id', async (req, res) => {
    let { id } = req.params;

    let log = checkLoggedIn(req, id);
    if(log[0] != 200) { res.status(log[0]).send(log[1]); return; }

    let tclasses = await TutoringClass.find({ users: id });
    for(let tclass of tclasses) {
        let index = tclass.users.indexOf(id);
        if(index > -1) tclass.users.splice(index, 1);
        await tclass.save();
    }

    User.deleteOne({ id }, (err, deleteOpResults) => {
        if(err) res.status(400).send(err.message);
        else if(deleteOpResults.deletedCount == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

module.exports = router;