# 04 - Automated Reminders with Cron Job & Email (使用 Cron Job 和邮件实现自动提醒)

## Goal (目标)
实现一个全自动的提醒系统。该系统能定时在后台运行，检查所有已安排的提醒，并在其预定时间到达时，通过电子邮件自动发送给指定收件人。

## Key Components (关键组件)

*   **Vercel Cron Jobs:** Vercel 平台提供的定时任务服务，用于按预定计划（例如每分钟）触发我们的 API 路由。
*   **Next.js API Route (`/api/cron`):** 作为 Cron Job 的执行端点。每当 Vercel Cron Job 触发时，它会向这个 URL 发送一个 GET 请求。
*   **Resend:** 我们选择的邮件发送服务（Email Service Provider），用于通过其 API 发送提醒邮件。
*   **Drizzle ORM:** 用于在 Cron Job 逻辑中查询数据库，找出所有到期的、待发送的提醒。

### 1. Setting up the Email Service (`lib/email.ts`) (设置邮件服务)

**Action (行动):**

我们创建了 `lib/email.ts` 文件来封装所有与 Resend 服务交互的逻辑。

*   **Initialization (初始化):** 脚本首先会从 `.env` 文件中加载 `RESEND_API_KEY` 环境变量，并用它来初始化 Resend 客户端。如果 API Key 未设置，程序会抛出错误，防止在配置不完整的情况下运行。
*   **`sendReminderEmail` Function (发送邮件函数):**
    *   我们定义了一个 `sendReminderEmail` 异步函数，它接收 `to`, `subject`, 和 `html` 作为参数。
    *   为了简化调用和确保测试阶段的可靠性，我们将发件人地址硬编码为 `onboarding@resend.dev`，这是 Resend 提供的测试地址。在生产环境中，这应替换为在 Resend 验证过的域名邮箱。
    *   该函数调用 `resend.emails.send()` 来发送邮件。
*   **Error Handling (错误处理):** 我们为邮件发送逻辑添加了健壮的错误处理。如果 Resend API 返回错误，我们会捕获它、记录详细信息，并将其包装成一个标准的 JavaScript Error 对象后重新抛出。这确保了上层调用者（我们的 Cron Job）能够捕获到失败信息并进行相应处理。

### 2. Implementing the Cron Job Logic (`app/api/cron/route.ts`) (实现 Cron Job 逻辑)

**Action (行动):**

这是自动提醒功能的核心。我们创建了 `app/api/cron/route.ts` 文件，它包含一个处理 `GET` 请求的函数。

*   **Querying Due Reminders (查询到期提醒):**
    *   当 `/api/cron` 被访问时，它首先会使用 Drizzle ORM 查询数据库。
    *   查询条件是：`status` 字段为 `'pending'` **并且** `sendAt` 字段的时间早于当前时间 (`new Date()`)。
    *   `await db.select().from(reminders).where(and(eq(reminders.status, 'pending'), lt(reminders.sendAt, new Date())))`
    *   这个查询精确地找出了所有“待发送”且“已到期”的提醒。

*   **Processing Reminders (处理提醒):**
    *   代码会遍历查询到的每一个提醒。
    *   在一个 `try...catch` 块内，它首先尝试调用 `sendReminderEmail` 函数来发送邮件。
    *   **On Success (如果成功):** 如果邮件发送成功，它会更新数据库中该提醒的记录，将 `status` 设置为 `'sent'`，并记录下当前的发送时间 `sentAt`。这可以防止同一封邮件被重复发送。
    *   **On Failure (如果失败):** 如果 `sendReminderEmail` 抛出错误，`catch` 块会捕获它。代码会将该提醒的 `status` 更新为 `'failed'`。这同样可以防止系统不断尝试发送一个有问题的邮件，并为后续的调试和问题排查提供了线索。

*   **Response (响应):** 任务执行完毕后，API 会返回一个 JSON 响应，其中包含了本次成功发送的提醒数量，方便监控和调试。

### 3. Environment Variables for Resend (`.env`) (为 Resend 配置环境变量)

**Action (行动):**

为了让邮件服务正常工作，我们在 `.env` 文件中添加了新的环境变量。

*   **`RESEND_API_KEY="your_resend_api_key"`:** 这个变量保存了从 Resend 平台获取的 API 密钥。
*   我们再次确认了 `.env` 文件已被添加到 `.gitignore` 中，以保护这个密钥不被泄露到代码仓库。

### 4. Configuring the Vercel Cron Job (`vercel.json`) (配置 Vercel Cron Job)

**Action (行动):**

为了让 Vercel 知道如何以及何时运行我们的定时任务，我们在项目根目录创建了 `vercel.json` 配置文件。

*   **`path": "/api/cron"`:** 指定了 Cron Job 需要调用的 API 路由。
*   **`schedule": "* * * * *"`:** 定义了 Cron Job 的执行计划。这是一个标准的 Cron 表达式，意思是“每分钟执行一次”。

这个配置使得我们的自动化系统得以完整闭环：Vercel 会每分钟调用一次我们的 API，我们的 API 会检查并处理所有到期的提醒。

---

## Key Takeaways (主要收获)

*   **Task Automation (任务自动化):** Cron Job 是实现后台任务自动化的强大工具，是许多 Web 应用（如通知、报告、数据清理）的基石。
*   **State Management is Crucial (状态管理至关重要):** 在处理定时任务时，精确地追踪每个任务的状态（如 `pending`, `sent`, `failed`）是避免重复执行或数据不一致的关键。
*   **Robustness Through Error Handling (通过错误处理增强健壮性):** 与外部服务（如邮件 API）交互时，必须实现健壮的错误处理逻辑，以便在服务失败时能够优雅地降级或重试。
*   **Infrastructure as Code (基础设施即代码):** 将 Cron Job 的配置写入 `vercel.json` 文件，是“基础设施即代码”理念的体现。它使得我们的部署配置版本化、可复现，并且更加透明。
