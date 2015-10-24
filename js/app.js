var app = {};

app.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
            var code = null;
            if (window.location.href.match(/\?code=(.*)/))
                code = window.location.href.match(/\?code=(.*)/)[1];

            if (ctrl.token) {
                m.request({
                    method: "GET",
                    url: "https://api.github.com/user",
                    config: function (xhr, options) {
                        xhr.setRequestHeader("Authorization", "Token " + ctrl.token);
                    }
                }).then(function (result) {
                    console.log(result)
                }, function (error) {
                    Materialize.toast(error.message, 4000);
                });
            }
            else if (code) {
                $.getJSON('https://clockworkapp.azurewebsites.net/authenticate/'+code, function(data) {
                    if (data.token) {
                        this.token = data.token;
                        localStorage.setItem("token", data.token);
                        this.initialize();
                    }
                    else {
                        Materialize.toast('Incorrect passphrase', 4000);
                    }
                });
            }
            else {
                $("#gh-login").transition({ opacity: 1, delay: 1000 });
            }
        }
    }
}

app.controller = function () {
    this.token = localStorage.getItem("token");
}

app.view = function (ctrl) {
    return m("#logo-container", { config: app.config(ctrl) }, [
        m("img#cw-logo", { src: "images/clockwork.png" }),
        m("#gh-login", [
          m("a.waves-effect waves-light btn blue darken-2", { href: "https://github.com/login/oauth/authorize?client_id=10fb63e16debecf62280&scope=repo" }, [
              m("i.fa fa-github left"),
              "Login"
          ])
        ])
    ])
}

m.module(document.body, app);
