var app = {};

app.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
            var today = new Date();
            for (var i = 0; i < 5; i++)
              ctrl.yearList.push(today.getFullYear() + i);

            var code = null;
            if (window.location.href.match(/\?code=(.*)/)) {
                code = window.location.href.match(/\?code=(.*)/)[1];
                var url = window.location.href;
                var value = url.substring(url.lastIndexOf('/') + 1);
                value  = value.split("?")[0];
                window.history.pushState("clockwork", "Clockwork", "/" + value );
            }

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

var Occurrence = function (data) {
    data = data || { type: "RO", start: new Date().getTime(), end: new Date().getTime() }
    this.type = m.prop(data.type),
    this.start = m.prop(data.start),
    this.end = m.prop(data.end)
}

app.controller = function () {
    this.token = localStorage.getItem("token");
    this.user;
    this.monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.yearList = [];
    this.eventList = ["RO", "V", "H"];
    this.calendar;
    this.repos = [];
    this.repo;
    this.event;
    this.popover = m.prop(false);
    this.modalVisible = false;
    this.commits = [];
    this.master;

    this.initialize = function () {
        m.render(document.getElementById("wrapper"), clockwork.view(this));
    }.bind(this);

    this.openModal = function () {
        if (this.modalVisible)
            return;

        $('#modal').openModal({ dismissible: false });
        this.modalVisible = true;
    }.bind(this);

    this.closeModal = function () {
        if (!this.modalVisible)
            return;

        $("#modal").closeModal();
        this.modalVisible = false;
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
        this.initialize();
    }.bind(this);

    this.getCommits = function () {
        var since = new Date(this.calendar.getYear() + "-" + this.calendar.getMonth() + "-01T00:00:00Z");
        var until = new Date().setTime(since.getTime() + 2678400000);
        m.request({
            method: "GET",
            url: "https://api.github.com/repos/" + this.repo.owner.login + "/" + this.repo.name + "/commits",
            data: {
              since: since.toISOString(),
              until: until.toISOString()
            },
            config: function (xhr, options) {
                xhr.setRequestHeader("Authorization", "Token " + this.token);
            }.bind(this)
        }).then(function (result) {
            this.commits = [];
            for (var i in result) {
                this.commits.push({
                    sha: result[i].sha,
                    date: $.format.date(result[i].commit.author.date, "M-d-yyyy"),
                    message: result[i].commit.message,
                    created: result[i].commit.committer.date,
                    user: {
                        id: result[i].author.id,
                        avatar: result[i].author.avatar_url,
                        login: result[i].author.login,
                        name: result[i].commit.author.name,
                        email: result[i].commit.author.email
                    }
                });
            }
            this.updateEvents();
        }.bind(this), function (error) {
            $(".progress").css("display", "none");
            Materialize.toast(error.message, 4000);
        });
    }.bind(this);

    this.updateMonthYear = function () {
        $(".progress").css("display", "block");
        $("#custom-month").text( this.calendar.getMonthName() );
        $("#custom-year").text( this.calendar.getYear() );
        $("#dropdown1 li").removeClass("active");
        $("#dropdown1 li#" + this.calendar.getMonthName()).addClass("active");
        $("#dropdown2 li").removeClass("active");
        $("#dropdown2 li#" + this.calendar.getYear()).addClass("active");
        this.getCommits();
    }.bind(this);

    this.updateEvents = function () {
      for (var i in this.commits) {
          var names = this.commits[i].user.name.split(" ");
          var initials = "";
          for (var j in names)
              initials += names[j].charAt(0).toUpperCase();

          var popover = '<table><tbody>' +
          '<tr><td>Name</td><td>' + this.commits[i].user.name + '</td></tr>' +
          '<tr><td>Message</td><td>' + this.commits[i].user.message + '</td></tr>' +
          '<tr><td>Login</td><td>' + this.commits[i].user.login + '</td></tr>' +
          '<tr><td>Email</td><td>' + this.commits[i].user.email + '</td></tr>' +
          '<tr><td>Created</td><td>' + this.commits[i].user.created + '</td></tr>' +
          '</tody></table';

          var html = '<a id="' + i + '" class="chip waves-effect waves-light btn-flat" tabindex="0" role="button"' +
          '" data-toggle="popover">' + initials + ' - ' + this.commits[i].message + '</a>';

          $("." + this.commits[i].date).append(html);
      }

      ctrl = this;
      $('[data-toggle="popover"]').popover({
        html: true,
        container: 'body',
        placement: 'auto top',
        trigger: 'focus',
        content: function() {
            var i = $(this).attr("id");
            var popover = '<div><table class="striped"><tbody>' +
            '<tr><td>Name</td><td>' + ctrl.commits[i].user.name + '</td></tr>' +
            '<tr><td>Message</td><td>' + ctrl.commits[i].message + '</td></tr>' +
            '<tr><td>Login</td><td>' + ctrl.commits[i].user.login + '</td></tr>' +
            '<tr><td>Email</td><td>' + ctrl.commits[i].user.email + '</td></tr>' +
            '<tr><td>Created</td><td>' + $.format.date(ctrl.commits[i].created, "M/d/yyyy h:mm:ss a") + '</td></tr>' +
            '</tody></table>'

            if (ctrl.user.login = ctrl.commits[i].user.login)
                popover += '<a class="waves-effect waves-light btn red delete-btn" onclick="ctrl.deleteEvent(' + i + ')">Delete</a>';

            popover += '</div>';
            return $(popover).html();
        }
      });
      $('[data-toggle="popover"]').popover().click( function (e) {
        e.stopPropagation();
      });
      $('[data-toggle="popover"]').on('show.bs.popover', function () {
        this.popover(true);
      }.bind(this))
      $('[data-toggle="popover"]').on('hidden.bs.popover', function () {
        this.popover(false);
      }.bind(this))
      $(".progress").css("display", "none");
    }.bind(this);

    this.createEvent = function () {
        m.render(document.getElementById("modal-content"), "");
        this.openModal();
        this.event = new Occurrence();
        m.render(document.getElementById("modal-footer"), occasion.footer(this));
        m.render(document.getElementById("modal-content"), occasion.view(this));
    }.bind(this);

    this.createEventWithDate = function (data) {
        if (this.popover())
          return;

        m.render(document.getElementById("modal-content"), "");
        this.openModal();
        this.event = new Occurrence(data);
        m.render(document.getElementById("modal-footer"), occasion.footer(this));
        m.render(document.getElementById("modal-content"), occasion.view(this));
    }.bind(this);

    this.deleteEvent = function (index) {
        console.log(index);
    }.bind(this);

    this.saveEvent = function () {
      $(".progress").css("display", "block");
      this.getMaster();
    }.bind(this);

    this.getMaster = function () {
      m.request({
          method: "GET",
          url: "https://api.github.com/repos/" + this.repo.owner.login + "/" + this.repo.name + "/git/refs/heads/master",
          config: function (xhr, options) {
              xhr.setRequestHeader("Authorization", "Token " + this.token);
          }.bind(this)
      }).then(function (result) {
          this.master = result;
          this.createCommit();
      }.bind(this), function (error) {
          $(".progress").css("display", "none");
          Materialize.toast(error.message, 4000);
      });
    }.bind(this);

    this.createCommit = function () {
      m.request({
          method: "POST",
          url: "https://api.github.com/repos/" + this.repo.owner.login + "/" + this.repo.name + "/git/commits",
          data: {
            message: this.event.type(),
            tree: this.master.object.sha,
            parents: [],
            name: this.user.name,
            email: this.user.email,
            date: $.format.date(this.event.start(), "yyyy-MM-ddTHH:mm:ssZ")
          },
          config: function (xhr, options) {
              xhr.setRequestHeader("Authorization", "Token " + this.token);
          }.bind(this)
      }).then(function (result) {
          $(".progress").css("display", "none");
      }.bind(this), function (error) {
          $(".progress").css("display", "none");
          Materialize.toast(error.message, 4000);
      });
    }.bind(this);
}

app.view = function (ctrl) {
    return [
      m("#wrapper", [
        m("#logo-container", { config: app.config(ctrl) }, [
            m("img#cw-logo", { src: "images/clockwork.png" }),
            m("#gh-login", [
              m("a.waves-effect waves-light btn blue darken-2", { href: "https://github.com/login/oauth/authorize?client_id=10fb63e16debecf62280&scope=repo" }, [
                  m("i.fa fa-github left"),
                  "Login"
              ])
            ])
        ])
      ]),
      m("#loading", [
          m(".progress", [
              m(".indeterminate")
          ])
      ]),
      m("#modal.modal modal-fixed-footer", [
          m("#modal-content.modal-content", [

          ]),
          m("#modal-footer.modal-footer", [

          ])
      ])
    ];
}

m.module(document.body, app);
