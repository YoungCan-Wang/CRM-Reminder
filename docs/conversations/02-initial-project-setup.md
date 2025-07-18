# 02 - Initial Project Setup (项目初始化设置)

## Tech Stack Decision (技术栈选择)

**Gemini's Proposal (Gemini 提议):**

为了高效地构建“个人 CRM 提醒器”应用，Gemini 推荐了一套现代且高效的 `tech stack【技术栈】`。这套技术栈不仅能满足项目需求，还为未来的扩展和部署提供了便利，并且拥有慷慨的 `free tier【免费套餐】`，非常适合个人项目。

*   **Framework (框架):** Next.js (使用 React)
    *   **Reasoning (理由):** Next.js 是一个全栈的 React 框架，这意味着我们可以在同一个项目中编写前端用户界面、后端 API 逻辑以及服务器端渲染或服务器less 函数。对于 `rapid prototyping【快速原型开发】` 和快速迭代来说，这是一个 `no-brainer【明智的选择，无需思考的决定】`。
*   **Database (数据库):** Vercel Postgres (由 Supabase 提供支持)
    *   **Reasoning (理由):** Vercel Postgres 是 Vercel 官方提供的托管 PostgreSQL 数据库服务，与 Next.js 和 Vercel 的部署流程无缝集成。它是一个强大且易于设置的专业级数据库。
*   **Scheduled Tasks (定时任务):** Vercel Cron Jobs
    *   **Reasoning (理由):** Vercel Cron Jobs 允许我们通过简单的配置来设置 `cron job【定时任务】`，即在预定时间自动运行的后台任务。这极大地简化了定时任务的部署和管理，避免了自己搭建和维护调度服务器的 `heavy lifting【繁重的工作】`。
*   **Email Service (邮件服务):** Resend
    *   **Reasoning (理由):** Resend 是一个专为开发者设计的邮件发送 API。相比于直接使用 Gmail API 等需要复杂 OAuth 2.0 设置的服务，Resend 提供了极其简洁的 API 接口，只需一个 API 调用即可发送邮件。它也提供了免费套餐，非常适合开发和初期上线。

## Project Scaffolding (项目骨架搭建)

**Action (行动):**

项目初始化是构建应用的第一步，我们使用 Next.js 官方提供的工具来快速生成项目结构。

1.  **创建项目目录 (Create Project Directory):** 首先，在用户主目录下创建了一个名为 `/Users/youngcan/crm-reminder` 的新目录，作为我们项目的根目录。
2.  **使用 `create-next-app` 搭建项目 (Scaffold Project with `create-next-app`):** 接着，在新建的目录中运行 `npx create-next-app@latest` 命令来 `scaffold【搭建】` 一个新的 Next.js 项目。这个命令会自动生成所有必要的项目文件、配置和依赖。
    *   **Note (注意):** 在此过程中，由于 `run_shell_command` 工具的限制（不能直接在绝对路径下执行 `npx create-next-app`），我们采取了一个 `workaround【变通办法】`：先在临时目录创建项目，然后将文件移动到目标目录，最后清理临时目录。这确保了项目文件最终位于正确的 `/Users/youngcan/crm-reminder` 路径下。

## Frontend UI Implementation (`app/page.tsx`) (前端UI实现)

**Description (描述):**

`app/page.tsx` 文件包含了我们应用的用户界面，即用于调度提醒的表单。我们替换了 Next.js 默认的欢迎页面，构建了一个简洁的表单。

