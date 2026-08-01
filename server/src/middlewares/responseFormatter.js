const responseFormatter = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Prevent double wrapping
    if (data && data.success !== undefined) {
      return originalJson.call(this, data);
    }
    
    // Check if it's an error response (usually has 'error' key)
    if (data && data.error) {
      return originalJson.call(this, {
        success: false,
        message: data.error,
        errorCode: data.errorCode || `ERR_${res.statusCode}`
      });
    }

    // Wrap in standard success format
    return originalJson.call(this, {
      success: true,
      message: 'Success',
      data: data
    });
  };

  next();
};

module.exports = responseFormatter;
