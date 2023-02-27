# DiscoLect

## Project Tech Description

A practice on MVC patterns built over Express JS, MongoDB, Mongoose and HBS stack.

This project is generated with [Ironlauncher](https://www.npmjs.com/package/ironlauncher)

## Product Description

DiscoLect is platform for amateur music album reiviewing. Users can easily start a blog anc quickly do a review with prefiled album detail sheets from Spotify API. After creating a reviewe, albums are stored as references in DB on the review model; reviews can be browsed by using a search engine based on artists and their albums, so search results allow visiting the reviews and the author's profiles.

![Logo Talent Match](Discolect_Logo_All.png)

## Getting Started

### Install dependencies:

```bash
npm install
# or
yarn add
```

### Set environment:

This project is using Cloudinary as image storage, Spotify API as album search engine, and Mongo DB for local/remote data storing. Place your required secrets on:

```bash
/dev/discolect/.env
```

### Seeding

The reviews seeding file (seeds/reviews_seeds.json) is manually exported on MndoDB Compass. Create 2 or more initial users. Care about bindind to some of your local DB use by replacing author.$oid with the matching MongoDB \_id

### Run

After placing your local MONGO URI, run on dev mode:

```bash
npm run dev
# or
yarn rev
```

## MVP FEATURES

- **SIGNUP** - A soft registering flow which adds defaults to user image and Blog Name.
- **REVIEW** - Search your favourite albums from an extense Spotify DataBase through it’s API and easily start a review.
- **SEARCH AND BROWSE** - Browse others posts by album/artist based search engine, and/or visit other any author (user) profile page.
- **USE YOUR MOBILE DEVICE** - Layout guarantees a mobile first experience

## Upcoming Features

- REVIEW ROUTE SIMPLIFICATION
- SPLIT ROUTES FROM ALBUM AND ARTIST SEARCH ON REVIEW CREATION
- HOMEPAGE LATEST ENTRIES CAROUSEL
- PAGINATION ON REVIEW SEARCH RESULTS
- FOLLOW REVIEW AUTHORS (OTHER USERS)
- COMMENT ON REVIEWS
- USER PRESENCE INDICATOR
- MAILER: WELLCOME USER, GOODBYE USER
- TEXT EDITOR PACKAGE (FORMAT REVIEW CONTENT)
- PASSWORD CHANGE
- RELATED CONTENT LINKS ON REVIEW'S FOOTER

## ROUTES:

- GET /

  - renders the homepage wirth latest 3 review entries

- GET /auth/signup
  - redirects to / if user logged in
  - renders the signup form
- POST /auth/signup
  - redirects to / if user logged in

- GET /auth/login
  - redirects to / if user logged in
  - renders the login form
- POST /auth/login
  - redirects to / if user logged in

- POST /auth/logout
  - redirects /auth/login user logged in

- GET /review/search-artist
  - renders the artist list to choose album
- GET /review/:artistID/album-choose
  - renders the album to review list

- GET /review/:albumID/create
  - renders the review create form
- POST /review/:albumID/create
  - Creates a review document in our DB, redirects to it's view

- GET /review/:albumID/create
  - renders the review create form 

- GET /review/search
  - renders the review search results, based on artist or album name

- GET /review/:albumID/:reviewId/edit
  - renders the review edit form
- POST /review/:albumID/:reviewId/edit
  - updates the review

- POST /review/:albumID/:reviewId/delete
  - destroy review

- GET /profile/:userID
  - renders the user profile

- GET /profile/:userID/edit
  - renders the user profile edition form
- POST /profile/:userID/edit

  - updates the user profile

- POST /profile/:userID/delete
  - destroy user profile


## Links

### Git

The url to your repository and to your deployed project

[Repository Link](https://github.com/Pepirob/discolect)

[Deploy Link](https://discolect.cyclic.app/)

### Slides

The url to your presentation slides

[Slides Link](https://docs.google.com/presentation/d/1W5_pNIZ5BnTcpOcTVmFRKc0Hpfymhop6WX7ekDY6KNI/edit#slide=id.p)
