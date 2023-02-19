const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

// TODO EXTRACT TO SERVICES

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => {
    spotifyApi.setAccessToken(data.body["access_token"]);
    console;
  })
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

router.get("/search-artist", (req, res, next) => {
  const fallbackImg = "https://cdn-icons-png.flaticon.com/512/33/33724.png";

  const { artist } = req.query;

  if (artist) {
    spotifyApi
      .searchArtists(artist, { limit: 10 })
      .then((response) => {
        const { items } = response.body.artists;

        const artistList = items.map(({ name, id, images }) => {
          return {
            name,
            id,
            thumbnail: images[2],
            fallbackImg,
          };
        });

        res.render("review/search-artist.hbs", { artistList });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    res.render("review/search-artist.hbs");
  }
});

module.exports = router;
