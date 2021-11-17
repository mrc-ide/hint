<!DOCTYPE HTML>
<html lang="en">
<head>
    <title>${title}</title>
    <link rel="shortcut icon" href="/public/favicon.ico"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <!-- inject:css -->
    <!-- endinject -->
</head>
<body>
<div id="app" :class="language">
    <loading-spinner></loading-spinner>
    <errors title="${title}"></errors>
</div>
<script>
    var currentUser = "${user}";
</script>
</body>
</html>