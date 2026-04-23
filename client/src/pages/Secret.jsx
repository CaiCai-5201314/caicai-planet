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
              更多奖励机制，等级，后续玩法正在陆续加入中
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
