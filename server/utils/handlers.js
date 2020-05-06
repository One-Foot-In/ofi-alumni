const checkRole = (requiredRole) => async (req, res, next) => {
    const user = await req.db.collection("User").findOne({email: req.body.email});
    if (!!user && requiredRole === user.role) {
        next()
    } else {
        return res.status(401).send("You do not have the correct role permissions")
    }
}

exports.checkRole = checkRole