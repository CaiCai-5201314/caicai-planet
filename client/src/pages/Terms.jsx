import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiUser, FiFileText, FiAlertCircle, FiMail } from 'react-icons/fi';
import Navbar from '../components/Navbar';

export default function Terms() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">服务条款</h1>
            <p className="text-gray-600">最后更新日期：2026年4月4日</p>
          </div>

          {/* 内容 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
            {/* 欢迎语 */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                欢迎使用菜菜星球（以下简称"本平台"）。本服务条款（以下简称"条款"）是您与本平台之间关于使用本平台服务的协议。请您仔细阅读以下条款，一旦您注册或使用本平台服务，即表示您已同意接受这些条款的约束。
              </p>
            </section>

            {/* 第一条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-planet-purple/10 flex items-center justify-center">
                  <FiUser className="text-planet-purple" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">一、账号注册与使用</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>1.1 您需要注册一个账号才能使用本平台的某些功能。注册时，您必须提供真实、准确、完整的信息，并及时更新这些信息。</p>
                <p>1.2 您有责任保护您的账号密码安全，对使用您账号进行的所有活动负责。如发现未经授权使用您的账号，请立即通知我们。</p>
                <p>1.3 一个用户只能注册一个账号。禁止注册多个账号进行恶意操作。</p>
                <p>1.4 我们有权对违反条款的账号采取警告、限制功能、暂停或终止服务等措施。</p>
              </div>
            </section>

            {/* 第二条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FiFileText className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">二、内容规范</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>2.1 您在本平台发布的内容（包括文章、评论、任务等）必须遵守法律法规，尊重社会公德。</p>
                <p>2.2 禁止发布以下内容：</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>违反国家法律法规的内容</li>
                  <li>涉及色情、暴力、恐怖的内容</li>
                  <li>侵犯他人知识产权或隐私权的内容</li>
                  <li>虚假信息或误导性内容</li>
                  <li>垃圾信息、广告或恶意推广</li>
                  <li>煽动仇恨、歧视或对立的内容</li>
                </ul>
                <p>2.3 您发布的内容版权归您所有，但您授予本平台非独占的、免费的、永久的许可，以使用、复制、修改、发布这些内容。</p>
                <p>2.4 我们有权删除违反条款的内容，并对发布者采取相应措施。</p>
              </div>
            </section>

            {/* 第三条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <FiShield className="text-green-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">三、积分与任务规则</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>3.1 本平台设有积分系统，用户可以通过完成任务、发布内容等方式获得积分。</p>
                <p>3.2 积分仅用于本平台内的虚拟奖励，不可兑换现金或转让给他人。</p>
                <p>3.3 用户接受任务后应认真完成，不得恶意刷分或利用漏洞获取不当利益。</p>
                <p>3.4 如发现作弊行为，我们有权扣除相应积分，情节严重的将封禁账号。</p>
                <p>3.5 任务发布者应确保任务内容合法合规，不得发布违法或有害的任务。</p>
              </div>
            </section>

            {/* 第四条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <FiAlertCircle className="text-yellow-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">四、免责声明</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>4.1 本平台按"现状"提供服务，不保证服务不会中断，对服务的及时性、安全性、准确性不作担保。</p>
                <p>4.2 用户在本平台发布的内容仅代表其个人观点，不代表本平台立场。</p>
                <p>4.3 因用户行为导致的任何第三方索赔或损失，由用户自行承担全部责任。</p>
                <p>4.4 因不可抗力（如自然灾害、政府行为、网络故障等）导致的服务中断，本平台不承担责任。</p>
              </div>
            </section>

            {/* 第五条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FiFileText className="text-purple-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">五、条款修改</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>5.1 我们有权随时修改本条款，修改后的条款将在本页面公布。</p>
                <p>5.2 如您不同意修改后的条款，应停止使用本平台服务。继续使用即视为接受新条款。</p>
              </div>
            </section>

            {/* 第六条 */}
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FiMail className="text-red-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">六、联系我们</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-700">
                <p>如您对本条款有任何疑问，请通过以下方式联系我们：</p>
                <p>邮箱：caicaifensi520@163.com</p>
              </div>
            </section>

            {/* 底部提示 */}
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                点击"同意"即表示您已阅读并同意以上服务条款
              </p>
              <div className="mt-4 space-x-4">
                <Link
                  to="/register"
                  className="inline-block px-8 py-3 bg-planet-purple text-white rounded-full font-medium hover:bg-planet-purple/90 transition-colors"
                >
                  同意并返回注册
                </Link>
                <Link
                  to="/privacy"
                  className="inline-block px-8 py-3 border border-gray-200 text-gray-700 rounded-full font-medium hover:border-planet-purple hover:text-planet-purple transition-colors"
                >
                  查看隐私政策
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
