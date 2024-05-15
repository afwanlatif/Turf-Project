const { SelectType } = require('../constants/index');

// array of metas should have the same types

exports.getSelectString = (...metas) => {
    let fields = metas.map((meta) => meta.fields);
    fields = fields.flat();
    if (metas[0].type === SelectType.select) {
        return fields.join(" ");
    } else {
        return "-" + fields.join(" -");
    }
};

exports.SelectMeta = {
    default: {
        type: SelectType.deSelect,
        fields: [
            "createdBy",
            "createdAt",
            "updatedBy",
            "updatedAt",
            "__v",
        ],
    },
    users: {
        type: SelectType.deSelect,
        fields: ["password"],
    }
}