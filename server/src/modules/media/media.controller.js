const mediaService = require('./media.service');
const asyncHandler = require('../../common/middleware/asyncHandler');
const AppError = require('../../common/errors/AppError');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('./media.utils');
const { compressVideo } = require('./media.compress');
const path = require('path');
const fs = require('fs');

exports.uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No video file uploaded', 400);
  }

  const uploadedBy = req.user ? req.user.id : null;
  const folder = req.body.folder || 'videos';
  const altText = req.body.altText || null;
  const originalName = req.file.originalname;

  const tempOutputDir = path.join(__dirname, '../../../../uploads/tmp');
  let compressedPath = null;

  try {
    // 1. Compress the video locally
    compressedPath = await compressVideo(req.file.path, tempOutputDir);

    // 2. Read compressed file stats & file contents
    const stats = fs.statSync(compressedPath);
    const fileStream = fs.createReadStream(compressedPath);

    // Generate unique S3 storage key
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = '.mp4'; // Compressor output is always mp4 format
    const storageKey = `${folder}/${uniqueSuffix}${ext}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'kamigami-media';

    // 3. Upload the compressed stream to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
      Body: fileStream,
      ContentType: 'video/mp4',
      ContentLength: stats.size
    });
    
    await s3Client.send(uploadCommand);

    // 4. Save metadata to Prisma database via mediaService
    const fileData = {
      key: storageKey,
      originalname: originalName,
      mimetype: 'video/mp4',
      size: stats.size,
      folder,
      altText
    };

    const savedMedia = await mediaService.saveMedia(fileData, uploadedBy);

    // 5. Clean up temporary files on disk
    try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Failed to delete raw temp file:', e); }
    try { fs.unlinkSync(compressedPath); } catch (e) { console.error('Failed to delete compressed temp file:', e); }

    res.status(201).json({
      status: 'success',
      data: [savedMedia] // Wrapped in array to match standard uploadMedia interface
    });

  } catch (error) {
    // Clean up temp files if anything fails
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    if (compressedPath && fs.existsSync(compressedPath)) {
      try { fs.unlinkSync(compressedPath); } catch (e) {}
    }
    console.error('❌ Video upload/compression error:', error);
    throw new AppError(error.message || 'Video compression and upload failed', 500);
  }
});

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

exports.updateMedia = asyncHandler(async (req, res) => {
  const { originalName, altText } = req.body;
  const updatedMedia = await mediaService.updateMedia(req.params.id, { originalName, altText });
  res.status(200).json({
    status: 'success',
    data: updatedMedia
  });
});

exports.deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.deleteMedia(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Media deleted successfully'
  });
});
