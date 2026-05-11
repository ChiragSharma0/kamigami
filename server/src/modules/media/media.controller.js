const mediaService = require('./media.service');
const asyncHandler = require('../../common/middleware/asyncHandler');
const AppError = require('../../common/errors/AppError');

exports.uploadMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const uploadedBy = req.user ? req.user.id : null;
  const folder = req.body.folder || 'misc';
  const altText = req.body.altText || null;

  const savedMedia = [];
  for (const file of req.files) {
    const fileData = {
      ...file,
      folder,
      altText
    };
    const result = await mediaService.saveMedia(fileData, uploadedBy);
    savedMedia.push(result);
  }

  res.status(201).json({
    status: 'success',
    data: savedMedia
  });
});

exports.getAllMedia = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    folder: req.query.folder,
    search: req.query.search
  };
  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || 20
  };

  const result = await mediaService.getAllMedia(filters, pagination);
  
  res.status(200).json({
    status: 'success',
    data: result.data,
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    }
  });
});

exports.getMediaById = asyncHandler(async (req, res) => {
  const media = await mediaService.getMediaById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: media
  });
});

exports.deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.deleteMedia(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Media deleted successfully'
  });
});
