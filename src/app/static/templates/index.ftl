<!DOCTYPE HTML>
<html>
<head>
    <title>${title}</title>
    <link rel="shortcut icon" href="/public/favicon.ico"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <!-- inject:css -->
    <!-- endinject -->
</head>
<body>
<div id="app" :class="language">
    <user-header title="${title}" user="${user}"></user-header>
    <div class="container mb-5">
        <router-view></router-view>
    </div>
    <errors title="${title}"></errors>
</div>
<script>
    var currentUser = "${user}"
</script>
</body>
</html>
