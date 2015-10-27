var clockwork = {};

clockwork.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
            ctrl.calendar = el.calendario( {
  						onDayClick : function( $el, $contentEl, dateProperties ) {
  							var date = new Date(dateProperties.month + "/" + dateProperties.day + "/" + dateProperties.year).getTime();
                ctrl.createEventWithDate({ type: "RO", start: date, end: date });
  						},
  						caldata : []
  					});
            $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                constrain_width: false,
                hover: false,
                gutter: 0,
                belowOrigin: false
            });
            ctrl.updateMonthYear();
        }
    }
}

clockwork.view = function (ctrl) {
    return [
      m("#action-bar", [
        m("img#cal-logo", { src: "images/clockwork.png" }),
        m("#custom-month-year", [
            m("a.waves-effect waves-light btn-flat btn-small", { href: "javascript:void(0)", onclick: function() {
    					ctrl.calendar.gotoPreviousMonth( ctrl.updateMonthYear );
    				} }, [
                m("i.fa fa-chevron-left left")
            ]),
            m("a#custom-month.dropdown-button btn-flat", { href: "javascript:void(0)", "data-activates": "dropdown1" }, ""),
            m("ul#dropdown1.dropdown-content", { style: "width:150px;" }, [
                ctrl.monthList.map(function (item, index) {
                  return m("li", [
                      m("a[href='javascript:void(0)']", { onclick: function () {
                          ctrl.calendar.gotoMonth(index + 1, ctrl.calendar.getYear(), ctrl.updateMonthYear);
                      } }, item)
                  ])
                })
            ]),
            m("a#custom-next.waves-effect waves-light btn-flat btn-small", { href: "javascript:void(0)", onclick: function() {
    					ctrl.calendar.gotoNextMonth( ctrl.updateMonthYear );
    				} }, [
                m("i.fa fa-chevron-right right")
            ]),
            m("a#custom-year.dropdown-button btn-flat", { href: "javascript:void(0)", "data-activates": "dropdown2" }, ""),
            m("ul#dropdown2.dropdown-content", { style: "width:100px;" }, [
                ctrl.yearList.map(function (item) {
                  return m("li", { id: item }, [
                      m("a[href='javascript:void(0)']", { onclick: function () {
                          ctrl.calendar.gotoMonth(ctrl.calendar.getMonth(), item, ctrl.updateMonthYear);
                      } }, item)
                  ])
                })
            ]),
            m("a.waves-effect waves-light btn-flat btn-small", { href: "javascript:void(0)", onclick: ctrl.createEvent }, [
                m("i.fa fa-calendar-plus-o left")
            ]),
        ])
      ]),
      m("#calendar.fc-calendar-container", { config: clockwork.config(ctrl) })
    ]
}
