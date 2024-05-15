const { RequestMethod } = require('../constants/index');
const { Endpoints } = require('../constants/endpoints.contsant');
const controller = require('../controllers/institute.controler');
const { verifyToken } = require('../middlewares/auth.middlewares');

exports.routes = [
    {
        method: RequestMethod.put,
        endpoint: Endpoints.institutes,
        handlers: [verifyToken, controller.addInstitute]
    },
    {
        method: RequestMethod.get,
        endpoint: Endpoints.institutes,
        handlers: [verifyToken, controller.getInstitute]
    },
    {
        method: RequestMethod.get,
        endpoint: Endpoints.institutes + '/:id',
        handlers: [verifyToken, controller.singleInstitute]
    },
    {
        method: RequestMethod.delete,
        endpoint: Endpoints.institutes + '/:id',
        handlers: [verifyToken, controller.deleteInstitute]
    },
    {
        method: RequestMethod.post,
        endpoint: Endpoints.institutes,
        handlers: [verifyToken, controller.updateInstitute]
    },
]