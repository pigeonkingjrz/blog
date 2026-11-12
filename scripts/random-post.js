// 生成 /random/ 页面：随机跳转到一篇文章
hexo.extend.generator.register('randomPost', function (locals) {
  const paths = locals.posts.toArray().map(p => '/' + p.path);
  const list = JSON.stringify(paths);
  const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>正在随机前往一篇文章…</title></head>
<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;background:#f7f7f9;color:#666">
<div style="text-align:center"><h1 style="font-size:18px;font-weight:600">🎲 正在随机前往一篇文章…</h1><p style="font-size:14px;color:#999">如果没有跳转，<a href="/" style="color:#425aef">点这里回主页</a></p></div>
<script>
var posts = ${list};
var target = posts[Math.floor(Math.random() * posts.length)];
location.replace(target);
</script></body></html>`;
  return { path: 'random/index.html', data: html };
});
