'use client'; // 标记为客户端组件，允许使用React Hooks和处理用户交互

import { useState } from 'react'; // 导入useState Hook，用于管理组件状态

export default function Home() {
  // 定义状态变量，用于存储表单输入值和提交状态
  const [email, setEmail] = useState(''); // 收件人邮箱
  const [message, setMessage] = useState(''); // 消息内容
  const [sendAt, setSendAt] = useState(''); // 发送时间
  const [status, setStatus] = useState(''); // 提交状态或反馈信息
  const [fetchedReminders, setFetchedReminders] = useState([]); // 新增：用于存储从数据库获取的提醒列表

  // 处理表单提交的异步函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为（页面刷新）
    setStatus('Scheduling...'); // 更新状态，向用户显示正在处理

    try {
      // 发送POST请求到后端API路由 /api/schedule
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 告知服务器请求体是JSON格式
        },
        body: JSON.stringify({ email, message, sendAt }), // 将表单数据转换为JSON字符串发送
      });

      const data = await response.json(); // 解析API返回的JSON响应

      // 根据API响应的状态码判断请求是否成功
      if (response.ok) { // HTTP状态码在200-299之间表示成功
        setStatus('Reminder scheduled successfully!'); // 显示成功消息
        // 成功后清空表单
        setEmail('');
        setMessage('');
        setSendAt('');
        // 提交成功后，刷新提醒列表
        fetchReminders();
      } else {
        // 显示API返回的错误信息，或通用错误信息
        setStatus(`Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      // 捕获网络错误或其他异常
      console.error('Submission error:', error);
      setStatus('Error: Could not connect to the server.');
    }
  };

  // 新增：获取提醒列表的异步函数
  const fetchReminders = async () => {
    setStatus('Fetching reminders...');
    try {
      const response = await fetch('/api/reminders');
      const data = await response.json();

      if (response.ok) {
        setFetchedReminders(data.reminders); // 更新状态，存储获取到的提醒列表
        setStatus('Reminders loaded.');
      } else {
        setStatus(`Error fetching reminders: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Fetch reminders error:', error);
      setStatus('Error: Could not connect to the server to fetch reminders.');
    }
  };

  return (
    // 主布局容器，居中显示表单
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Schedule a Reminder</h1>
        
        {/* 表单区域 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 邮箱输入框 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Recipient Email
            </label>
            <input
              id="email"
              type="email"
              value={email} // 绑定到email状态变量
              onChange={(e) => setEmail(e.target.value)} // 输入变化时更新email状态
              required // 必填字段
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* 消息内容文本域 */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              value={message} // 绑定到message状态变量
              onChange={(e) => setMessage(e.target.value)} // 输入变化时更新message状态
              required // 必填字段
              rows={4} // 文本域行数
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* 发送时间输入框 */}
          <div>
            <label htmlFor="sendAt" className="block text-sm font-medium text-gray-700">
              Send At
            </label>
            <input
              id="sendAt"
              type="datetime-local" // HTML5日期时间选择器
              value={sendAt} // 绑定到sendAt状态变量
              onChange={(e) => setSendAt(e.target.value)} // 输入变化时更新sendAt状态
              required // 必填字段
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Schedule Reminder
          </button>
        </form>
        
        {/* 状态消息显示区域 */}
        {status && (
          <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
        )}

        {/* 新增：查看提醒按钮 */}
        <button
          onClick={fetchReminders}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4"
        >
          View All Reminders
        </button>

        {/* 新增：提醒列表显示区域 */}
        {fetchedReminders.length > 0 && (
          <div className="mt-8 w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Scheduled Reminders</h2>
            <ul className="space-y-2">
              {fetchedReminders.map((reminder: any) => (
                <li key={reminder.id} className="p-4 bg-gray-100 rounded-md shadow-sm text-sm text-gray-700">
                  <p><strong>To:</strong> {reminder.email}</p>
                  <p><strong>Message:</strong> {reminder.message}</p>
                  <p><strong>Send At:</strong> {new Date(reminder.sendAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {reminder.status}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
