// verifica se o usuário está autenticado
function isAuthenticated(req, res, next) {
    console.log(req.session)
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: 'Acesso não autorizado' });
}

module.exports = isAuthenticated;