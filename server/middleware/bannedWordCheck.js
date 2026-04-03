const { BannedWord } = require('../models');

// 违禁词检测中间件
const bannedWordCheck = async (req, res, next) => {
  try {
    // 获取需要检测的文本
    const { content, title, summary } = req.body || {};
    const textToCheck = `${title || ''} ${summary || ''} ${content || ''}`;

    if (!textToCheck.trim()) {
      return next();
    }

    // 获取所有违禁词
    const bannedWords = await BannedWord.findAll();
    const detectedWords = [];

    // 检测文本中的违禁词
    bannedWords.forEach(word => {
      if (textToCheck.includes(word.word)) {
        detectedWords.push({
          word: word.word,
          level: word.level
        });
      }
    });

    // 如果没有检测到违禁词，直接通过
    if (detectedWords.length === 0) {
      return next();
    }

    // 按照违禁词等级进行处理
    let maxLevel = 'light';
    detectedWords.forEach(item => {
      if (
        (item.level === 'medium' && maxLevel === 'light') ||
        (item.level === 'high' && (maxLevel === 'light' || maxLevel === 'medium')) ||
        (item.level === 'severe' && (maxLevel === 'light' || maxLevel === 'medium' || maxLevel === 'high'))
      ) {
        maxLevel = item.level;
      }
    });

    // 根据最高等级进行处理
    switch (maxLevel) {
      case 'light':
        // 轻度违禁词，直接放行
        req.body.bannedWords = detectedWords;
        next();
        break;
      case 'medium':
        // 中度违禁词，简单告知
        return res.status(400).json({
          message: '文本中包含违禁词，请修改后重试',
          bannedWords: detectedWords
        });
      case 'high':
        // 高度违禁词，发布后需要管理员审核
        req.body.status = 'pending';
        req.body.bannedWords = detectedWords;
        next();
        break;
      case 'severe':
        // 重度违禁词，直接删除
        return res.status(400).json({
          message: '文本中包含严重违禁词，无法发布'
        });
      default:
        next();
    }
  } catch (error) {
    console.error('违禁词检测错误:', error);
    // 检测错误时，允许通过，避免影响正常发布
    next();
  }
};

module.exports = bannedWordCheck;