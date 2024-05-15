const { RecordStatus } = require('../constants/index');

exports.updateFilters = (filters, filtersMeta) => {
    if (filters.status) {
        if (filters.status != RecordStatus.all) {
            filters.recStatus = filters.status;
        }
        delete filters.status;
    } else {
        filters.recStatus = RecordStatus.active;
    }
    filtersMeta.forEach((meta) => {
        if (filters[meta.queryKey]) {
            filters[meta.dbKey] = filters[meta.queryKey];
            delete filters[meta.queryKey];
        }
    });
};


exports.FiltersMeta = {
    users: [
        {
            queryKey: 'type',
            dbKey: 'userType'
        },

    ],
    institute: [
        {
            queryKey: 'type',
            dbKey: 'userType'
        }
    ],
}