*   **Components (组件):** 表单包含用于输入 `Recipient Email`（收件人邮箱）、`Message`（消息内容）和 `Send At`（发送时间，使用 HTML5 的 `datetime-local` 类型）的输入字段，以及一个 `Schedule Reminder`（调度提醒）按钮。
*   **React Concepts (React概念):**
    *   `'use client';`: 这是 Next.js 13+ 中引入的一个指令。它将当前组件标记为 `Client Component【客户端组件】`。这意味着该组件的代码将在用户的浏览器中执行，从而能够使用 React Hooks 并响应用户交互（如表单提交、点击事件）。默认情况下，Next.js 组件是 `Server Components【服务器组件】`，在服务器端渲染。
    *   `useState`: 这是 React Hooks 中的一个核心 Hook，用于在函数组件中管理 `state【状态】`。我们使用 `useState` 来存储表单输入的值（`email`, `message`, `sendAt`）以及向用户显示的 UI `status【状态】`（例如“正在调度...”或“调度成功！”）。
        *   **Android/Java Analogy (Android/Java 对比):** 在 Android 开发中，这类似于 `Activity` 或 `Fragment` 中的成员变量，当这些变量的值发生变化时，会触发 UI 的重新绘制。或者更像 Jetpack Compose 中的 `MutableState`，或 `LiveData` / `StateFlow`，它们提供了一种响应式的方式来管理 UI 状态，当数据更新时，UI 会自动刷新。
    *   `handleSubmit`: 这是一个 `async`（异步）函数，当用户提交表单时会被调用。它会阻止表单的默认提交行为（防止页面刷新），然后异步地向后端 API 发送数据。
    *   `fetch`: 这是 Web 浏览器内置的标准 API，用于发起 HTTP 请求。我们用它来将表单数据发送到我们的后端 API 路由。
    *   `className`: 在 JSX 中，我们使用 `className` 属性来应用 CSS 样式。这里我们利用了 `Tailwind CSS` 的实用工具类（utility classes）。这种方式通过组合大量小的、单一用途的 CSS 类（如 `flex`, `p-24`, `bg-gray-50`）来直接在 HTML/JSX 中编写样式。虽然这会导致 `className` 属性看起来很长，但它极大地提高了 `rapid development【快速开发】` 效率，并实现了 `atomic styling【原子化样式】`，避免了传统 CSS 中常见的命名冲突问题。

## Backend API Route (`app/api/schedule/route.ts`) (后端API路由)

**Description (描述):**

`app/api/schedule/route.ts` 文件定义了我们的后端 API 端点，用于接收前端发送的提醒调度请求。

*   **Next.js API Routes (Next.js API路由):** Next.js 采用 `file-system routing【文件系统路由】` 的约定。任何位于 `app/api` 目录下的文件或文件夹都会被自动识别为一个 API 路由。文件或文件夹的名称决定了 API 的路径（例如 `app/api/schedule/route.ts` 对应 `/api/schedule`）。通过导出 HTTP 方法函数（如 `POST`, `GET`），Next.js 会自动将传入的 HTTP 请求路由到相应的处理函数。
    *   **Android/Java Analogy (Android/Java 对比):** 这类似于在 Java 后端框架（如 Spring Boot）中定义 RESTful API 端点。你可以在一个类中（对应 `route.ts` 文件）使用 `@RestController` 注解，并为不同的 HTTP 方法（如 `@PostMapping`）定义处理函数。
*   **Functionality (功能):**
    *   **解析请求体 (Parses Request Body):** 使用 `await request.json()` 解析传入请求的 JSON 数据，从中提取 `email`, `message`, `sendAt` 等字段。
    *   **输入验证 (Performs `input validation【输入验证】`):** 检查所有必需的字段是否存在。如果缺少任何字段，会立即返回 `400 Bad Request` 错误响应，确保数据的完整性。
    *   **日志记录 (Logging):** 在将数据保存到数据库之前，暂时将接收到的数据打印到服务器控制台，作为调试和确认数据流的 `placeholder【占位符】`。
    *   **返回响应 (Returns Response):** 使用 `NextResponse.json` 构建并返回标准的 JSON 响应，告知前端请求处理结果（成功或失败）。
*   **Error Handling (错误处理):** 包含一个 `try...catch` 块，用于捕获和处理请求处理过程中可能发生的任何错误，确保 API 的 `robust【健壮性】`。

---

## Key Takeaways (主要收获)

*   Next.js 提供了一个 `full-stack development【全栈开发】` 体验，极大地简化了前端和后端 API 的创建和集成。
*   `useState` 是 React 函数组件中管理 `component state【组件状态】` 的核心 Hook，它使得组件能够响应用户交互并更新 UI。
*   `Tailwind CSS` 是一种 `utility-first styling【实用工具优先的样式】` 方法，通过组合原子化的 CSS 类来实现快速且一致的 UI 开发。
*   API 路由是连接前端和后端之间的 `bridge【桥梁】`，它们允许客户端和服务器之间进行数据交换。