const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.getSetting = async (key) => {
  const setting = await prisma.siteSetting.findUnique({
    where: { key }
  });
  return setting ? setting.value : null;
};

exports.saveSetting = async (key, value) => {
  if (!key) throw new AppError('Setting key is required', 400);
  
  const setting = await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
  
  return setting.value;
};
