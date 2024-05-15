const { response } = require('express');
const { RecordStatus } = require('../constants/index');
const { InstituteSchema } = require('../models/institute');


// add Institute

exports.addInstitute = (InstituteData, actionBy) => {
    return new Promise((reslove, reject) => {
        const institute = new InstituteSchema({ ...InstituteData, createdBy: actionBy });
        institute
            .save()
            .then((response) => {
                reslove(response)
            }).catch((error) => {
                reject(error)
            });
    })
}

// getAllInstitute

exports.getInstitute = (filters, options) => {
    return new Promise((resolve, reject) => {
        InstituteSchema.find(filters).populate('adminId')
            .select(options?.select)
            .lean(options ? options.lean ?? false : false)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// get single institute

exports.singleInstitute = (filters, options) => {
    return new Promise((reslove, reject) => {
        InstituteSchema.findById(filters).populate('adminId')
            .select(options?.select)
            .lean(options ? options.lean ?? false : false)
            .then((response) => {
                reslove(response);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

// deleteInstitute

exports.deleteInstitute = (instituteId) => {
    return new Promise((resolve, reject) => {
        InstituteSchema.findByIdAndUpdate(instituteId, { recStatus: RecordStatus.inactive })
            .then((response) => {
                resolve(response)
            }).catch((error) => {
                reject(error);
            });
    });
}

// updateInstitute

exports.updateInstitute = (instituteId, InstituteData, actionBy) => {
    return new Promise(async (reslove, reject) => {
        try {
            let params = {
                ...InstituteData,
                createdBy: actionBy,
                createdAt: Date.now(),
            };
            await InstituteSchema.findOneAndUpdate({ _id: instituteId }, params).populate('adminId')
            reslove();
        } catch (error) {
            console.log(error);
            reject(error);
        };
    });
};