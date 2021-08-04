function checkCookie(cookie) {
    return cookie && (!cookie.expires || cookie.expires > Date.now())
}

module.exports = function (req, res, next) {
    if (!checkCookie(req.cookies.firstName) || !checkCookie(req.cookies.lastName) || !checkCookie(req.cookies.userId)) {
        res.redirect(`/login`);
    } else {
        return next();
    }
}