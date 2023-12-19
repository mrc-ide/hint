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
    <script defer src="/public/js/marker-icon.chunk.js"></script>
    <script defer src="/public/js/marker-icon-2x.chunk.js"></script>
    <script defer src="/public/js/marker-shadow.chunk.js"></script>
    <script defer src="/public/js/leaflet-src.esm.chunk.js"></script>
</head>
<body>
<div id="app" :class="language" data-user="${user}" data-title="${title}"></div>
<script>
    var currentUser = "${user}"
</script>
</body>
</html>
