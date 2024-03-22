<!DOCTYPE HTML>
<html lang="en">
<head>
    <title>${title}</title>
    <link rel="shortcut icon" href="/public/favicon.ico"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <!-- inject:css -->
    <link href="/public/css/app.css" rel="stylesheet">
    <!-- endinject -->
    <script defer src="/public/js/app.js"></script>
    <script defer src="/public/js/node_modules_leaflet_dist_images_marker-icon_png.chunk.js"></script>
    <script defer src="/public/js/node_modules_leaflet_dist_images_marker-icon-2x_png.chunk.js"></script>
    <script defer src="/public/js/node_modules_leaflet_dist_images_marker-shadow_png.chunk.js"></script>
    <script defer src="/public/js/node_modules_leaflet_dist_leaflet-src_esm_js.chunk.js"></script>
    <script defer src="/public/js/node_modules_leaflet_dist_leaflet-src_js.chunk.js"></script>
</head>
<body>
<div id="app" :class="language" data-user="${user}" data-title="${title}"></div>
<script>
    var currentUser = "${user}"
</script>
</body>
</html>
