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
    this.month = m.prop("January");
    this.year = m.prop(2015);
    this.yearList = [];
    this.calendar;

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
                this.getRepos();
            }
            else {
                this.token = null;
                localStorage.removeItem("token");
                $("#gh-login").css("display", "block");
                $("#gh-login").transition({ opacity: 1, delay: 1000 });
            }
        }, function (error) {
            this.token = null;
            localStorage.removeItem("token");
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
            }
        }).then(function (result) {
            console.log(result);
        }, function (error) {
            Materialize.toast(error.message, 4000);
        });
    }.bind(this);

    this.goToPreviousMonth = function () {
        $( '#calendar' ).calendario('gotoPreviousMonth', this.updateMonthYear);
    }.bind(this);

    this.goToNextMonth = function () {
        $( '#calendar' ).calendario('gotoNextMonth', this.updateMonthYear);
    }.bind(this);

    this.updateMonthYear = function () {
        $("#custom-month").text( this.calendar.getMonthName() );
        $("#custom-year").text( this.calendar.getYear() );
        $("#dropdown1 li").removeClass("active");
        $("#dropdown1 li#" + this.calendar.getMonthName()).addClass("active");
        $("#dropdown2 li").removeClass("active");
        $("#dropdown2 li#" + this.calendar.getYear()).addClass("active");
    }.bind(this);

    this.showMonth = function (item) {
      this.calendar.gotoMonth(item, this.calendar.getYear(), this.updateMonthYear())
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
