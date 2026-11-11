# Delicious-PigeonKing 博客

Hexo 8 + 安知鱼主题（anzhiyu 1.7.0），静态托管在 Cloudflare Pages，零服务器维护。

---

## 一、本地开发

```bash
cd blog
npm install          # 首次
npm run server       # 本地预览 http://localhost:4000
npm run build        # 构建到 public/
npm run clean        # 清理缓存（改了配置没生效时先跑这个）
```

## 二、写文章

```bash
npm run new -- "文章标题"
```

会生成 `source/_posts/2026-11-11-文章标题.md`，打开后按模板填写：

```yaml
---
title: 文章标题
date: 2026-11-11 10:30:00
categories:
  - 生活日常
tags:
  - 随笔
cover: /img/xxx.jpg        # 封面图，可留空
description: 一句话摘要，会显示在首页卡片上
---

正文……



这里之后的内容只在文章详情页显示（首页显示摘要，截止到 more 标记）。
```

**图片**：把图片放进 `source/img/`，正文里写 `![](/img/图片名.png)`。  
（`post_asset_folder: true` 已开启，也可以在文章同名文件夹里放图，用相对路径引用。）

## 三、部署到 Cloudflare Pages

> **现状（2026-11-11 已上线）**：项目名 `blog`，生产地址 **<https://www.delicious-pigeonking.blog>**，备用 `https://blog-5xy.pages.dev`。
> 当前采用「本地构建 + wrangler 直传」方式发布（非 Git 自动构建）。

### 日常发布（当前方式，最快）

```bash
cd blog
npx hexo clean && npx hexo generate
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=2a0e102650d3ff9565d8d4dbe606f5e5 \
  npx wrangler pages deploy public --project-name=blog --branch=main
```

> 注意：本机访问 GitHub/Cloudflare 时需先 `unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy` 绕过内置代理，否则连接超时。

### 可选：改成 Git 自动构建

1. Cloudflare 控制台 → **Workers & Pages** → `blog` → **Settings → Build** → 关联 GitHub 仓库 `pigeonkingjrz/blog`。
2. 构建命令 `npx hexo generate`，输出目录 `public`，环境变量 `NODE_VERSION=20`。
3. 之后 `git push` 即自动部署。

### 可选：GitHub Actions 上传

`.github/workflows/deploy.yml` 已写好。在仓库 **Settings → Secrets and variables → Actions** 里加两个 secret：

- `CLOUDFLARE_API_TOKEN`（Cloudflare 后台 → My Profile → API Tokens → 创建，权限选 *Cloudflare Pages: Edit*）
- `CLOUDFLARE_ACCOUNT_ID`（Cloudflare 后台右侧 Account ID）

推送到 `main` 即自动部署。

## 四、初始化 Git 仓库并推送

```bash
cd blog
git init -b main
git add .
git commit -m "init: hexo + anzhiyu"
git remote add origin git@github.com:Delicious-PigeonKing/你的仓库名.git
git push -u origin main
```

## 五、绑定你自己的域名

站点域名：**`www.delicious-pigeonking.blog`**（根域 `delicious-pigeonking.blog` 也一并绑上，自动跳转到 www）。

### 情况 1：域名托管在 Cloudflare（最省事，推荐）

1. Pages 项目 → **Custom domains** → **Set up a custom domain** → 输入 `www.delicious-pigeonking.blog`。
2. 因为 DNS 就在 Cloudflare，点确认后自动加好 CNAME 记录，等 1~2 分钟生效，HTTPS 证书自动签发。
3. 再添加一次根域 `delicious-pigeonking.blog`，Cloudflare 会自动加重定向。

### 情况 2：域名在 Porkbun 等其他注册商

在域名解析后台添加两条记录：

| 类型          | 主机记录  | 记录值                                   |
| ----------- | ----- | ------------------------------------- |
| CNAME       | `www` | `你的项目名.pages.dev`                     |
| ALIAS/ANAME | `@`   | `你的项目名.pages.dev`（若不支持就用 URL 转发到 www） |

然后回 Pages → Custom domains 里添加这两个域名，等待证书签发（通常几分钟）。

