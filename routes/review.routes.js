const express = require("express");
const router = express.Router();
const spotifyApi = require("../config/spotifyApi.config");

// TODO EXTRACT SPOTIFY FETCHING TO SERVICES FILE

router.get("/artist-search", (req, res, next) => {
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

        res.render("review/artist-search-list.hbs", { artistList });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    res.render("review/artist-search-list.hbs");
  }
});

router.get("/:artistId/album-choose", (req, res, next) => {
  const { artistId } = req.params;

  Promise.all([
    spotifyApi.getArtist(artistId),
    spotifyApi.getArtistAlbums(artistId, { limit: 50 }),
  ])
    .then((response) => {
      const [artist, albums] = response;
      const albumList = albums.body.items.map(({ name, id, images }) => {
        return {
          name,
          id,
          thumbnail: images[2],
        };
      });

      res.render("review/album-list.hbs", {
        artistName: artist.body.name,
        albumList,
      });
    })
    .catch((error) => next(error));
});

router.get("/:albumId/create", (req, res, next) => {
  const { albumId } = req.params;

  spotifyApi
    .getAlbum(albumId)
    .then((response) => {
      const artistNames = response.body.artists
        .map((artist) => artist.name)
        .join(", ");
      const albumBiggestImage = response.body.images[0].url;
      const { name, label, release_date } = response.body;
      const releaseYear = release_date.slice(0, 4);

      res.render("review/form-create.hbs", {
        albumBiggestImage,
        artistNames,
        name,
        label,
        releaseYear,
      });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
