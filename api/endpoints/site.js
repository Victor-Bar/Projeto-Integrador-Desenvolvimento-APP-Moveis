const express = require('express');
const adminPage = require('../site/admin');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/admin'));
router.get('/admin', (req, res) => res.type('html').send(adminPage()));

module.exports = router;
