var app = {};

app.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
            var today = new Date();
            for (var i = 0; i < 5; i++)
              ctrl.yearList.push(today.getFullYear() + i);

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
                $("#gh-login").css("display", "block");
                $("#gh-login").transition({ opacity: 1, delay: 1000 });
            }
        }
    }
}

app.controller = function () {
    this.token = localStorage.getItem("token");
    this.user;
    this.monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.yearList = [];
    this.calendar;
    this.repos = [];
    this.repo;
    this.commits = {};

    this.initialize = function () {
        m.render(document.getElementById("wrapper"), calendar.view(this));
    }.bind(this);

    this.getUser = function () {
        m.request({
            method: "GET",
            url: "https://api.github.com/user",
            config: function (xhr, options) {
                xhr.setRequestHeader("Authorization", "Token " + this.token);
            }.bind(this)
        }).then(function (result) {
          console.log(result);
            if (result.login) {
                this.user = result;
                this.getRepos();
            }
            else {
                $("#gh-login").css("display", "block");
                $("#gh-login").transition({ opacity: 1, delay: 1000 });
            }
        }.bind(this), function (error) {
            $("#gh-login").css("display", "block");
            $("#gh-login").transition({ opacity: 1, delay: 1000 });
        });
    }.bind(this);

    this.getRepos = function () {
        m.request({
            method: "GET",
            url: "https://api.github.com/user/repos",
            config: function (xhr, options) {
                xhr.setRequestHeader("Authorization", "Token " + this.token);
            }.bind(this)
        }).then(function (result) {
            this.repos = result;
            m.render(document.getElementById("wrapper"), repo.view(this));
        }.bind(this), function (error) {
            Materialize.toast(error.message, 4000);
        });
    }.bind(this);

    this.setRepo = function(item) {
        this.repo = item;
        this.getCommits();
    }.bind(this);

    this.getCommits = function () {
        m.request({
            method: "GET",
            url: "https://api.github.com/repos/" + this.repo.owner.login + "/" + this.repo.name + "/commits",
            config: function (xhr, options) {
                xhr.setRequestHeader("Authorization", "Token " + this.token);
            }.bind(this)
        }).then(function (result) {
            this.commits = {};
            for (var i in result) {
                var date = jQuery.format.date(result[i].commit.author.date, "MM-dd-yyyy");
                this.commits[date] = result[i].commit.message;
            }
            this.initalize();
        }.bind(this), function (error) {
            Materialize.toast(error.message, 4000);
        });
    }.bind(this);

    this.updateMonthYear = function () {
        $("#custom-month").text( this.calendar.getMonthName() );
        $("#custom-year").text( this.calendar.getYear() );
        $("#dropdown1 li").removeClass("active");
        $("#dropdown1 li#" + this.calendar.getMonthName()).addClass("active");
        $("#dropdown2 li").removeClass("active");
        $("#dropdown2 li#" + this.calendar.getYear()).addClass("active");
    }.bind(this);
}

app.view = function (ctrl) {
    return m("#wrapper", [
        m("#logo-container", { config: app.config(ctrl) }, [
            m("img#cw-logo", { src: "images/clockwork.png" }),
            m("#gh-login", [
              m("a.waves-effect waves-light btn blue darken-2", { href: "https://github.com/login/oauth/authorize?client_id=10fb63e16debecf62280&scope=repo" }, [
                  m("i.fa fa-github left"),
                  "Login"
              ])
            ])
        ])
    ]);
}

m.module(document.body, app);
