/**
 * 音乐馆页面歌单 id 同步脚本
 *
 * 背景：anzhiyu 主题的 source/js/utils.js 里 getCustomPlayList() 把 /music 页面
 * 默认加载的歌单 id 硬编码成了主题作者的歌单（8152976493），既不跟随
 * _config.anzhiyu.yml 的 nav_music.id，也无法通过主题配置覆盖。
 *
 * 这里在生成完成后（after_generate）直接改写产物 public/js/utils.js，
 * 让它读取 nav_music.id —— 单一数据源，改配置即可，无需手动改主题源码。
 *
 * 注意：node_modules 里的主题文件保持原样，npm install 后依然生效。
 */

"use strict";

const fs = require("fs");
const path = require("path");

const HARDCODED = /const userId = "\d+";/;

hexo.extend.filter.register("after_generate", () => {
  const navMusic = (hexo.theme.config && hexo.theme.config.nav_music) || {};
  const id = navMusic.id;
  const server = navMusic.server || "netease";

  if (!id) return;

  const file = path.join(hexo.public_dir, "js", "utils.js");
  if (!fs.existsSync(file)) return;

  let src = fs.readFileSync(file, "utf8");
  if (!HARDCODED.test(src)) {
    hexo.log.debug("music-page-id: 未找到硬编码歌单 id，跳过（主题结构可能已变化）");
    return;
  }

  src = src.replace(HARDCODED, `const userId = "${id}";`);
  src = src.replace(/const userServer = "\w+";/, `const userServer = "${server}";`);
  fs.writeFileSync(file, src);

  hexo.log.info("music-page-id: 音乐馆歌单已同步为 server=%s id=%s", server, id);
});
