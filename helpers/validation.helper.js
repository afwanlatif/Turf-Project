const { BaseSchema } = require("../models/base.model");

exports.getRequiredFieldsInModel = (schema) => {
    const baseModelPaths = Object.keys(BaseSchema.paths);
    const paths = schema.paths;
    const requiredPaths = {};
    Object.keys(paths).forEach((path) => {
        if (paths[path].isRequired === true) {
            requiredPaths[path] = paths[path];
        }
    });
    const modelPaths = Object.keys(requiredPaths);
    return modelPaths.filter((item) => !baseModelPaths.includes(item));
};

exports.getValidFieldsInModel = (requestBody, schema) => {
    const modelFields = Object.keys(schema.paths);
    const baseModelFields = Object.keys(BaseSchema.paths);
    const fields = modelFields.filter((item) => !baseModelFields.includes(item));
    if (fields.includes("__v")) {
        fields.splice(fields.indexOf("__v"), 1);
    }
    const requestBodyFields = Object.keys(requestBody);

    return requestBodyFields.filter((item) => fields.includes(item));
};

exports.isRequestBodyForAddRecordValid = (requestBody, schema) => {
    const requiredFields = this.getRequiredFieldsInModel(schema);
    let isValid = true;
    let missingFields = [];
    requiredFields.forEach((field) => {
        if (
            requestBody[field] === undefined ||
            requestBody[field] === null ||
            requestBody[field] === "" ||
            typeof requestBody[field] !== schema?.paths[field]?.instance?.toLowerCase()
        ) {
            isValid = false;
            missingFields.push(field);
        }
    });
    const validFields = this.getValidFieldsInModel(requestBody, schema);

    return { isValid, missingFields, validFields };
};

exports.isRequestBodyForUpdateRecordValid = (requestBody, schema) => {
    const validFields = this.getValidFieldsInModel(requestBody, schema);
    if (!validFields.includes("_id")) {
        validFields.push("_id");
    }
    const isValid = validFields.length > 1 && validFields.includes("_id");
    return {
        isValid,
        validFields,
    };
};

exports.getObjectWithValidFields = (requestBody, validFields) => {
    const returnObject = {};

    if (validFields.includes("_id")) {
        validFields.splice(validFields.indexOf("_id"), 1);
    }

    validFields.forEach((field) => {
        returnObject[field] = requestBody[field];
    });

    return returnObject;
};

