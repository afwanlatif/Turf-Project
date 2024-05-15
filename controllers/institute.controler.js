const institutedb = require('../database/institute.db');
const { status, systemUser } = require("../constants");
const { message } = require('../constants/messages.constant');
const { updateFilters, FiltersMeta } = require('../helpers/filter.helper');
const { getSelectString, SelectMeta } = require("../helpers/dbselect.helper");
const { responseStructure: rs } = require("../helpers/response.helper");
const { getCleanObject, getPayload } = require('../helpers/index.helper');
const {
    isRequestBodyForAddRecordValid,
    isRequestBodyForUpdateRecordValid,
    getObjectWithValidFields
} = require("../helpers/validation.helper");
const { InstituteSchema } = require('../models/institute');
const { response } = require('express');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   security:
 *     - bearerAuth: [] 
 *   schemas:
 *     Institute: 
 *       type: object
 *       required: 
 *         - location
 *         - description
 *       properties: 
 *         _id:
 *           type: string
 *           description: The auto-generated id of the institute
 *         location:
 *           type: string
 *           description: Location name
 *         description:
 *           type: string
 *           description: description of the description
 *       example: 
 *             _id: ua2uy6sd3ty6ua6sd675a76s5
 *             location: pune
 *             description: parshuramers institute
 *   responses:
 *    UnauthorizedError:
 *     description: Access token is missing or invalid
 *     schema:
 *        status: number
 *        message: string
 *     example:
 *        status: 401
 *        message: Unauthorized access.
 */

/**
 * @swagger
 * tags:
 *   name: Institute
 *   description: The institute managing API
 */

/**
 * @swagger
 * /institutes:
 *   put:
 *     summary: Adds institute  to the portal
 *     tags: [Institute]
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       description: Required data to add a institute
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Institute' 
 *           example: 
 *             adminId: klwvhiuwuoivuiqgvuoovu
 *             location: pune
 *             description: parshuramers institute
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError' 
 *       201:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example: 
 *               status: 201
 *               message: Institute added successfully
 */

// add institute

exports.addInstitute = async (req, res) => {
    const jsonData = req.body;
    const creator = getPayload(req)
    const { isValid, missingFields, validFields } =
        isRequestBodyForAddRecordValid(jsonData, InstituteSchema.schema);
    if (!isValid) {
        return res
            .status(status.badRequest)
            .send(status.badRequest, message.missingFields, { missingFields });
    }
    const validObject = getObjectWithValidFields(jsonData, validFields);
    institutedb
        .addInstitute(validObject, creator.email)
        .then((response) => {
            res
                .status(status.createdSuccess)
                .send(rs(status.createdSuccess, message.addInstituteSuccess, response))
        }).catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.addInstituteError, error));
        })


}


/**
 * @swagger
 * /institutes:
 *   get:
 *     summary: get institute  to the portal
 *     tags: [Institute]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError' 
 *       201:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example: 
 *               status: 200
 *               message:  Institute data fetched successfully
 */

// get institute

exports.getInstitute = async (req, res) => {
    let queryParams = req.query;
    updateFilters(queryParams, FiltersMeta.institute);
    const selectString = getSelectString(SelectMeta.default);
    institutedb
        .getInstitute(queryParams, { select: selectString })
        .then((institute) => {
            res
                .status(status.success)
                .send(rs(status.success, message.getAllInstitute, institute));
        }).catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};

/**
 * @swagger
 * /institutes/{instituteId}:
 *   get:
 *     summary: get single institute data to the portal
 *     parameters:
 *        - in: path
 *          name: instituteId
 *          description: The ID of the institute to fetch
 *          required: true
 *          schema:
 *            type: string
 *            example: hjvqfhvbhugvfiuqebgaiug
 *     tags: [Institute]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError' 
 *       201:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example: 
 *               status: 200
 *               message:  Institute data fetched successfully
 */

// singleInstitute

exports.singleInstitute = async (req, res) => {
    let instituteId = req.params.id;
    if (!instituteId) {
        return res
            .status(status.badRequest)
            .send(rs(status.badRequest, message.noUniqueId));
    }
    const selectString = getSelectString(SelectMeta.default);
    institutedb
        .singleInstitute({ _id: instituteId }, { select: selectString })
        .then((institute) => {
            if (institute) {
                res
                    .status(status.success)
                    .send(rs(status.success, message.singleInstitute, institute));
            } else {
                res
                    .status(status.success)
                    .send(rs(status.noRecords, message.noRecords));
            }
        }).catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};

/**
 * @swagger
 * /institutes/{instituteId}:
 *   delete:
 *     summary: deletee institute data from the portal
 *     parameters:
 *        - in: path
 *          name: instituteId
 *          description: The ID of the institute to delete
 *          required: true
 *          schema:
 *            type: string
 *            example: hjvqfhvbhugvfiuqebgaiug
 *     tags: [Institute]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError' 
 *       201:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example: 
 *               status: 200
 *               message:  Institute data delete successfully
 */

// deleteInstitute

exports.deleteInstitute = async (req, res) => {
    let instituteId = req.params.id;
    if (!instituteId) {
        return res
            .status(status.badRequest)
            .send(rs(status.badRequest, message.noUniqueId));
    }
    institutedb
        .deleteInstitute(instituteId)
        .then((response) => {
            res
                .status(status.success)
                .send(rs(status.success, message.deleteInstitute, response))
        }).catch((error) => {
            console.log(error);
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};


/**
 * @swagger
 * /institutes:
 *   post:
 *     summary: update institute  to the portal
 *     tags: [Institute]
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       description: Required data to update a institute
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Institute' 
 *           example: 
 *             adminId: klwvhiuwuoivuiqgvuoovu
 *             location: pune
 *             description: parshuramers institute
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError' 
 *       201:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example: 
 *               status: 201
 *               message: Institute updated successfully
 */

// updatateInstitute

exports.updateInstitute = async (req, res) => {
    const decoded = getPayload(req);
    const jsonData = req.body;
    const instituteId = jsonData._id;
    const { isValid, validFields } = isRequestBodyForUpdateRecordValid(
        jsonData,
        InstituteSchema.schema
    );
    if (!isValid) {
        return res
            .status(status.badRequest)
            .send(rs(status.badRequest, message.noUpdateFields));
    }
    const validObject = getObjectWithValidFields(jsonData, validFields);
    institutedb
        .updateInstitute(instituteId, validObject, decoded.email)
        .then((response) => {
            res.status(status.success).send(rs(status.success, message.instituteUpdate, response));
        })
        .catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};
