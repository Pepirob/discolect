const express = require("express");
const router = express.Router();
const Review = require("../models/Review.model");
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
  const { image, username } = req.session.activeUser;

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
        image,
        username,
        albumId,
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.post("/:albumId/create", async (req, res, next) => {
  const { content, subheading, rating } = req.body;
  const { albumId } = req.params;

  if (!content || !subheading || !rating) {
    res.render("review/form-create.hbs", {
      errorMesage: "All fields must be filled",
    });
    return;
  }

  try {
    const newReview = await Review.create({
      author: req.session.activeUser._id,
      content,
      subheading,
      rating,
    });
    res.redirect(`/review/${albumId}/${newReview._id}`);
  } catch (error) {
    next(error);
  }
});

router.get("/:albumId/:reviewId", (req, res, next) => {
  const { albumId, reviewId } = req.params;

  spotifyApi
    .getAlbum(albumId)
    .then((response) => {
      const albumBiggestImage = response.body.images[0].url;
      const { name } = response.body;

      Review.findById(reviewId)
        .populate("author")
        .then((response) => {
          const { blogName, image } = response.author;
          const { content, subheading, rating } = response;

          res.render("review/view.hbs", {
            image,
            blogName,
            name,
            rating,
            albumBiggestImage,
            subheading,
            content,
            albumId,
            reviewId,
          });
        });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
