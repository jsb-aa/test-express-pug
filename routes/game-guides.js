const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const csrf = require("csurf");
const { csrfProtection, asyncHandler } = require("../utils");
const { loginUser, logoutUser, restoreUser, requireAuth } = require("../auth");
const db = require("../db/models");
const { sequelize } = require("../db/models");
const { Op } = require("sequelize");
const {findAverageRating, makeRatingObj, makeRatingArrsForAllReviews} = require('../creation')

const router = express.Router();

// List Page

// Detail Page
router.get(
  "/:id(\\d+)",
  asyncHandler(async (req, res) => {
    const gameGuideId = parseInt(req.params.id, 10);
    const gameGuide = await db.GameGuide.findByPk(gameGuideId);
    const guides = await db.GameGuide.findAll();

    const reviews = await db.Review.findAll({
      where: {
        gameGuideId
      },
      include: [{
        model: db.User
      }]
    })

    let avg = findAverageRating(reviews)
    let avgArr = makeRatingObj(avg)
    let updatedReviews = makeRatingArrsForAllReviews(reviews)

    let filteredGuides = guides.filter((guide) => guide.id !== gameGuideId);

    let statusObj = {
      1: "Want to Play",
      2: "Currently Playing",
      3: "Played",
    };

    if (req.session.auth) {
      const { userId } = req.session.auth;

      let userReview = false;

      let userReviewFind = reviews.filter((review) => review.userId === userId)
      if (userReviewFind.length) {
        userReview = userReviewFind
      }

      const guideStatusCheck = await db.StatusShelf.findAll({
        where: {
          gameGuideId,
          userId,
        },
      });

      let activeCustomShelves = await db.CustomShelf.findAll({
        where: {
          userId,
          gameGuideId,
        },
        attributes: [[sequelize.fn("distinct", sequelize.col("name")), "name"]],
        raw: true,
      });

      // list of active shelf names to exclude from inactive shelves
      let activeShelfNames = activeCustomShelves.map((shelf) => shelf.name);

      let inactiveCustomShelves = await db.CustomShelf.findAll({
        where: {
          userId,
          gameGuideId: {
            [Op.or]: {
              [Op.eq]: null,
              [Op.not]: gameGuideId,
            },
          },
          name: {
            [Op.not]: activeShelfNames,
          },
        },
        attributes: [[sequelize.fn("distinct", sequelize.col("name")), "name"]],
        raw: true,
      });

      let currentStatus;
      if (guideStatusCheck.length) {
        currentStatus = statusObj[guideStatusCheck[0].statusId];
      }

      res.render("game-guides-id", {
        gameGuide,
        userId,
        filteredGuides,
        currentStatus,
        inactiveCustomShelves,
        activeCustomShelves,
        updatedReviews,
        userReview,
        avgArr
      });
    } else {
      res.render("game-guides-id", {
        gameGuide,
        filteredGuides,
        updatedReviews,
        avgArr
      });
    }
  })
);

module.exports = router;
