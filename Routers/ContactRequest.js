const ContactRequest = require('../Models/ContactRequest.js');

const { Router } = require('express');
const router = Router();

router.get('/contact-requests', async (req, res) => {
    let filter = JSON.parse(req.query.filterBy ?? null) || {};
    let sortBy = req.query.sortBy ?? 'id', order = req.query.order ?? 'ASC';
    if(order != 'ASC' && order != 'DESC') {
        res.status(400);
        res.send('Parametrul order poate avea doar valorile "ASC" sau "DESC"');
        return;
    }
    let sortObj = { [sortBy]: order.toLowerCase() };
    let crequests = await ContactRequest.find(filter, "-_id -__v", {sort: sortObj});
    res.send(crequests);
});

router.get('/contact-requests/:id', async (req, res) => {
    let { id } = req.params;
    ContactRequest.findOne({ id }, '-_id -__v')
    .catch(() => res.status(400).send("Parametrul id trebuie sa fie un numar"))
    .then(creq => {
        if(!creq) res.sendStatus(404);
        else res.send(creq);
    });
});

router.post('/contact-requests', async (req, res) => {
    let { name, message, email } = req.body;
    let crequest = new ContactRequest({ name, message, email });
    crequest.save().then(() => res.sendStatus(200))
    .catch(err => res.status(400).send(err.message));
});

router.patch('/contact-requests/:id', async (req, res) => {
    let { id } = req.params;
    let { is_resolved } = req.body;
    ContactRequest.updateOne({ id }, { is_resolved }, { upsert: false, runValidators: true }, 
    (err, writeOpResults) => {
        if(err) res.status(400).send(err.message);
        else if(writeOpResults.matchedCount == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

router.delete('/contact-requests/:id', async (req, res) => {
    let { id } = req.params;
    ContactRequest.deleteOne({ id }, (err, deleteOpResults) => {
        if(err) res.status(400).send(err.message);
        else if(deleteOpResults.deletedCount == 0) res.sendStatus(404);
        else res.sendStatus(200);
    });
});

module.exports = router;