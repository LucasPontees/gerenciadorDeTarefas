export function checkAuth (req, res, next) {
    const userId = req.session.userid
  
    if (!userId) {
      res.redirect('/login')
    }
  
    next()
  }

  export default checkAuth
  