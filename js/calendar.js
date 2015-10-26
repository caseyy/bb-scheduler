var calendar = {};

calendar.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
            ctrl.calendar = el.calendario( {
  						onDayClick : function( $el, $contentEl, dateProperties ) {
  							for( var key in dateProperties ) {
  								console.log( key + ' = ' + dateProperties[ key ] );
  							}
  						},
  						caldata : []
  					});
            ctrl.updateMonthYear();
            $( '#custom-next' ).on( 'click', function() {
    					ctrl.calendar.gotoNextMonth( ctrl.updateMonthYear );
    				} );
    				$( '#custom-prev' ).on( 'click', function() {
    					ctrl.calendar.gotoPreviousMonth( ctrl.updateMonthYear );
    				} );
    				$( '#custom-current' ).on( 'click', function() {
    					ctrl.calendar.gotoNow( ctrl.updateMonthYear );
    				} );
            $( '#dropdown1 li' ).on( 'click', function(e) {
    					ctrl.calendar.gotoMonth($(this).attr("data-value"), ctrl.calendar.getYear(), ctrl.updateMonthYear);
    				} );
            $( '#dropdown2 li' ).on( 'click', function(e) {
    					ctrl.calendar.gotoMonth(ctrl.calendar.getMonth(), $(this).attr("data-value"), ctrl.updateMonthYear);
    				} );
        }
    }
}

calendar.view = function (ctrl) {
    return [
      m("#action-bar", [
        m("img#cal-logo", { src: "images/clockwork.png" }),
        m("#custom-month-year", [
            m("a#custom-prev.waves-effect waves-light btn-flat btn-small", { href: "javascript:void(0)" }, [
                m("i.fa fa-chevron-left left")
            ]),
            m("a#custom-month.dropdown-button btn-flat", { href: "javascript:void(0)", "data-activates": "dropdown1" }, ""),
            m("ul#dropdown1.dropdown-content", { style: "width:150px;" }, [
                ctrl.monthList.map(function (item, index) {
                  return m("li", { id: item, "data-value": index + 1 }, [
                      m("a[href='javascript:void(0)']", item)
                  ])
                })
            ]),
            m("a#custom-next.waves-effect waves-light btn-flat btn-small", { href: "javascript:void(0)" }, [
                m("i.fa fa-chevron-right right")
            ]),
            m("a#custom-year.dropdown-button btn-flat", { href: "javascript:void(0)", "data-activates": "dropdown2" }, ""),
            m("ul#dropdown2.dropdown-content", { style: "width:100px;" }, [
                ctrl.yearList.map(function (item) {
                  return m("li", { id: item, "data-value": item }, [
                      m("a[href='javascript:void(0)']", item)
                  ])
                })
            ])
        ])
      ]),
      m("#calendar.fc-calendar-container", { config: calendar.config(ctrl) })
    ]
}
