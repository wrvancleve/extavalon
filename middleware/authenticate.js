module.exports = function (req, res, next) {
    if (req.session.firstName == null || req.session.lastName == null || req.session.userId == null) {
        res.redirect(`/login`);
    } else {
        return next();
    }
}