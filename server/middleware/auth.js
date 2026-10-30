export const requireAdminAuth = (req, res, next) => {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || adminKey.trim() === '') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Server admin key is not configured.'
    });
  }

  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-key']) {
    token = String(req.headers['x-admin-key']).trim();
  }

  if (!token || token !== adminKey.trim()) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid admin authentication key.'
    });
  }

  next();
};
