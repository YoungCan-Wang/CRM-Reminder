# 03 - Database Integration (数据库集成)

## Database Setup with Drizzle ORM (使用 Drizzle ORM 设置数据库)

**Goal (目标):** 将我们应用的提醒数据持久化存储到 PostgreSQL 数据库中，确保数据不会丢失，并能被后续的定时任务读取和处理。

**Key Components (关键组件):**

*   **Vercel Postgres:** 我们选择的托管 PostgreSQL 数据库服务，它与 Vercel 平台无缝集成，提供了稳定可靠的数据库后端。
*   **Drizzle ORM:** 一个轻量级、类型安全的 TypeScript ORM（对象关系映射器），它允许我们使用 TypeScript 代码来定义数据库 schema 并执行数据库操作，而无需直接编写 SQL 语句。
*   **`dotenv` / `dotenv-cli` / `ts-node`:** 这些工具用于管理环境变量（特别是数据库连接字符串），并允许我们直接运行 TypeScript 文件，这对于开发和运行 Drizzle 相关的 CLI 命令至关重要。

### 1. Install Dependencies (安装依赖)

**Action (行动):**

我们首先安装了所有必要的 npm 包，包括 Drizzle ORM 核心库、PostgreSQL 客户端、以及 Drizzle CLI 和 TypeScript 运行环境所需的开发依赖。

*   `npm install dotenv drizzle-orm pg`：安装运行时依赖，`dotenv` 用于加载环境变量，`drizzle-orm` 是 ORM 核心，`pg` 是 PostgreSQL 的 Node.js 客户端。
*   `npm install -D drizzle-kit ts-node @types/pg dotenv-cli`：安装开发依赖，`drizzle-kit` 是 Drizzle 的命令行工具，`ts-node` 允许直接运行 TypeScript 文件，`@types/pg` 提供了 `pg` 库的 TypeScript 类型定义，`dotenv-cli` 用于在命令行中加载 `.env` 文件。

### 2. Environment Variables (`.env`) (环境变量)

**Action (行动):**

为了安全地存储数据库连接信息，我们在项目根目录创建了 `.env` 文件，并添加了 `DATABASE_URL` 变量。

*   **`DATABASE_URL="your_connection_string"`:** 这个变量包含了连接到 Vercel Postgres 数据库所需的所有信息（用户名、密码、主机、端口、数据库名等）。
    *   **Note (注意):** 这个 `DATABASE_URL` 是从 Vercel 平台获取的（或者如果你通过 Prisma Accelerate 获得，它会指向 `db.prisma.io`）。它包含 `sensitive information【敏感信息】`，因此**绝不能**将其提交到 Git 仓库中。我们已将 `.env` 添加到 `.gitignore` 文件中以防止意外提交。

### 3. Drizzle Configuration (`drizzle.config.ts`) (Drizzle 配置)

**Action (行动):**

我们创建了 `drizzle.config.ts` 文件，用于配置 `drizzle-kit` 工具，告诉它如何找到我们的数据库 schema 和生成迁移文件。

*   **`schema: './db/schema.ts'`:** 指定 Drizzle 在哪里找到我们的数据库表定义。
*   **`out: './drizzle'`:** 指定生成的迁移文件将存放的目录。
*   **`dialect: 'postgresql'`:** 明确告诉 Drizzle 我们使用的是 PostgreSQL 数据库方言。
*   **`dbCredentials`:** 这是连接数据库所需的凭证。
    *   **Challenges (挑战):** 在配置 `drizzle.config.ts` 时，我们遇到了类型错误。最初尝试使用 `connectionString`，但 `drizzle-kit` 在 `build` 过程中要求将数据库凭证分解为单独的组件（`host`, `user`, `password`, `database`, `ssl`）。
    *   **Resolution (解决方案):** 我们修改了 `drizzle.config.ts`，引入了 Node.js 的 `URL` 模块来解析 `DATABASE_URL` 字符串，并从中提取出 `host`、`port`、`user`、`password`、`database` 和 `ssl` 等单独的凭证信息，然后将这些信息传递给 `dbCredentials`。这满足了 `drizzle-kit` 在构建和迁移过程中对凭证格式的严格要求。

### 4. Define Schema (`db/schema.ts`) (定义数据模型)

**Action (行动):**

我们创建了 `db/schema.ts` 文件，使用 Drizzle ORM 提供的 API 来定义 `reminders` 表的结构。这使得我们可以用 TypeScript 的方式来描述数据库表，而不是直接写 SQL。

*   **`reminders` 表字段 (Fields):**
    *   `id`: 自增主键。
    *   `email`: 收件人邮箱。
    *   `message`: 提醒消息内容。
    *   `sendAt`: 计划发送时间（带时区）。
    *   `createdAt`: 提醒创建时间（默认当前时间）。
    *   `sentAt`: 实际发送时间（可为空，直到发送成功）。
    *   `status`: 提醒的当前状态（使用 `pgEnum` 定义为 `pending`、`sent`、`failed`，默认为 `pending`）。

### 5. Database Client (`db/index.ts`) (数据库客户端)

**Action (行动):**

