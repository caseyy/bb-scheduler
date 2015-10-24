var app = {};

app.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
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
            else if (ctrl.code) {
                /*$.getJSON('http://clockworkapp.azurewebites.net/authenticate/'+code, function(data) {
                    console.log(data.token);
                });*/
            }
            else {
                $("#gh-login").transition({ opacity: 1, delay: 1000 });
            }
        }
    }
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

app.controller = function () {
    this.token = localStorage.getItem("token");
    this.code = getQueryVariable("code");
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
