import React, { useState, useEffect } from 'react';
import { 
  FiUpload, FiTrash2, FiFileText, FiImage, FiFolder, FiPlus, FiEdit, 
  FiShuffle, FiCheck, FiX, FiUsers, FiLayers, FiEye, FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const FileStorageManagement = () => {
  // 文件管理状态
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [description, setDescription] = useState('');
  
  // 预览弹窗状态
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // 池管理状态
  const [pools, setPools] = useState([]);
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [showEditPoolModal, setShowEditPoolModal] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [poolForm, setPoolForm] = useState({
    name: '',
    type: 'fixed',
    description: '',
    random_count: 1
  });

  // 当前激活的标签页
  const [activeTab, setActiveTab] = useState('files');

  useEffect(() => {
    if (activeTab === 'files') {
      fetchFiles();
    } else {
      fetchPools();
    }
  }, [activeTab]);

  // 文件管理相关函数
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/file-storage');
      if (response.data.success) {
        setFiles(response.data.data);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      toast.error('获取文件列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setCustomFileName(fileNameWithoutExt);
    } else {
      setCustomFileName('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('请选择要上传的文件');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.warning('只支持PDF、PNG、JPG格式的文件');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.warning('文件大小不能超过10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file_name', customFileName);
      formData.append('description', description);
      formData.append('file', selectedFile);

      const response = await api.post('/file-storage/upload', formData);

      if (response.data.success) {
        toast.success(`文件上传成功，压缩率: ${response.data.compression?.ratio || '0%'}`);
        setSelectedFile(null);
        setCustomFileName('');
        setDescription('');
        fetchFiles();
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error(error.response?.data?.message || '文件上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewFile = (file) => {
    console.log('=== 预览按钮点击 ===');
    console.log('文件信息:', file);
    setPreviewFile(file);
    setShowPreviewModal(true);
    console.log('预览弹窗状态:', showPreviewModal);
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm('确定要删除这个文件吗？')) {
      return;
    }

    try {
      const response = await api.delete(`/file-storage/${id}`);
      if (response.data.success) {
        toast.success('文件删除成功');
        fetchFiles();
        fetchPools();
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      toast.error('删除文件失败');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FiFileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('image')) return <FiImage className="w-5 h-5 text-green-500" />;
    return <FiFolder className="w-5 h-5 text-gray-500" />;
  };

  // 池管理相关函数
  const fetchPools = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/pools');
      if (response.data.success) {
        setPools(response.data.data || []);
      }
    } catch (error) {
      console.error('获取池列表失败:', error);
      toast.error('获取池列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableFiles = async () => {
    try {
      const response = await api.get('/file-storage');
      if (response.data.success) {
        setAvailableFiles(response.data.data || []);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  };

  const handleCreatePool = async () => {
    if (!poolForm.name || !poolForm.type) {
      toast.warning('请填写池名称和类型');
      return;
    }

    try {
      const response = await api.post('/pools', poolForm);
      if (response.data.success) {
        toast.success('池创建成功');
        setShowCreatePoolModal(false);
        setPoolForm({ name: '', type: 'fixed', description: '', random_count: 1 });
        fetchPools();
      }
    } catch (error) {
      console.error('创建池失败:', error);
      toast.error(error.response?.data?.message || '创建池失败');
    }
  };

  const handleUpdatePool = async () => {
    if (!selectedPool || !poolForm.name) {
      toast.warning('请填写池名称');
      return;
    }

    try {
      const response = await api.put(`/pools/${selectedPool.id}`, poolForm);
      if (response.data.success) {
        toast.success('池更新成功');
        setShowEditPoolModal(false);
        setSelectedPool(null);
        setPoolForm({ name: '', type: 'fixed', description: '', random_count: 1 });
        fetchPools();
      }
    } catch (error) {
      console.error('更新池失败:', error);
      toast.error(error.response?.data?.message || '更新池失败');
    }
  };

  const handleDeletePool = async (id) => {
    if (!window.confirm('确定要删除这个池吗？池中的文件将被移除但不会删除。')) {
      return;
    }

    try {
      const response = await api.delete(`/pools/${id}`);
      if (response.data.success) {
        toast.success('池删除成功');
        fetchPools();
      }
    } catch (error) {
      console.error('删除池失败:', error);
      toast.error('删除池失败');
    }
  };

  const handleAddFilesToPool = async () => {
    if (!selectedPool) return;

    const selectedFileIds = availableFiles
      .filter(f => f.selected)
      .map(f => f.id);

    if (selectedFileIds.length === 0) {
      toast.warning('请选择要添加的文件');
      return;
    }

    try {
      const response = await api.post(`/pools/${selectedPool.id}/files`, { file_ids: selectedFileIds });
      if (response.data.success) {
        toast.success('文件添加成功');
        setShowFileSelector(false);
        fetchPools();
      }
    } catch (error) {
      console.error('添加文件失败:', error);
      toast.error('添加文件失败');
    }
  };

  const handleRemoveFileFromPool = async (poolId, fileId) => {
    try {
      const response = await api.delete(`/pools/${poolId}/files`, { data: { file_ids: [fileId] } });
      if (response.data.success) {
        toast.success('文件移除成功');
        fetchPools();
      }
    } catch (error) {
      console.error('移除文件失败:', error);
      toast.error('移除文件失败');
    }
  };

  const handleDrawFromPool = async (poolId) => {
    try {
      const response = await api.post(`/pools/${poolId}/draw`);
      if (response.data.success) {
        const { selected_files } = response.data.data;
        toast.success(`从池中抽取了 ${selected_files.length} 个文件`);
        console.log('Selected files:', selected_files);
      }
    } catch (error) {
      console.error('抽取文件失败:', error);
      toast.error('抽取文件失败');
    }
  };

  const openEditPoolModal = (pool) => {
    setSelectedPool(pool);
    setPoolForm({
      name: pool.name,
      type: pool.type,
      description: pool.description || '',
      random_count: pool.random_count || 1
    });
    setShowEditPoolModal(true);
  };

  const openFileSelector = (pool) => {
    setSelectedPool(pool);
    fetchAvailableFilesWithPoolStatus(pool.id);
    setShowFileSelector(true);
  };

  const fetchAvailableFilesWithPoolStatus = async (poolId) => {
    try {
      const response = await api.get('/file-storage');
      if (response.data.success) {
        const files = response.data.data || [];
        
        const poolResponse = await api.get(`/pools/${poolId}`);
        if (poolResponse.data.success && poolResponse.data.data && poolResponse.data.data.files) {
          const poolFileIds = poolResponse.data.data.files.map(f => f.id);
          files.forEach(file => {
            file.inPool = poolFileIds.includes(file.id);
          });
        } else {
          files.forEach(file => {
            file.inPool = false;
          });
        }
        
        setAvailableFiles(files);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">文件存储与池管理</h1>
                <p className="text-sm text-gray-500">管理文件存储和奖励池（固定池/随机池）</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标签页切换 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'files'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <FiFolder className="w-4 h-4 inline mr-2" />
            文件存储
          </button>
          <button
            onClick={() => setActiveTab('pools')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'pools'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <FiLayers className="w-4 h-4 inline mr-2" />
            奖励池管理
          </button>
        </div>

        {/* 文件存储标签页 */}
        {activeTab === 'files' && (
          <div>
            {/* 上传区域 */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">上传文件</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择文件</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center py-4">
                          <FiUpload className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-600 mt-2">点击或拖拽文件到此处上传</p>
                          <p className="text-xs text-gray-400 mt-1">支持 PDF, PNG, JPG 格式，最大10MB</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(selectedFile.type)}
                      </div>
                      <span>已选择: {selectedFile.name}</span>
                      <span className="text-gray-400">({formatSize(selectedFile.size)})</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">自定义文件名（可选）</label>
                  <input
                    type="text"
                    placeholder="输入自定义文件名（不含扩展名）"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    提示：若文件名超过8个字符，系统将自动生成8位随机名称
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">文件描述（可选）</label>
                  <input
                    type="text"
                    placeholder="请输入文件描述"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiUpload className="w-4 h-4" />
                  {uploading ? '上传中...' : '上传文件'}
                </button>
              </div>
            </div>

            {/* 文件列表 */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">文件列表</h3>
              </div>

              {isLoading ? (
                <div className="px-4 py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    加载中...
                  </div>
                </div>
              ) : files.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFolder className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">暂无文件</p>
                  <p className="text-sm text-gray-400 mt-1">点击上方上传按钮添加文件</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">文件名</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">原大小</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">压缩后</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">描述</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                {getFileIcon(file.file_type)}
                              </div>
                              <a
                                href={`/api/file-storage/download/${file.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {file.file_name}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {file.file_type.split('/')[1]?.toUpperCase() || '未知'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatSize(file.file_size)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{formatSize(file.compressed_size)}</span>
                              {file.file_size > file.compressed_size && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                  -{((1 - file.compressed_size / file.file_size) * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{file.description || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {file.createdAt ? new Date(file.createdAt).toLocaleString('zh-CN') : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePreviewFile(file)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="预览"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="删除"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 池管理标签页 */}
        {activeTab === 'pools' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">奖励池列表</h3>
              <button
                onClick={() => setShowCreatePoolModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
              >
                <FiPlus className="w-4 h-4" />
                创建池
              </button>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : pools.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLayers className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">暂无池</p>
                <p className="text-gray-400 text-sm mt-1">点击上方按钮创建第一个池</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pools.map((pool) => (
                  <div key={pool.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          pool.type === 'fixed' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {pool.type === 'fixed' ? (
                            <FiFileText className="w-5 h-5 text-green-600" />
                          ) : (
                            <FiShuffle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{pool.name}</h3>
                          <p className="text-sm text-gray-500">
                            {pool.type === 'fixed' ? '固定池 - 全部发放' : `随机池 - 每次抽取 ${pool.random_count} 个`}
                            {pool.description && ` - ${pool.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDrawFromPool(pool.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="抽取文件"
                        >
                          <FiShuffle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openFileSelector(pool)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="管理文件"
                        >
                          <FiFileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditPoolModal(pool)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="编辑"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePool(pool.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="删除"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">池内文件 ({pool.files?.length || 0})</span>
                      </div>
                      {pool.files && pool.files.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {pool.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.file_name}</span>
                              <button
                                onClick={() => handleRemoveFileFromPool(pool.id, file.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          池内暂无文件，点击上方"管理文件"按钮添加
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 创建池模态框 */}
        {showCreatePoolModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">创建池</h3>
                <button onClick={() => setShowCreatePoolModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">池名称 *</label>
                  <input
                    type="text"
                    value={poolForm.name}
                    onChange={(e) => setPoolForm({ ...poolForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入池名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">池类型 *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="poolType"
                        value="fixed"
                        checked={poolForm.type === 'fixed'}
                        onChange={(e) => setPoolForm({ ...poolForm, type: e.target.value })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-gray-700">固定池</span>
                      <span className="text-xs text-gray-400">(全部发放)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="poolType"
                        value="random"
                        checked={poolForm.type === 'random'}
                        onChange={(e) => setPoolForm({ ...poolForm, type: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">随机池</span>
                      <span className="text-xs text-gray-400">(随机抽取)</span>
                    </label>
                  </div>
                </div>
                {poolForm.type === 'random' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">每次抽取数量</label>
                    <input
                      type="number"
                      min="1"
                      value={poolForm.random_count}
                      onChange={(e) => setPoolForm({ ...poolForm, random_count: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述（可选）</label>
                  <textarea
                    value={poolForm.description}
                    onChange={(e) => setPoolForm({ ...poolForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="请输入池描述"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreatePoolModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreatePool}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑池模态框 */}
        {showEditPoolModal && selectedPool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">编辑池</h3>
                <button onClick={() => { setShowEditPoolModal(false); setSelectedPool(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">池名称 *</label>
                  <input
                    type="text"
                    value={poolForm.name}
                    onChange={(e) => setPoolForm({ ...poolForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">池类型</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editPoolType"
                        value="fixed"
                        checked={poolForm.type === 'fixed'}
                        onChange={(e) => setPoolForm({ ...poolForm, type: e.target.value })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-gray-700">固定池</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editPoolType"
                        value="random"
                        checked={poolForm.type === 'random'}
                        onChange={(e) => setPoolForm({ ...poolForm, type: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">随机池</span>
                    </label>
                  </div>
                </div>
                {poolForm.type === 'random' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">每次抽取数量</label>
                    <input
                      type="number"
                      min="1"
                      value={poolForm.random_count}
                      onChange={(e) => setPoolForm({ ...poolForm, random_count: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                  <textarea
                    value={poolForm.description}
                    onChange={(e) => setPoolForm({ ...poolForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowEditPoolModal(false); setSelectedPool(null); }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdatePool}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 文件选择模态框 */}
        {showFileSelector && selectedPool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">为「{selectedPool.name}」添加文件</h3>
                <button onClick={() => setShowFileSelector(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {availableFiles.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p>暂无可用文件</p>
                    <p className="text-sm">请先在文件存储中上传文件</p>
                  </div>
                ) : (
                  availableFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        file.selected = !file.selected;
                        setAvailableFiles([...availableFiles]);
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        file.selected
                          ? 'bg-purple-50 border border-purple-200'
                          : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          file.inPool ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          {file.file_type.includes('pdf') ? (
                            <span className="text-lg">📄</span>
                          ) : file.file_type.includes('image') ? (
                            <span className="text-lg">🖼️</span>
                          ) : (
                            <span className="text-lg">📁</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.file_name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">
                              {file.file_type.split('/')[1]?.toUpperCase()} - {(file.file_size / 1024).toFixed(1)} KB
                            </p>
                            {file.inPool && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                已添加
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!file.inPool && (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            file.selected
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300'
                          }`}>
                            {file.selected && (
                              <FiCheck className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                        {file.inPool && (
                          <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">
                            已添加
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    availableFiles.forEach(f => f.selected = false);
                    setAvailableFiles([...availableFiles]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  清空选择
                </button>
                <button
                  onClick={handleAddFilesToPool}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600"
                >
                  添加文件
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 预览弹窗 */}
      {showPreviewModal && previewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">文件预览</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              {previewFile.file_type.startsWith('image/') ? (
                <img
                  src={previewFile.qiniu_url || `/api/file-storage/download/${previewFile.id}`}
                  alt={previewFile.file_name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : previewFile.file_type === 'application/pdf' ? (
                <embed
                  src={previewFile.qiniu_url || `/api/file-storage/download/${previewFile.id}`}
                  type="application/pdf"
                  className="w-full h-[60vh] border rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiFileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600">无法预览此文件类型</p>
                  <p className="text-sm text-gray-400 mt-1">{previewFile.file_name}</p>
                </div>
              )}
              <div className="mt-6 flex gap-4">
                <a
                  href={`/api/file-storage/download/${previewFile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  <FiDownload className="w-4 h-4" />
                  下载
                </a>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default FileStorageManagement;