我们创建了 `db/index.ts` 文件，用于初始化 Drizzle ORM 的数据库客户端实例 `db`。这个 `db` 对象将是我们应用程序中所有数据库操作的入口点。

*   它加载 `.env` 文件中的环境变量（特别是 `DATABASE_URL`）。
*   使用 `pg` 库创建一个 PostgreSQL 连接池。
*   通过 `drizzle` 函数将连接池和我们定义的 `schema` 绑定，生成可用于查询的 `db` 客户端。

### 6. Database Migrations (数据库迁移)

**Action (行动):**

数据库迁移是管理数据库 schema 变更的关键步骤。我们使用 `drizzle-kit` 来生成和应用迁移。

*   **Generate Migration (生成迁移):** 运行 `npx drizzle-kit generate` 命令。这个命令会根据 `db/schema.ts` 中定义的 schema 变化，在 `drizzle/` 目录下生成一个新的 SQL 迁移文件（例如 `0000_closed_the_santerians.sql`）。
    *   **Challenges (挑战):** 在此步骤中，我们多次遇到 `drizzle-kit` 配置错误，主要是 `dialect` 和 `driver` 属性的问题，以及 `DATABASE_URL` 无法被正确识别的问题。
*   **Apply Migration (应用迁移):** 运行 `npm run db:migrate` 命令。这个命令会连接到你的 Vercel Postgres 数据库，并执行生成的 SQL 迁移文件，从而在数据库中创建或更新表结构。
    *   **Challenges (挑战):**
        *   **`DATABASE_URL` 无法被 CLI 工具识别:** `drizzle-kit migrate` 命令无法直接从 `.env` 文件中加载 `DATABASE_URL`。
            *   **Resolution (解决方案):** 我们尝试了 `dotenv-cli`，但最终采用了更 `robust【健壮的】` 的方法：创建了一个自定义的 Node.js TypeScript 脚本 `db/migrate.ts`。这个脚本会显式地加载 `.env` 文件，然后通过 Drizzle 的编程 API 来执行迁移。这样确保了 `DATABASE_URL` 在迁移过程中始终可用。
        *   **`ts-node` `pg` 类型定义错误 (`TS7016`):** 在运行 `db/migrate.ts` 时，TypeScript 编译器抱怨找不到 `pg` 库的类型定义。
            *   **Resolution (解决方案):** 安装了 `pg` 库的 TypeScript 类型定义包 `@types/pg` (`npm install -D @types/pg`)，解决了类型检查问题。

### 7. Integrate Database into API Route (`app/api/schedule/route.ts`) (将数据库集成到API路由)

**Action (行动):**

这是将前端数据真正保存到数据库的关键一步。我们修改了处理提醒调度请求的 API 路由。

*   **导入 `db` 客户端和 `reminders` schema:** 在 `app/api/schedule/route.ts` 中，我们导入了之前在 `db/index.ts` 中创建的 `db` 客户端实例和 `db/schema.ts` 中定义的 `reminders` 表 schema。
*   **执行插入操作:** 使用 `await db.insert(reminders).values(...)` 方法，将前端提交的 `email`、`message` 和 `sendAt` 数据插入到 `reminders` 表中。`returning()` 方法确保在插入成功后，返回新创建的记录（包括数据库自动生成的 `id` 和 `createdAt`），方便后续处理或调试。

### 8. View Reminders Feature (`app/api/reminders/route.ts` & `app/page.tsx`) (查看提醒功能)

**Action (行动):**

为了方便用户直接在应用界面上查看已调度的提醒，我们增加了这个功能。

*   **创建新的 API 路由 (`app/api/reminders/route.ts`):** 这个新的 API 端点用于处理 `GET` 请求。它会从数据库中查询 `reminders` 表中的所有记录，并以 JSON 格式返回给前端。
*   **修改前端 (`app/page.tsx`):**
    *   添加了一个 `View All Reminders` 按钮。
    *   实现了一个 `fetchReminders` 异步函数，当按钮被点击时，它会调用 `/api/reminders` API 来获取提醒列表。
    *   使用 React 的 `useState` 来存储获取到的提醒列表，并在页面上以列表形式展示出来，包括收件人、消息、发送时间和当前状态。

---

## Key Takeaways (主要收获)

*   **Drizzle ORM** 极大地简化了 TypeScript 应用程序与关系型数据库（如 PostgreSQL）的交互，提供了类型安全的查询构建器。
*   **数据库迁移 (Migrations)** 是管理数据库 schema 变更的 `essential tool【必不可少的工具】`，确保开发环境和生产环境的数据库结构一致。
*   **环境变量管理 (Environment variable management)** 对于 CLI 工具来说可能比较复杂，通常需要通过 `dotenv-cli` 或自定义脚本来确保环境变量被正确加载。
*   **全栈集成 (Full-stack integration)** 是将前端用户界面、后端 API 逻辑和数据库操作连接起来的过程，形成一个完整的数据流。
*   **调试 (Debugging)** 是开发过程中不可避免的一部分。理解错误信息并系统地尝试解决方案是 `crucial skills【关键技能】`。