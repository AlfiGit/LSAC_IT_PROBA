## Proba IT LSAC - Backend

### Cum se ruleaza
- Pentru testarea proiectului trebuie sa fie instalate: Node.js, npm, MongoDB. Trebuie pornit serverul Mongo pe `localhost:27017` (din MongoDBCompass). Vezi mai jos cum se poate face setupul pentru testarea pe un alt URL sau port.
- Se initializeaza proiectul cu `npm install` pentru instalarea tuturor dependintelor. Pentru o experienta de rulare (putin) mai buna, poate fi instalat si nodemon prin comanda `npm install --dev` in locul comenzii de mai sus.
- Daca nodemon a fost instalat, proiectul e gata de rulat cu `npm start`. Altfel, rularea se va face in mod normal cu `node server.js`.

#### Testarea pe un alt url sau port inafara de `localhost:27017` (intr-un Cluster)
- Daca se face testarea pe un alt url sau port, pot fi setate variabilele de mediu `URL` respectiv `PORT` in `./nodemon.json`, in `"env"` pentru rularea proiectului cu `npm start`;
- Pentru rularea proiectului cu `node server.js` se poate folosi in schimb comanda `URL=... PORT=... node server.js`

#### TL;DR;
Necesare: npm, Node.js, MongoDB
Serverul MongoDB pornit pe localhost:27017
- `git clone https://github.com/AlfiGit/LSAC_IT_PROBA`

Dupa care
- `npm install --dev`
- `npm start`

Sau
- `npm install`
- `node server.js`

## Taskuri implementate
REST API cu schema si model pentru entitatile bazei de date. Campurile id sunt numerice. Baza de date este MongoDB, iar comunicarea intre server si db se face prin mongoose. Relatiile dintre entitati sunt reprezentate prin arrays ce retin id-urile intrarilor. Autentificarea utilizatorului se face prin ruta `POST /auth/login` care returneaza un token cu o durata de viata de 3 zile ce poate fi trimis inapoi la server prin headerul `Authentication: Bearer <token_de_autentificare>` pentru verificarea logarii.

- ContactRequest:
	- schema si model pentru db, cu validare pentru email prin 3rd party validator library.
	- toate rutele cerute:
	`GET /contact-requests`, `GET /contact-requests/{id}`, `POST /contact-requests` `PATCH /contact-requests/{id}`, `DELETE /contact-requests/{id}`
	- bonusuri: sistemul de sortare `GET /contact-requests?sortBy=<field>&order=<ASC|DESC>`, sistemul de filtrare `GET /contact-requests?filterBy=<json>`
- User:
	- schema si model pentru db cu validare email prin RegEx, 
	- toate rutele cerute
	- bonusuri: verificare minim 8 caractere pentru parola, parola criptata prin bcrypt cu salt, verificare ca requesturile de tip `PATCH` si `DELETE` nu pot modifica date decat pentru userul logat.
	
- Review:
	- schema si model pentru db
	- relatia dintre `User` si `Review` reprezentata prin array-ul `reviews` din `User`
	- toate rutele cerute
	- bonusuri: review-uri create doar de utilizatorul logat, verificare ca requesturile de tip `PATCH` si `DELETE` nu pot modifica date decat pentru userul logat.
- TutoringClass:
	- schema si model pentru db
	- toate rutele cerute
	- bonusuri: verificare ca requesturile de tip `PATCH` si `DELETE` nu pot modifica date decat pentru userul logat, sistem de filtare prin query parametrul `subject`.
- Enrollment:
	- relatia dintre `User` si `TutoringClass` reprezentata prin array-urile `users` din `TutoringClass` si `tutoring_classes` din `User`
	- ruta `POST /tutoring-classes/{id}/enroll`

## Probleme intampinate
- Relatiile dintre entitati fiind implementate prin array-uri, a fost nevoie de pasi suplimentari ai anumitor rute (de exemplu, cand un student isi sterge contul, trebuie eliminat din baza de date din toate cursurile la care era inregistrat)
- Multe corner-cases de care ar trebui tinut cont (the error handling hell). De exemplu, tokeni de autentificare invalizi: falsificati, utilizatorul logat este sters etc. Toate acestea trebuie verificate **inainte** de a face schimbari in baza de date.
- Operatii esuate cu baza de date (validari picate) sau cereri eronate - trecerea flow-ului programului inafara handler-ului rutei pentru a evita schimbari subsecvente ale bazei de date.
- Code segregation, referinte circulare ⇒ a trebuit sa refactorizez tot codul de doua ori.