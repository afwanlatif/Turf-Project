const { routerPath, baseEndpoint } = require("../config/router.config");
const { RequestMethod } = require("../constants");
const { message } = require('../constants/messages.constant');
const { getRoutesArray } = require('../helpers/routes.helpers');
const path = require("path");

module.exports = (app, express) => {
    let router = express.Router();

    const dirPath = path.resolve(routerPath);
    const routes = getRoutesArray(dirPath);

    routes.forEach((route) => {
        if (route.method === RequestMethod.put) {
            router.put(route.endpoint, ...route.handlers);
        } else if (route.method === RequestMethod.get) {
            router.get(route.endpoint, ...route.handlers);
        } else if (route.method === RequestMethod.delete) {
            router.delete(route.endpoint, ...route.handlers);
        } else if (route.method === RequestMethod.post) {
            router.post(route.endpoint, ...route.handlers);
        } else {
            console.error(message.requestMethodError);
        }
    });

    app.use(baseEndpoint, router);
};
