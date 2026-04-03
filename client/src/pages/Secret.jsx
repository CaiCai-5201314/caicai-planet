import React from 'react';
import Navbar from '../components/Navbar';

export default function Secret() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8 text-center">隐秘星球</h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <p className="text-lg mb-6">
              这里是隐秘星球，一个神秘的地方。内容待定...
            </p>
            <p className="text-gray-300">
              敬请期待更多精彩内容！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
