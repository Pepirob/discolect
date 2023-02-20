const express = require("express");
const router = express.Router();
const Review = require("../models/Review.model");
const User = require("../models/User.model");
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
  const { _id } = req.session.activeUser;
  const { errorMessage } = req.query;

  spotifyApi
    .getAlbum(albumId)
    .then((response) => {
      const artistNames = response.body.artists
        .map((artist) => artist.name)
        .join(", ");
      const albumBiggestImage = response.body.images[0].url;
      const { name, label, release_date } = response.body;
      const releaseYear = release_date.slice(0, 4);

      User.findById(_id).then((response) => {
        res.render("review/form-create.hbs", {
          albumBiggestImage,
          artistNames,
          name,
          label,
          releaseYear,
          albumId,
          image: response.image,
          errorMessage,
        });
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
      errorMessage: "All fields must be filled",
    });
    return;
  }

  try {
    const albumData = await spotifyApi.getAlbum(albumId);

    const {
      name,
      images: [bigImage, ...rest],
    } = albumData.body;

    const foundAlbum = await Review.findOne({
      author: req.session.activeUser._id,
      albumName: name,
    });

    if (foundAlbum) {
      const errorMessage = "You cannot review the same album twice";

      res.redirect(`/review/${albumId}/create?errorMessage=${errorMessage}`);

      return;
    }

    const newReview = await Review.create({
      author: req.session.activeUser._id,
      content,
      subheading,
      rating,
      spotifyId: albumId,
      albumName: name,
      albumImg: bigImage.url,
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

router.get("/:albumId/:reviewId/edit", (req, res, next) => {
  const { albumId, reviewId } = req.params;

  spotifyApi
    .getAlbum(albumId)
    .then((response) => {
      const artistNames = response.body.artists
        .map((artist) => artist.name)
        .join(", ");
      const albumBiggestImage = response.body.images[0].url;
      const { name, label, release_date } = response.body;
      const releaseYear = release_date.slice(0, 4);

      Review.findById(reviewId)
        .populate("author")
        .then((response) => {
          const { blogName, image } = response.author;
          const { content, subheading, rating } = response;

          res.render("review/form-edit.hbs", {
            artistNames,
            label,
            releaseYear,
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

router.post("/:albumId/:reviewId/edit", async (req, res, next) => {
  const { albumId, reviewId } = req.params;

  try {
    const newReview = await Review.findByIdAndUpdate(
      reviewId,
      {
        rating: req.body.rating,
        subheading: req.body.subheading,
        content: req.body.content,
      },
      { new: true }
    );
    res.redirect(`/review/${albumId}/${newReview._id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/:albumId/:reviewId/delete", async (req, res, next) => {
  const { reviewId } = req.params;

  try {
    await Review.findByIdAndDelete(reviewId);
    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
