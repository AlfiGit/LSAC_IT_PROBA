const express = require('express');
const app = express();

const { connection } = require('./mongoose-connection');

const contactRequestsRouter = require('./Routers/ContactRequest.js');
const usersRouter = require('./Routers/User.js');
const reviewsRouter = require('./Routers/Review.js');
const tutoringClassesRouter = require('./Routers/TutoringClass.js');

const PORT = 8080;

app.use(express.json());
app.use(contactRequestsRouter);
app.use(usersRouter);
app.use(reviewsRouter);
app.use(tutoringClassesRouter);

app.all('*', (_req, res) => res.status(404).send("Ruta nu exista"));

connection.then(live);

function live() {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    })
}