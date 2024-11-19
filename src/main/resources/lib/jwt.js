exports.extractJwtToken = function (req) {
    const authHeader = req.headers["Authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.replace("Bearer ", "");
    }
    return null;
};
