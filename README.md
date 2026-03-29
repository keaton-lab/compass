This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Configuration
- The project now uses YAML for configuration at `src/data/config.yaml` instead of JSON.
- To edit the configuration, modify `src/data/config.yaml` directly. The loader `src/data/config.ts` reads this YAML file at runtime and exposes a TypeScript object that matches the existing Config interface.
- If you need to re-run the loader after edits in YAML, just rebuild the project.
- Example snippet (already present in the repository):

```yaml
profile:
  name: Compass
  avatar: ""
  description: Your personal navigation hub
  bio: 快速访问常用网站和工具

settings:
  theme: dark
  showSearch: true
  layout: grid
  animations: true

categories:
- id: daily
  name: Daily
  icon: Calendar
  color: "#3b82f6"
  links:
  - id: github
    name: GitHub
    url: https://github.com
    icon: GitBranch
    description: 代码托管平台
  - id: gmail
    name: Gmail
    url: https://gmail.com
    icon: Mail
    description: 电子邮件
- id: tools
  name: Tools
  icon: Wrench
  color: "#10b981"
  links:
  - id: vercel
    name: Vercel
    url: https://vercel.com
    icon: Rocket
    description: 前端部署平台
  - id: figma
    name: Figma
    url: https://figma.com
    icon: Palette
    description: 设计协作工具
  - id: notion
    name: Notion
    url: https://notion.so
    icon: FileText
    description: 笔记与文档
  - id: chatgpt
    name: ChatGPT
    url: https://chat.openai.com
    icon: MessageSquare
    description: AI 助手
- id: dev
  name: Development
  icon: Code2
  color: "#8b5cf6"
  links:
  - id:stackoverflow
    name: Stack Overflow
    url: https://stackoverflow.com
    icon: HelpCircle
    description: 开发者问答
  - id: mdn
    name: MDN
    url: https://developer.mozilla.org
    icon: BookOpen
    description: Web 文档
  - id: npm
    name: npm
    url: https://npmjs.com
    icon: Package
    description: 包管理器
  - id: dockerhub
    name: Docker Hub
    url: https://hub.docker.com
    icon: Container
    description: 容器镜像
- id: social
  name: Social
  icon: Users
  color: "#f59e0b"
  links:
  - id: twitter
    name: Twitter
    url: https://twitter.com
    icon: AtSign
    description: 社交媒体
  - id: reddit
    name: Reddit
    url: https://reddit.com
    icon: MessageCircle
    description: 社区论坛
  - id: discord
    name: Discord
    url: https://discord.com
    icon: Headphones
    description: 即时通讯
- id: cloud
  name: Cloud
  icon: Cloud
  color: "#06b6d4"
  links:
  - id: aws
    name: AWS
    url: https://aws.amazon.com
    icon: CloudLightning
    description: 亚马逊云服务
  - id: cloudflare
    name: Cloudflare
    url: https://cloudflare.com
    icon: Shield
    description: CDN 和安全
  - id: vercel-dashboard
    name: Vercel Dashboard
    url: https://vercel.com/dashboard
    icon: Globe
    description: 部署管理
```