> **绑定完成后 `_config.yml` 的 `url` 已改为 `https://www.delicious-pigeonking.blog`，无需再改。**

## 六、接评论（Twikoo，免费）

当前评论是关闭状态（`_config.anzhiyu.yml` 中 `comments.use` 为空）。要开的话：

1. 打开 <https://twikoo.js.org/quick-start.html>，按「Vercel 部署」一键部署，得到一个 `https://xxx.vercel.app` 地址。
2. 编辑 `_config.anzhiyu.yml`：

```yaml
comments:
  use: Twikoo
  text: true

twikoo:
  envId: https://xxx.vercel.app
  region:
  visitor: true
```

1. `npm run clean && npm run build` 重新构建。

> 不想折腾后端的话，可以换 **giscus**（基于 GitHub Discussions，纯前端）：主题配置里填 `repo` / `repo_id` / `category_id`，把 `comments.use` 改成 `Giscus`。

## 七、常用定制位置

| 想改什么               | 改哪里                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------- |
| 站点标题、副标题、作者、关键词    | `_config.yml` 顶部                                                                    |
| 导航菜单               | `_config.anzhiyu.yml` → `menu`                                                      |
| 头像                 | `source/img/avatar.svg`（换成自己的图后改 `avatar.img`）                                      |
| 社交图标（GitHub/B站/邮箱） | `_config.anzhiyu.yml` → `social`                                                    |
| 友链列表               | `source/_data/link.yml`                                                             |
| 首页大图 / 各页顶部图       | `_config.anzhiyu.yml` → `index_img`、`default_top_img`、单个页面 front-matter 的 `top_img` |
| 主题色                | `_config.anzhiyu.yml` → 搜索 `mainTone` 或 `source/css/var.css` 内的 CSS 变量              |
| 页脚版权起始年份           | `_config.anzhiyu.yml` → `footer.owner.since`                                        |

## 八、目录结构

```
blog/
├── _config.yml              # 站点配置（标题/URL/插件）
├── _config.anzhiyu.yml      # 主题配置（菜单/头像/评论/页脚）
├── scaffolds/               # 新建文章模板
├── source/
│   ├── _posts/              # 文章
│   ├── _data/link.yml       # 友链数据
│   ├── about|link|comments|categories|tags/   # 独立页面
│   └── img/                 # 站点图片
├── themes → node_modules/hexo-theme-anzhiyu  # 主题（npm 管理，不落地到仓库）
├── .github/workflows/deploy.yml
├── wrangler.toml
└── public/                  # 构建产物（已 gitignore）
```

## 九、常见问题

**Q：改了配置不生效？**  
先 `npm run clean` 再 `npm run build`。浏览器强刷（Cmd+Shift+R）。

**Q：主题里的图片/字体加载慢或 404？**  
主题默认引用了 `npm.elemecdn.com`、`bu.dusays.com` 等国内 CDN。若失效，把这些 URL 换成自己的图床或放到 `source/img/` 本地引用。

**Q：文章链接是 `/posts/xxxx/` 这种奇怪字符？**  
正常，这是 `hexo-abbrlink` 生成的短链（crc32），比中文 URL 更稳、更方便分享。想改回日期形式就删掉 `_config.yml` 里的 `abbrlink` 段，并把 `permalink` 改成 `:year/:month/:day/:title/`。

**Q：部署后样式错乱？**  
检查 Pages 的构建输出目录必须是 `public`，且 `url` 与真实域名一致。

---

## TODO（需要你本人操作）

- [x] 把 `_config.yml` 的 `url` 改成真实域名（`https://www.delicious-pigeonking.blog` ✅）
- [x] 注册域名 `delicious-pigeonking.blog`（已在 Spaceship 购得，1 年）
- [ ] 创建 GitHub 仓库并推送
- [ ] Cloudflare Pages 连接仓库并首次部署
- [ ] 绑定域名 + DNS 记录
- [ ] （可选）部署 Twikoo 并开启评论
- [ ] 换掉头像 `source/img/avatar.svg`、补几张封面图
