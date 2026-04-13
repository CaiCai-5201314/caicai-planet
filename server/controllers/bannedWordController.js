const { BannedWord, Sequelize } = require('../models');
const { Op } = Sequelize;

const bannedWordController = {
  // 获取违禁词列表
  getBannedWords: async (req, res) => {
    try {
      const { page = 1, limit = 20, category, level, search } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (category) {
        where.category = category;
      }
      if (level) {
        where.level = level;
      }
      if (search) {
        where.word = { [Op.like]: `%${search}%` };
      }

      const { count, rows } = await BannedWord.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      res.json({
        words: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      });
    } catch (error) {
      console.error('获取违禁词列表错误:', error);
      res.status(500).json({ message: '获取违禁词列表失败' });
    }
  },

  // 添加违禁词
  addBannedWord: async (req, res) => {
    try {
      const { word, category, level } = req.body;

      if (!word || !category || !level) {
        return res.status(400).json({ message: '请填写完整的违禁词信息' });
      }

      const existingWord = await BannedWord.findOne({ where: { word } });
      if (existingWord) {
        return res.status(400).json({ message: '该违禁词已存在' });
      }

      const newWord = await BannedWord.create({ word, category, level });
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
      const { word, category, level } = req.body;

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

      await bannedWord.update({ word, category, level });
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
            category: word.category,
            level: word.level
          });
        }
      });

      // 按照严重程度排序
      detectedWords.sort((a, b) => {
        const levelOrder = { light: 0, medium: 1, high: 2, severe: 3 };
        return levelOrder[b.level] - levelOrder[a.level];
      });

      res.json({
        detected: detectedWords.length > 0,
        words: detectedWords,
        severity: detectedWords.length > 0 ? detectedWords[0].level : 'none'
      });
    } catch (error) {
      console.error('检测违禁词错误:', error);
      res.status(500).json({ message: '检测违禁词失败' });
    }
  },

  // 获取违禁词统计数据
  getBannedWordStats: async (req, res) => {
    try {
      // 按分类统计
      const categoryStats = await BannedWord.findAll({
        attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        group: ['category'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
      });

      // 按级别统计
      const levelStats = await BannedWord.findAll({
        attributes: ['level', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        group: ['level'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
      });

      // 总数量
      const totalCount = await BannedWord.count();

      res.json({
        total: totalCount,
        categoryStats: categoryStats.map(item => ({
          category: item.category,
          count: parseInt(item.dataValues.count)
        })),
        levelStats: levelStats.map(item => ({
          level: item.level,
          count: parseInt(item.dataValues.count)
        }))
      });
    } catch (error) {
      console.error('获取违禁词统计错误:', error);
      res.status(500).json({ message: '获取违禁词统计失败' });
    }
  },

  // 批量添加违禁词
  bulkAddBannedWords: async (req, res) => {
    try {
      const { category, level } = req.body;
      let words = [];

      // 检查是否有文件上传
      if (req.file) {
        // 读取文件内容
        const fs = require('fs');
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        
        // 解析文件内容
        if (req.file.originalname.endsWith('.csv')) {
          // CSV格式
          words = fileContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith(','));
        } else {
          // TXT格式
          words = fileContent.split('\n')
            .map(line => line.trim())
            .filter(line => line);
        }
      } else if (req.body.words) {
        // 文本输入方式
        words = Array.isArray(req.body.words) ? req.body.words : [];
      }

      if (!words.length) {
        return res.status(400).json({ message: '请提供违禁词' });
      }

      if (!category || !level) {
        return res.status(400).json({ message: '请指定分类和等级' });
      }

      // 去重
      words = [...new Set(words)];

      // 检查重复的违禁词
      const existingWords = await BannedWord.findAll({
        where: {
          word: {
            [Op.in]: words
          }
        }
      });

      const existingWordSet = new Set(existingWords.map(w => w.word));
      const newWords = words.filter(word => !existingWordSet.has(word));

      // 批量创建新违禁词
      let successCount = 0;
      const failures = [];

      for (const word of newWords) {
        try {
          await BannedWord.create({ word, category, level });
          successCount++;
        } catch (error) {
          failures.push(`添加 "${word}" 失败: ${error.message}`);
        }
      }

      // 清理上传的文件
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }

      res.json({
        successCount,
        duplicateCount: words.length - newWords.length,
        failureCount: failures.length,
        failures
      });
    } catch (error) {
      console.error('批量添加违禁词错误:', error);
      res.status(500).json({ message: '批量添加违禁词失败' });
    }
  }
};

module.exports = bannedWordController;