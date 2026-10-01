const env = require("../config/env");

/*
 * ============================================================
 * TrustDesk Demo Authentication Middleware
 * ============================================================
 *
 * Simple token-based authentication for the capstone.
 *
 * Expected header:
 *
 * Authorization: Bearer <DEMO_TOKEN>
 *
 * This is intentionally simple. It is not intended to replace
 * production OAuth/JWT authentication.
 */

const requireAuth = (req, res, next) => {

  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "Authentication required."
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" ||!token) {
    return res.status(401).json({
      success: false,
      message:
        "Use Authorization: Bearer <token>."
    });
  }


  if (!env.demoToken || token !== env.demoToken) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token."
    });
  }


  /*
   * Demo reviewer identity.
   *
   * The approval controller will use this identity
   * instead of trusting reviewer_id from the request body.
   */

  req.user = {reviewerId: "reviewer_demo"};
  next();
};


module.exports = {requireAuth};