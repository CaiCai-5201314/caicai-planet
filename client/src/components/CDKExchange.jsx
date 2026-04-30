import React, { useState, useEffect } from 'react';
import { FiGift, FiClock, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const CDKExchange = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeResult, setExchangeResult] = useState(null);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [records, setRecords] = useState([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setIsRecordsLoading(true);
      const response = await api.get('/cdk/my-records');
      if (response.data.success) {
        setRecords(response.data.data || []);
      }
    } catch (error) {
      console.error('获取兑换记录失败:', error);
    } finally {
      setIsRecordsLoading(false);
    }
  };

  const handleFileDownload = async (recordId, fileIndex, filename) => {
    try {
      const response = await api.get(`/cdk/download/${recordId}/${fileIndex}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('文件下载失败:', error);
      toast.error('文件下载失败，请稍后重试');
    }
  };

  const handleFilePreview = async (recordId, fileIndex, fileInfo) => {
    try {
      const response = await api.get(`/cdk/download/${recordId}/${fileIndex}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const previewUrl = window.URL.createObjectURL(blob);
      
      setPreviewFile({
        url: previewUrl,
        name: fileInfo.name,
        type: response.headers['content-type'] || 'application/octet-stream',
        originalName: fileInfo.name
      });
      setPreviewVisible(true);
    } catch (error) {
      console.error('文件预览失败:', error);
      toast.error('文件预览失败，请稍后重试');
    }
  };

  const closePreview = () => {
    if (previewFile && previewFile.url) {
      window.URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    setPreviewVisible(false);
  };

  const handleExchange = async () => {
    if (!code.trim()) {
      toast.error('请输入CDK码');
      return;
    }

    setIsLoading(true);
    setExchangeResult(null);

    try {
      const response = await api.post('/cdk/exchange', { code: code.trim().toUpperCase() });
      
      if (response.data.success) {
        const rewards = response.data.rewards;
        setCurrentRecordId(response.data.record_id);
        setExchangeResult({
          success: true,
          message: response.data.message,
          rewards
        });
        
        toast.success(`兑换成功！获得${rewards.moon_points ? `${rewards.moon_points}月球分` : ''}${rewards.exp ? ` ${rewards.exp}经验值` : ''}`);
        
        setCode('');
        fetchRecords();
      } else {
        setExchangeResult({
          success: false,
          message: response.data.message
        });
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('兑换失败:', error);
      const errorMsg = error.response?.data?.message || '兑换失败，请稍后重试';
      setExchangeResult({
        success: false,
        message: errorMsg
      });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const renderRewards = (rewards) => {
    if (!rewards) return null;
    return (
      <div className="flex flex-wrap gap-3 mt-4">
        {rewards.moon_points && rewards.moon_points > 0 && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            +{rewards.moon_points} 月球分
          </span>
        )}
        {rewards.exp && rewards.exp > 0 && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            +{rewards.exp} 经验值
          </span>
        )}
        {rewards.items && rewards.items.length > 0 && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            {rewards.items.join(', ')}
          </span>
        )}
        {rewards.files && rewards.files.length > 0 && (
          <div className="w-full mt-3">
            <p className="text-sm text-gray-600 mb-2">文件奖励：</p>
            <div className="space-y-2">
              {rewards.files.map((file, index) => {
                const isImage = file.file_type?.includes('image') || file.name.match(/\.(png|jpg|jpeg|gif|webp)$/i);
                const isPdf = file.file_type?.includes('pdf') || file.name.match(/\.pdf$/i);
                return (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
                    <span className="text-lg">{isPdf ? '📄' : isImage ? '🖼️' : '📁'}</span>
                    <span className="flex-1 text-sm text-amber-700 truncate">{file.name}</span>
                    {(isImage || isPdf) && (
                      <button
                        onClick={() => handleFilePreview(currentRecordId, index, file)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-1"
                      >
                        预览
                      </button>
                    )}
                    <button
                      onClick={() => handleFileDownload(currentRecordId, index, file.name)}
                      className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                    >
                      下载
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PreviewModal = () => {
    if (!previewVisible || !previewFile) return null;
    
    const renderContent = () => {
      if (previewFile.type.includes('image')) {
        return (
          <img
            src={previewFile.url}
            alt={previewFile.name}
            className="max-w-full max-h-[60vh] object-contain mx-auto"
          />
        );
      } else if (previewFile.type.includes('pdf')) {
        return (
          <embed
            src={previewFile.url}
            type="application/pdf"
            className="w-full h-[60vh]"
          />
        );
      } else {
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">无法预览此文件类型</p>
            <button
              onClick={() => handleFileDownload(currentRecordId, 0, previewFile.name)}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              下载文件
            </button>
          </div>
        );
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closePreview}>
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">文件预览</h3>
            <button onClick={closePreview} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <div className="p-6">
            {renderContent()}
          </div>
          <div className="p-4 border-t flex justify-end">
            <button
              onClick={closePreview}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mr-2"
            >
              关闭
            </button>
            <button
              onClick={() => handleFileDownload(currentRecordId, 0, previewFile.name)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              下载
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <FiGift className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">CDK兑换</h2>
            <p className="text-sm text-gray-500">输入兑换码获取专属奖励</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleExchange()}
              placeholder="请输入CDK码"
              maxLength={20}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg tracking-widest uppercase"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleExchange}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="w-5 h-5 animate-spin" />
                兑换中...
              </span>
            ) : (
              '立即兑换'
            )}
          </button>

          {exchangeResult && (
            <div className={`p-4 rounded-xl ${exchangeResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center gap-2">
                {exchangeResult.success ? (
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${exchangeResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {exchangeResult.message}
                </span>
              </div>
              {exchangeResult.success && exchangeResult.rewards && renderRewards(exchangeResult.rewards)}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            CDK码区分大小写，请正确输入
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FiClock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">兑换记录</h3>
            <p className="text-sm text-gray-500">查看您的兑换历史</p>
          </div>
        </div>

        {isRecordsLoading ? (
          <div className="text-center py-8">
            <FiLoader className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-2" />
            <p className="text-gray-400">加载中...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎁</div>
            <p className="text-gray-400">暂无兑换记录</p>
            <p className="text-sm text-gray-300 mt-1">快去兑换您的第一个CDK吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FiGift className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {record.cdk?.description || `CDK: ${record.cdk?.code || '未知'}`}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(record.used_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  {record.rewards_received && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {JSON.parse(record.rewards_received).moon_points && (
                          <span className="text-sm text-green-600 font-medium">
                            +{JSON.parse(record.rewards_received).moon_points} 月球分
                          </span>
                        )}
                        {JSON.parse(record.rewards_received).exp && (
                          <span className="text-sm text-blue-600 font-medium">
                            +{JSON.parse(record.rewards_received).exp} 经验值
                          </span>
                        )}
                      </div>
                      {JSON.parse(record.rewards_received).files && JSON.parse(record.rewards_received).files.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-2">
                          {JSON.parse(record.rewards_received).files.map((file, index) => {
                            const isImage = file.file_type?.includes('image') || file.name.match(/\.(png|jpg|jpeg|gif|webp)$/i);
                            const isPdf = file.file_type?.includes('pdf') || file.name.match(/\.pdf$/i);
                            return (
                              <div key={index} className="flex items-center gap-1">
                                {(isImage || isPdf) && (
                                  <button
                                    onClick={() => handleFilePreview(record.id, index, file)}
                                    className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    预览
                                  </button>
                                )}
                                <button
                                  onClick={() => handleFileDownload(record.id, index, file.name)}
                                  className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                                >
                                  <span>{isPdf ? '📄' : isImage ? '🖼️' : '📁'}</span>
                                  <span>{file.name}</span>
                                  <span className="text-[10px]">下载</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PreviewModal />
    </div>
  );
};

export default CDKExchange;