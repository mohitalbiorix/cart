const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

const { check, body } = require('express-validator');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .normalizeEmail(),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters.'
        ).isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword').trim().custom((value, { req }) => {
            if (value != req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
    ],
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;