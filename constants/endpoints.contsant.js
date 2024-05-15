const { refreshToken } = require("../controllers/user.controller");

exports.Endpoints = {
    users: '/users',
    institutes: '/institutes',
    login: '/login',
    refreshToken: '/refreshToken'
};
