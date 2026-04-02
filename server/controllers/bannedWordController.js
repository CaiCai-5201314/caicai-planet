const { BannedWord } = require('../models');

const bannedWordController = {
  // 获取违禁词列表
  getBannedWords: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await BannedWord.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        words: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error('获取违禁词列表错误:', error);
      res.status(500).json({ message: '获取违禁词列表失败' });
    }
  },

  // 添加违禁词
  addBannedWord: async (req, res) => {
    try {
      const { word, level } = req.body;

      if (!word || !level) {
        return res.status(400).json({ message: '请填写完整的违禁词信息' });
      }

      const existingWord = await BannedWord.findOne({ where: { word } });
      if (existingWord) {
        return res.status(400).json({ message: '该违禁词已存在' });
      }

      const newWord = await BannedWord.create({ word, level });
      res.status(201).json({ message: '添加违禁词成功', word: newWord });
    } catch (error) {
      console.error('添加违禁词错误:', error);
      res.status(500).json({ message: '添加违禁词失败' });
    }
  },

  // 更新违禁词
  updateBannedWord: async (req, res) => {
    try {
      const { id } = req.params;
      const { word, level } = req.body;

      const bannedWord = await BannedWord.findByPk(id);
      if (!bannedWord) {
        return res.status(404).json({ message: '违禁词不存在' });
      }

      if (word && word !== bannedWord.word) {
        const existingWord = await BannedWord.findOne({ where: { word } });
        if (existingWord) {
          return res.status(400).json({ message: '该违禁词已存在' });
        }
      }

      await bannedWord.update({ word, level });
      res.json({ message: '更新违禁词成功', word: bannedWord });
    } catch (error) {
      console.error('更新违禁词错误:', error);
      res.status(500).json({ message: '更新违禁词失败' });
    }
  },

  // 删除违禁词
  deleteBannedWord: async (req, res) => {
    try {
      const { id } = req.params;

      const bannedWord = await BannedWord.findByPk(id);
      if (!bannedWord) {
        return res.status(404).json({ message: '违禁词不存在' });
      }

      await bannedWord.destroy();
      res.json({ message: '删除违禁词成功' });
    } catch (error) {
      console.error('删除违禁词错误:', error);
      res.status(500).json({ message: '删除违禁词失败' });
    }
  },

  // 检测文本中的违禁词
  detectBannedWords: async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: '请提供要检测的文本' });
      }

      // 获取所有违禁词
      const bannedWords = await BannedWord.findAll();
      const detectedWords = [];

      // 检测文本中的违禁词
      bannedWords.forEach(word => {
        if (text.includes(word.word)) {
          detectedWords.push({
            word: word.word,
            level: word.level
          });
        }
      });

      res.json({
        detected: detectedWords.length > 0,
        words: detectedWords
      });
    } catch (error) {
      console.error('检测违禁词错误:', error);
      res.status(500).json({ message: '检测违禁词失败' });
    }
  }
};

module.exports = bannedWordController;