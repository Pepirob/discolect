const express = require("express");
const router = express.Router();
const Review = require("../models/Review.model");
const { updateIsReviewOwnerLocal } = require("../middleware/auth");
const spotifyApi = require("../config/spotifyApi.config");
const { joinProperties } = require("../utils");

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

        res.render("review/artist-search-list.hbs", {
          artistList,
        });
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

router.get("/:albumId/create", async (req, res, next) => {
  const { albumId } = req.params;
  const { _id, username } = req.session.activeUser;
  const { errorMessage } = req.query;

  try {
    const albumResponse = await spotifyApi.getAlbum(albumId);

    const {
      artists,
      name,
      label,
      release_date,
      images: [biggest, ...rest],
    } = albumResponse.body;

    const artistNames = joinProperties(albumResponse.body.artists, "name");
    const albumImage = biggest.url;
    const releaseYear = release_date.slice(0, 4);

    const artistCalls = artists.map((artist) =>
      spotifyApi.getArtist(artist["id"])
    );

    const foundArtists = await Promise.all(
      artistCalls.map(async (call) => {
        const response = await call;
        return response;
      })
    );

    const allGenres = foundArtists
      .map((artistResponse) => artistResponse.body.genres)
      .reduce((acc, artistGenres) => acc.concat(artistGenres), []);

    const genres = [...new Set(allGenres)].join(", ");

    res.render("review/form-create.hbs", {
      albumImage,
      artistNames,
      albumName: name,
      username,
      label,
      genres,
      releaseYear,
      albumId,
      image: response.image,
      errorMessage,
    });
  } catch (error) {
    next(error);
  }
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
      artists,
      name,
      images: [bigImage, ...rest],
    } = albumData.body;

    const artistNames = artists.map((artist) => artist.name).join(", ");

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
      artistNames,
    });

    res.redirect(`/review/${albumId}/${newReview._id}`);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:albumId/:reviewId",
  updateIsReviewOwnerLocal,
  async (req, res, next) => {
    // TODO => DRY to util or middleware
    const { albumId, reviewId } = req.params;

    try {
      const albumResponse = await spotifyApi.getAlbum(albumId);

      const { artists, label, release_date } = albumResponse.body;

      const artistNames = joinProperties(albumResponse.body.artists, "name");
      const releaseYear = release_date.slice(0, 4);

      const artistCalls = artists.map((artist) =>
        spotifyApi.getArtist(artist["id"])
      );

      const foundArtists = await Promise.all(
        artistCalls.map(async (call) => {
          const response = await call;
          return response;
        })
      );

      const allGenres = foundArtists
        .map((artistResponse) => artistResponse.body.genres)
        .reduce((acc, artistGenres) => acc.concat(artistGenres), []);

      const genres = [...new Set(allGenres)].join(", ");

      const reviewResponse = await Review.findById(reviewId).populate("author");

      const { content, subheading, rating, albumImg, albumName } =
        reviewResponse;

      const { blogName, image, username, _id } = reviewResponse.author;

      res.render("review/view.hbs", {
        artistNames,
        genres,
        label,
        releaseYear,
        authorImage: image,
        authorName: username,
        authorId: _id,
        blogName,
        rating,
        albumImg,
        subheading,
        albumId,
        albumName,
        reviewId,
        content,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:albumId/:reviewId/edit", (req, res, next) => {
  const { albumId, reviewId } = req.params;

  spotifyApi
    .getAlbum(albumId)
    .then((response) => {
      const artistNames = joinProperties(response.body.artists, "name");
      const albumImage = response.body.images[0].url;
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
            albumImage,
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

router.get("/search", async (req, res, next) => {
  const { reviewSearch } = req.query;
  const { page } = req.query;
  const getUserId = () => {
    if (req.session.activeUser) {
      return req.session.activeUser._id;
    }
  };
  const nextPage = parseInt(page) + 1;

  const limit = 10;

  const searchRegExp = new RegExp(`${reviewSearch}`, "i");

  if (reviewSearch.length > 2) {
    try {
      const foundReviews = await Review.find({
        $or: [
          { albumName: { $regex: searchRegExp } },
          { artistNames: { $regex: searchRegExp } },
        ],
      })
        .sort({ updatedAt: -1 })
        .skip((parseInt(page) - 1) * limit)
        .limit(10)
        .select({
          author: 1,
          albumImg: 1,
          albumName: 1,
          artistNames: 1,
          spotifyId: 1,
        })
        .populate("author", "username");

      res.render("review/review-search-list.hbs", {
        foundReviews,
        userActiveId: getUserId(),
        nextPage,
        reviewSearch,
      });
    } catch (error) {
      next(error);
    }
  } else {
    res.render("review/review-search-list.hbs", {
      userActiveId: getUserId(),
    });
  }
});

module.exports = router;
