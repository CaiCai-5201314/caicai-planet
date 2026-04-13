// 图片裁剪工具函数

// 根据裁剪参数生成裁剪后的图片
export const getCroppedImg = async (imageSrc, pixelCrop) => {
  console.log('开始裁剪图片...');
  console.log('图片源:', imageSrc);
  console.log('裁剪参数:', pixelCrop);
  
  const image = new Image();
  image.src = imageSrc;
  
  return new Promise((resolve, reject) => {
    image.onload = () => {
      console.log('图片加载成功，尺寸:', image.width, 'x', image.height);
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算实际裁剪区域
        const actualX = pixelCrop.x;
        const actualY = pixelCrop.y;
        const actualWidth = pixelCrop.width;
        const actualHeight = pixelCrop.height;
        
        console.log('裁剪区域:', actualX, actualY, actualWidth, actualHeight);
        
        // 设置画布大小为裁剪区域的大小
        canvas.width = actualWidth;
        canvas.height = actualHeight;
        
        // 绘制裁剪后的图片
        ctx.drawImage(
          image,
          actualX,
          actualY,
          actualWidth,
          actualHeight,
          0,
          0,
          actualWidth,
          actualHeight
        );
        
        // 将画布转换为 Blob 对象
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('生成 Blob 失败');
              reject(new Error('Failed to create blob'));
              return;
            }
            console.log('生成 Blob 成功，大小:', blob.size);
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      } catch (error) {
        console.error('裁剪过程中出错:', error);
        reject(error);
      }
    };
    
    image.onerror = (error) => {
      console.error('图片加载失败:', error);
      reject(new Error('Failed to load image'));
    };
  });
};

// 将 File 对象转换为 Data URL
export const fileToDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};