exports.responseStructure = (status, message, data) => {
    return {
        status: status,
        message: message,
        data: data
    }
}