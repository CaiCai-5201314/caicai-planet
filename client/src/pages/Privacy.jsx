import { Link } from 'react-router-dom';
import { FiArrowLeft, FiDatabase, FiLock, FiShare2, FiUser, FiShield, FiMail, FiTrash2 } from 'react-icons/fi';
import Navbar from '../components/Navbar';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-planet-purple transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>返回首页</span>
            </Link>
          </div>

          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">隐私政策</h1>
            <p className="text-gray-600">最后更新日期：2026年4月14日</p>
          </div>

          {/* 内容 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
            {/* 欢迎语 */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                菜菜星球（以下简称"本平台"）非常重视您的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您仔细阅读以下内容，以便更好地了解我们的隐私保护措施。
              </p>
            </section>

            {/* 第一条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-planet-purple/10 flex items-center justify-center">
                  <FiDatabase className="text-planet-purple" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">一、信息收集</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>1.1 我们收集的信息类型：</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li><strong>注册信息</strong>：用户名、邮箱地址、密码等账号注册所需信息</li>
                  <li><strong>个人资料</strong>：昵称、头像、个人简介等您主动填写的信息</li>
                  <li><strong>使用数据</strong>：您在本平台的浏览记录、操作日志、IP地址、设备信息等</li>
                  <li><strong>内容数据</strong>：您发布的文章、评论、任务、任务提议等内容</li>
                  <li><strong>互动数据</strong>：点赞、收藏、关注、打卡签到等互动行为记录</li>
                  <li><strong>账户数据</strong>：您的积分、经验值、月球分、等级、权限设置等账户相关数据</li>
                  <li><strong>任务数据</strong>：您接取、完成的任务记录，任务提议和审核记录等</li>
                </ul>
                <p>1.2 我们使用 Cookie 和类似技术来收集您的浏览信息，以改善用户体验。</p>
                <p>1.3 我们可能从第三方服务（如社交账号登录）获取您授权共享的信息。</p>
                <p>1.4 如您是主账号管理员，我们还会收集您创建的子账号相关信息及其操作记录。</p>
              </div>
            </section>

            {/* 第二条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FiLock className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">二、信息使用</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>2.1 我们使用您的信息用于以下目的：</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>提供、维护和改进本平台服务</li>
                  <li>验证您的身份，防止欺诈和滥用</li>
                  <li>向您发送服务通知、安全警报和更新信息</li>
                  <li>个性化推荐内容，改善用户体验</li>
                  <li>进行数据分析和研究，以优化我们的服务</li>
                  <li>管理您的积分、经验值、月球分、等级等账户数据</li>
                  <li>处理任务提议、审核、完成和奖励发放</li>
                  <li>管理打卡签到记录和连续打卡奖励</li>
                  <li>遵守法律法规要求</li>
                </ul>
                <p>2.2 月球分可能会根据系统规则进行定期衰减，我们会记录相关衰减操作，以确保系统公平性。</p>
                <p>2.3 我们不会将您的个人信息用于本政策未明确说明的其他用途。</p>
              </div>
            </section>

            {/* 第三条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <FiShare2 className="text-green-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">三、信息共享</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>3.1 我们不会出售、出租或以其他方式向第三方出售您的个人信息。</p>
                <p>3.2 在以下情况下，我们可能会共享您的信息：</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li><strong>经您同意</strong>：在获得您的明确同意后，向第三方共享</li>
                  <li><strong>服务提供商</strong>：向为我们提供技术支持的第三方服务商共享必要信息</li>
                  <li><strong>法律要求</strong>：根据法律法规、法院命令或政府要求而披露</li>
                  <li><strong>保护权益</strong>：为保护本平台、用户或公众的合法权益而必要披露</li>
                </ul>
                <p>3.3 我们的服务提供商有义务保护您的信息安全，且只能按照我们的指示使用您的信息。</p>
              </div>
            </section>

            {/* 第四条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <FiShield className="text-yellow-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">四、信息保护</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>4.1 我们采取多种安全措施保护您的个人信息：</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>使用加密技术保护数据传输安全</li>
                  <li>采用防火墙和入侵检测系统防止未经授权访问</li>
                  <li>定期进行安全审计和漏洞扫描</li>
                  <li>对员工进行数据安全培训，限制数据访问权限</li>
                </ul>
                <p>4.2 尽管我们努力保护您的信息安全，但互联网传输无法保证绝对安全。请您妥善保管账号密码，定期更换密码。</p>
                <p>4.3 如发生数据泄露事件，我们将及时通知受影响的用户，并采取补救措施。</p>
              </div>
            </section>

            {/* 第五条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FiUser className="text-purple-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">五、您的权利</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>5.1 您对自己的个人信息享有以下权利：</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li><strong>访问权</strong>：您有权查看我们持有的关于您的个人信息</li>
                  <li><strong>更正权</strong>：您有权更正不准确或不完整的个人信息</li>
                  <li><strong>删除权</strong>：您有权要求删除您的个人信息（法律法规要求保留的除外）</li>
                  <li><strong>限制处理权</strong>：您有权要求限制对您个人信息的处理</li>
                  <li><strong>数据可携带权</strong>：您有权获取您的个人信息副本</li>
                  <li><strong>反对权</strong>：您有权反对我们处理您的个人信息</li>
                </ul>
                <p>5.2 如需行使上述权利，请通过本政策末尾的联系方式与我们联系。</p>
              </div>
            </section>

            {/* 第六条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FiTrash2 className="text-red-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">六、信息存储与删除</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>6.1 您的个人信息将存储在我们的服务器上，服务器位于中国境内。</p>
                <p>6.2 我们将在实现本政策所述目的所需的期限内保留您的信息，除非法律要求或允许更长的保留期。</p>
                <p>6.3 当您删除账号或要求我们删除信息时，我们将在合理期限内删除您的个人信息，但法律法规要求保留的信息除外。</p>
              </div>
            </section>

            {/* 第七条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <FiUser className="text-indigo-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">七、未成年人保护</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>7.1 本平台不向未满14周岁的未成年人提供服务。</p>
                <p>7.2 如果我们发现收集了未成年人的个人信息，将立即删除相关信息。</p>
                <p>7.3 如您是未成年人的监护人，发现未成年人向我们提供了个人信息，请联系我们删除。</p>
              </div>
            </section>

            {/* 第八条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <FiMail className="text-pink-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">八、联系我们</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>如您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：</p>
                <p>邮箱：caicaifensi520@163.com</p>
                <p>我们将在收到您的请求后15个工作日内回复。</p>
              </div>
            </section>

            {/* 第九条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <FiUser className="text-indigo-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">九、子账号与授权</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>9.1 如您是主账号管理员，您创建的子账号相关信息将与您的主账号关联存储。</p>
                <p>9.2 子账号的操作记录将被记录和存储，以确保平台安全和责任追溯。</p>
                <p>9.3 主账号管理员可以查看和管理其子账号的所有活动和数据。</p>
                <p>9.4 子账号的数据保护适用本隐私政策的所有条款。</p>
              </div>
            </section>

            {/* 第十条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FiShield className="text-gray-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">十、政策更新</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>10.1 我们可能会不时更新本隐私政策，更新后的政策将在本页面公布。</p>
                <p>10.2 重大变更时，我们将通过邮件或站内通知的方式告知您。</p>
                <p>10.3 继续使用本平台服务即表示您同意更新后的隐私政策。</p>
              </div>
            </section>

            {/* 底部提示 */}
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                点击"同意"即表示您已阅读并同意以上隐私政策
              </p>
              <div className="mt-4 space-x-4">
                <Link
                  to="/register"
                  className="inline-block px-8 py-3 bg-planet-purple text-white rounded-full font-medium hover:bg-planet-purple/90 transition-colors"
                >
                  同意并返回注册
                </Link>
                <Link
                  to="/terms"
                  className="inline-block px-8 py-3 border border-gray-200 text-gray-700 rounded-full font-medium hover:border-planet-purple hover:text-planet-purple transition-colors"
                >
                  查看服务条款
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
