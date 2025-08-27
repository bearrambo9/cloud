const jwt = require("jsonwebtoken");

const validateToken = async (token) => {
  if (!token) {
    return { valid: false, error: "No token provided" };
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, user };
  } catch (error) {
    return { valid: false, error: "Invalid token" };
  }
};

const withAuth = (handler) => {
  return async (data, callback) => {
    const { token, ...restData } = data;
    const result = await validateToken(token);

    if (result.valid) {
      return handler(restData, callback);
    } else {
      if (callback) callback({ error: result.error });
    }
  };
};

module.exports = {
  validateToken,
  withAuth,
};
