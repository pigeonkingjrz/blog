/**
 * 首页 todayCard（随笔捡拾入口卡）按钮修补
 *
 * 背景：anzhiyu 的 todayCard 右下角按钮硬编码为「更多推荐」，
 * 点击行为是 anzhiyu.hideTodayCard()（收起卡片、露出下面的文章卡）。
 * todayCard 被用作「随笔捡拾」入口后，这个按钮语义不对。
 *
 * 实现：挂在 after_render:html 上，只处理首页（path === 'index.html'）：
 *   - 按钮文字：更多推荐 -> 去捡一篇
 *   - 点击行为：收起卡片 -> 跳转 /essay/
 *
 * 注意：after_generate 钩子跑在写盘之前，改磁盘文件会被路由覆盖，
 * 所以这里必须在渲染阶段改；node_modules 里的主题文件保持原样。
 */

"use strict";

const BTN_TEXT = /<span class="banner-button-text">更多推荐<\/span>/g;
// pug 输出的引号风格可能变化，单双引号都兼容
const BTN_ONCLICK =
  /onclick=(?:"event\.stopPropagation\(\);event\.preventDefault\(\);anzhiyu\.hideTodayCard\(\);"|'event\.stopPropagation\(\);event\.preventDefault\(\);anzhiyu\.hideTodayCard\(\);')/g;

hexo.extend.filter.register("after_render:html", function (str, data) {
  if (!data || data.path !== "index.html") return str;

  const essayPath =
    (hexo.theme.config.home_top && hexo.theme.config.home_top.banner.link) ||
    "/essay/";

  let out = str.replace(BTN_TEXT, '<span class="banner-button-text">去捡一篇</span>');
  out = out.replace(BTN_ONCLICK, `onclick="location.href='${essayPath}'"`);

  if (out !== str) {
    hexo.log.info("home-today-card: todayCard 按钮已改为跳转 %s", essayPath);
  }
  return out;
});
