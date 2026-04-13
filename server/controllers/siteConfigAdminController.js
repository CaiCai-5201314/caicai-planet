const { SiteConfig } = require('../models');

const siteConfigAdminController = {
  // 获取网站配置
  getSiteConfigs: async (req, res) => {
    try {
      const configs = await SiteConfig.findAll();
      
      // 转换为键值对格式
      const configMap = {};
      configs.forEach(config => {
        configMap[config.key] = config.value;
      });
      
      res.json({
        configs: configMap
      });
    } catch (error) {
      console.error('获取网站配置错误:', error);
      res.status(500).json({ message: '获取网站配置失败' });
    }
  },

  // 更新网站配置
  updateSiteConfig: async (req, res) => {
    try {
      const { key, value, description } = req.body;
      
      if (!key) {
        return res.status(400).json({ message: '配置键不能为空' });
      }
      
      // 查找或创建配置
      const [config, created] = await SiteConfig.findOrCreate({
        where: { key },
        defaults: {
          value,
          description
        }
      });
      
      // 如果已存在，则更新
      if (!created) {
        await config.update({
          value,
          description
        });
      }
      
      res.json({
        message: created ? '配置创建成功' : '配置更新成功',
        config: {
          key: config.key,
          value: config.value,
          description: config.description
        }
      });
    } catch (error) {
      console.error('更新网站配置错误:', error);
      res.status(500).json({ message: '更新网站配置失败' });
    }
  },

  // 批量更新网站配置
  batchUpdateSiteConfig: async (req, res) => {
    try {
      const configs = req.body.configs;
      
      if (!Array.isArray(configs)) {
        return res.status(400).json({ message: '配置数据格式错误' });
      }
      
      const updatedConfigs = [];
      
      for (const configData of configs) {
        const { key, value, description } = configData;
        
        if (!key) continue;
        
        const [config, created] = await SiteConfig.findOrCreate({
          where: { key },
          defaults: {
            value,
            description
          }
        });
        
        if (!created) {
          await config.update({
            value,
            description
          });
        }
        
        updatedConfigs.push({
          key: config.key,
          value: config.value,
          description: config.description
        });
      }
      
      res.json({
        message: '配置更新成功',
        configs: updatedConfigs
      });
    } catch (error) {
      console.error('批量更新网站配置错误:', error);
      res.status(500).json({ message: '更新网站配置失败' });
    }
  }
};

module.exports = siteConfigAdminController;