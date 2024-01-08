var express = require("express");

function generateToken(user) {
    return jwt.sign({ data: user }, tokenSecret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
  }
  