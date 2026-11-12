/**
 * 音乐馆页面歌单 id 同步脚本
 *
 * 背景：anzhiyu 主题的 source/js/utils.js 里 getCustomPlayList() 把 /music 页面
 * 默认加载的歌单 id 硬编码成了主题作者的歌单（8152976493），既不跟随
 * _config.anzhiyu.yml 的 nav_music.id，也无法通过主题配置覆盖。
 *
 * 实现：在 after_generate 阶段改写 **路由数据**（hexo.route.set）而不是磁盘文件——
 * hexo 的执行顺序是 load()（含 after_generate）-> 把路由写入 public/，
 * 直接改磁盘会被路由写盘覆盖；改路由数据则落盘的就是补丁后的内容。
 * 单一数据源：改 _config.anzhiyu.yml 的 nav_music.id 即可，无需动主题源码。
 */

"use strict";

const HARDCODED = /const userId = "\d+";/;

function readRoute(route, path) {
  return new Promise((resolve, reject) => {
    const stream = route.get(path);
    if (!stream) return resolve(null);
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
}

hexo.extend.filter.register("after_generate", async () => {
  const navMusic = (hexo.theme.config && hexo.theme.config.nav_music) || {};
  const id = navMusic.id;
  const server = navMusic.server || "netease";

  if (!id) return;

  const route = hexo.route;
  const file = "js/utils.js";
  if (!route.get(file)) return;

  let src = await readRoute(route, file);
  if (!src) return;

  if (!HARDCODED.test(src)) {
    hexo.log.debug("music-page-id: 未找到硬编码歌单 id，跳过（主题结构可能已变化）");
    return;
  }

  src = src.replace(HARDCODED, `const userId = "${id}";`);
  src = src.replace(/const userServer = "\w+";/, `const userServer = "${server}";`);
  route.set(file, src);

  hexo.log.info("music-page-id: 音乐馆歌单已同步为 server=%s id=%s", server, id);
});
