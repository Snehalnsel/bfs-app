var express = require("express");

function generateToken(user) {
    return jwt.sign({ data: user }, tokenSecret, { expiresIn: "24h" });
  }
  