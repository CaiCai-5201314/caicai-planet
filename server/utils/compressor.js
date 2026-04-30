const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WATERMARK_TEXT = '菜菜星球专属';

exports.addWatermark = async (inputPath, outputPath) => {
  try {
    console.log('开始添加水印:', inputPath);
    
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;
    
    const fontSize = Math.max(Math.min(width, height) * 0.04, 24);
    const textWidth = Math.round(WATERMARK_TEXT.length * fontSize * 0.6);
    const textHeight = Math.round(fontSize * 1.5);
    
    const x = Math.round((width - textWidth) / 2);
    const y = Math.round(height - textHeight - 20);

    const svgBuffer = Buffer.from(`
      <svg width="${textWidth}" height="${textHeight}">
        <text x="0" y="${Math.round(fontSize)}" font-family="Arial" font-size="${Math.round(fontSize)}" fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.5)" stroke-width="1">${WATERMARK_TEXT}</text>
      </svg>
    `);

    await sharp(inputPath)
      .composite([{
        input: svgBuffer,
        top: Math.max(0, y),
        left: Math.max(0, x)
      }])
      .toFile(outputPath);
    
    console.log('水印添加成功:', outputPath);
    return true;
  } catch (error) {
    console.error('添加水印失败:', error);
    console.error('错误堆栈:', error.stack);
    return false;
  }
};

exports.compressImage = async (inputPath, outputPath) => {
  try {
    console.log('开始压缩图片:', inputPath);
    
    if (!fs.existsSync(inputPath)) {
      console.error('图片源文件不存在:', inputPath);
      return false;
    }
    
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      console.log('创建输出目录:', outputDir);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log('图片元数据:', metadata.width, 'x', metadata.height, '格式:', metadata.format);

    let processedImage = image;
    if (metadata.width > 1920 || metadata.height > 1080) {
      console.log('图片尺寸过大，进行缩放处理');
      processedImage = image.resize(1920, 1080, { fit: 'inside' });
    }

    const tempPath = outputPath + '.temp';
    
    if (metadata.format === 'png') {
      await processedImage.png({ quality: 80 }).toFile(tempPath);
    } else {
      await processedImage.jpeg({ quality: 80 }).toFile(tempPath);
    }

    console.log('临时文件创建成功:', tempPath);
    
    if (!fs.existsSync(tempPath)) {
      console.error('临时文件创建失败:', tempPath);
      return false;
    }

    await exports.addWatermark(tempPath, outputPath);
    
    setTimeout(() => {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
          console.log('临时文件已删除:', tempPath);
        } catch (err) {
          console.log('临时文件删除失败(异步):', err.code);
        }
      }
    }, 100);

    console.log('图片压缩成功:', outputPath);
    return true;
  } catch (error) {
    console.error('图片压缩失败:', error);
    console.error('错误堆栈:', error.stack);
    return false;
  }
};

exports.compressPDF = async (inputPath, outputPath) => {
  try {
    console.log('开始处理PDF:', inputPath);
    if (!fs.existsSync(inputPath)) {
      console.error('PDF源文件不存在:', inputPath);
      return false;
    }
    
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      console.log('创建输出目录:', outputDir);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.copyFileSync(inputPath, outputPath);
    console.log('PDF处理成功:', outputPath);
    return true;
  } catch (error) {
    console.error('PDF处理失败:', error);
    console.error('错误堆栈:', error.stack);
    return false;
  }
};

exports.compressFile = async (inputPath, outputPath) => {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    console.log('compressFile - 输入路径:', inputPath, '扩展名:', ext);

    if (!fs.existsSync(inputPath)) {
      console.error('源文件不存在:', inputPath);
      return false;
    }
    
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      console.log('创建输出目录:', outputDir);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      return await exports.compressImage(inputPath, outputPath);
    } else if (ext === '.pdf') {
      return await exports.compressPDF(inputPath, outputPath);
    } else {
      console.log('未知文件类型，直接复制:', ext);
      fs.copyFileSync(inputPath, outputPath);
      console.log('文件复制成功:', outputPath);
      return true;
    }
  } catch (error) {
    console.error('compressFile 异常:', error);
    console.error('错误堆栈:', error.stack);
    return false;
  }
};
