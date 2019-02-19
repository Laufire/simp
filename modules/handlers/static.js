const express = require('express');

module.exports = (Site) => express.static(Site.dir);
