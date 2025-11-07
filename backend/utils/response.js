class ResponseHelper {
  static success(res, data = null, message = '操作成功') {
    return res.json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = '操作失败', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message
    });
  }

  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: '参数验证失败',
      errors
    });
  }

  static notFound(res, message = '资源不存在') {
    return res.status(404).json({
      success: false,
      message
    });
  }
}

module.exports = ResponseHelper;