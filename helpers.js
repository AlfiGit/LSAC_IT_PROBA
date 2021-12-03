const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretString = require('./secret-string.js');

/** @throws TokenExpiredError */
const getLoggedInUser = req => {
    let authHeader = req.header('Authorization');
    if(!authHeader || !authHeader.startsWith('Bearer ')) return 0;
    let token = authHeader.substring(7);
    return jwt.verify(token, secretString).id;
}

const checkLoggedIn = (req, id) => {
    let userid = getLoggedInUser(req) 
    if(!userid) return [401, "Headerul `Authentication: Bearer ` nu este bine configurat."];
    else if(userid != id) return [403, "Utilizatorul logat nu are dreptul de a face aceasta actiune."];
    else return [200, "OK"];
}

async function encryptPassword(obj) {
    let salt = await bcrypt.genSalt();
    obj.password = await bcrypt.hash(obj.password, salt);
    obj.salt = salt;
}

module.exports = { getLoggedInUser, checkLoggedIn, encryptPassword }