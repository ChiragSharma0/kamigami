const prisma = require('../../db/prisma');
const { deleteFromS3, deleteMultipleFromS3 } = require('./media.utils');

class MediaService {
  async saveMedia(fileData, uploadedBy) {
    const type = fileData.mimetype.startsWith('video/') ? 'video' : 'image';
    
    return prisma.media.create({
      data: {
        fileName: fileData.key.split('/').pop(),
        originalName: fileData.originalname,
        mimeType: fileData.mimetype,
        fileSize: fileData.size,
        url: fileData.location,
        storageKey: fileData.key,
        type,
        folder: fileData.folder || 'misc',
        altText: fileData.altText || null,
        uploadedById: uploadedBy,
      }
    });
  }

  async getAllMedia(filters, pagination) {
    const { type, folder, search } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (folder) where.folder = folder;
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, data] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      })
    ]);

    return {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data
    };
  }

  async getMediaById(id) {
    const media = await prisma.media.findUnique({ 
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    if (!media) throw new Error('Media not found');
    return media;
  }

  async deleteMedia(id) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');

    // Delete from S3 first
    await deleteFromS3(media.storageKey);

    // Delete from DB
    await prisma.media.delete({ where: { id } });
    return true;
  }
}

module.exports = new MediaService();
