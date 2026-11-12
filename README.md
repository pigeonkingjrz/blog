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

## 六、评论系统（Twikoo，已上线）

已在 **Cloudflare Workers + D1** 上自建，不依赖 Vercel/第三方账号：

| 项 | 值 |
| --- | --- |
| 后端地址 | `https://twikoo.delicious-pigeonking.blog`（Worker：`twikoo-worker/`） |
| 存储 | D1 数据库 `twikoo`（评论永久存在自己账号下） |
| 管理 | 任意文章页评论区 → 小齿轮 → 用管理员密码登录 |

前端引用的 `twikoo@2.0.17` 是通过 `_config.anzhiyu.yml` 的 `CDN.option.twikoo` 覆盖的——主题默认的 1.6.44 与 2.0 后端协议不兼容，**别改回默认版本**。

留言弹幕（`comment_barrage_config`）直接吃这份评论数据，评论多了弹幕自然滚动。

## 七、音乐系统

三层结构，全部走主题原生能力 + 一个自建代理：

```
浏览器 ──> MetingJS ──> music.delicious-pigeonking.blog/api   （Cloudflare Worker，边缘缓存元数据）
                              └─> 上游音源 API ──> 302 ──> 网易云 CDN 音频
```

| 组件 | 位置 | 说明 |
| --- | --- | --- |
| 音乐胶囊（左下角常驻） | `_config.anzhiyu.yml` → `nav_music` | 全站不中断播放，`M` 键开合 |
| 音乐馆页面 | `source/music/index.md` + `music_page_default` | 大封面 / 歌词 / 随机播 / 切歌单，导航「我的 → 音乐馆」进入 |
| 文章内嵌播放器 | 文章 Markdown 里直接写 `<meting-js>` | 见下方示例 |
| 音乐 API 代理 | `../music-api/`（独立 Worker） | 元数据缓存 1 小时，音频 302 直连，不中转流量 |

### 换成你自己的歌单

1. 在网易云打开歌单 → 分享 → 复制链接，形如 `https://music.163.com/playlist?id=123456789`，其中 `123456789` 就是歌单 id。
2. 改 `_config.anzhiyu.yml`：

```yaml
nav_music:
  id: 123456789                       # ← 你的歌单 id
  all_playlist: https://music.163.com/#/playlist?id=123456789
```

3. `npx hexo clean && npx hexo generate`，再部署。音乐馆和胶囊会同时换成新歌单（因为 `music_page_default: nav_music`）。

### 在文章里插入播放器

```html
<!-- 整张歌单 -->
<meting-js server="netease" type="playlist" id="123456789"
  mutex="true" preload="none" order="list" list-folded="true"
  theme="var(--anzhiyu-main)" list-max-height="360px"></meting-js>

<!-- 单曲：id 换成歌曲 id -->
<meting-js server="netease" type="song" id="1973665667"
  mutex="true" preload="none" theme="var(--anzhiyu-main)"></meting-js>
```

`mutex="true"` 保证多个播放器不会同时响。

### 上游挂了怎么办

`music-api/src/index.js` 顶部 `UPSTREAM` 一行就是上游地址，改成任何兼容 Meting 协议的实例即可（如 `https://api.i-meto.com/meting/`），然后在该目录 `npx wrangler deploy`。博客端不用动。

## 八、常用定制位置

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
| 歌单 id / 音量 / 音乐馆    | `_config.anzhiyu.yml` → `nav_music`（详见第七节）                                          |

## 九、目录结构

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

## 十、常见问题

**Q：改了配置不生效？**  
先 `npm run clean` 再 `npm run build`。浏览器强刷（Cmd+Shift+R）。

**Q：主题里的图片/字体加载慢或 404？**  
主题默认引用了 `npm.elemecdn.com`、`bu.dusays.com` 等国内 CDN。若失效，把这些 URL 换成自己的图床或放到 `source/img/` 本地引用。

**Q：文章链接是 `/posts/xxxx/` 这种奇怪字符？**  
正常，这是 `hexo-abbrlink` 生成的短链（crc32），比中文 URL 更稳、更方便分享。想改回日期形式就删掉 `_config.yml` 里的 `abbrlink` 段，并把 `permalink` 改成 `:year/:month/:day/:title/`。

**Q：音乐播放器转圈 / 不出声？**  
先直接访问 `https://music.delicious-pigeonking.blog/health` 看 API 是否活着；再看浏览器控制台有没有 CORS 报错。若上游音源挂了，改 `music-api/src/index.js` 的 `UPSTREAM` 重新部署即可（第七节末）。

**Q：部署后样式错乱？**  
检查 Pages 的构建输出目录必须是 `public`，且 `url` 与真实域名一致。

---

## TODO（需要你本人操作）

- [x] 把 `_config.yml` 的 `url` 改成真实域名（`https://www.delicious-pigeonking.blog` ✅）
- [x] 注册域名 `delicious-pigeonking.blog`（已在 Spaceship 购得，1 年）
- [x] Cloudflare Pages 部署 + 绑定域名 + DNS 记录
- [x] 部署 Twikoo（Workers + D1）并开启评论与弹幕
- [x] 换掉头像、favicon、文章封面
- [x] 音乐系统（音乐胶囊 + 音乐馆 + 文章内嵌播放器 + 自建 API）
- [ ] **把歌单换成自己的**（`nav_music.id`，见第七节）
- [ ] 首次进评论区小齿轮设置 Twikoo 管理员密码
- [ ] 旧站 `pigeonkingjrz.github.io` 推 301 跳转（文件已备在 `../oldsite-redirect/`）
