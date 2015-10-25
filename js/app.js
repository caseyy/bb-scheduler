var app = {};

app.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
            var code = null;
            if (window.location.href.match(/\?code=(.*)/))
                code = window.location.href.match(/\?code=(.*)/)[1];

            if (ctrl.token) {
                ctrl.getUser();
            }
            else if (code) {
                $.getJSON('https://clockworkapp.azurewebsites.net/authenticate/'+code, function(data) {
                    if (data.token) {
                        ctrl.token = data.token;
                        localStorage.setItem("token", data.token);
                        ctrl.getUser();
                    }
                    else {
                        Materialize.toast("Error", 4000);
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
    this.user;

    this.initialize = function () {
        m.render(document.body, calendar.view(this));
    }.bind(this);

    this.getUser = function () {
        m.request({
            method: "GET",
            url: "https://api.github.com/user",
            config: function (xhr, options) {
                xhr.setRequestHeader("Authorization", "Token " + this.token);
            }
        }).then(function (result) {
            if (result.login) {
                this.user = result;
                this.initialize();
            }
            else
                $("#gh-login").transition({ opacity: 1, delay: 1000 });
        }, function (error) {
            if (error.message == "Bad credentials")
                $("#gh-login").transition({ opacity: 1, delay: 1000 });
            else
                Materialize.toast(error.message, 4000);
        });
    }.bind(this);
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
