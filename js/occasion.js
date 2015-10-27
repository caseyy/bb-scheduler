var occasion = {};

occasion.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
          $(".datepicker").each(function (index) {
              $(this).pickadate({
                  selected: $(this).attr("data-value"),
                  format: "m/d/yyyy"
              });
          });
        }
    }
}

occasion.view = function (ctrl) {
    return m("form.form-content col s12 scrollable", { config: occasion.config(ctrl) }, [
        m("h5", "Create Event"),
        m(".row", [
            m(".col s12 m12", [
                m("label", "Event Type"),
                m("select#eventType.browser-default", { value: ctrl.event.type(), onchange: m.withAttr("value", ctrl.event.type) },
                ctrl.eventList.map(function (type) {
                    return m('option', { 'value': type }, type);
                }))
            ])
        ]),
        m(".row", [
            m(".col s12 m12", [
                m("label", "Start Date"),
                m("input#startDate.datepicker", { type: "date", "data-value": ctrl.event.start(), onchange: m.withAttr("value", ctrl.event.start) })
            ])
        ]),
        m(".row", [
            m(".col s12 m12", [
                m("label", "End Date"),
                m("input#endDate.datepicker", { type: "date", "data-value": ctrl.event.end(), onchange: m.withAttr("value", ctrl.event.end) })
            ])
        ])
    ])
}

occasion.footer = function (ctrl) {
    return [
        m("a#modal-action.modal-action modal-close waves-effect btn-flat", { onclick: ctrl.closeModal, href: "javascript:void(0)" }, "Close"),
        m("a#modal-action.modal-action modal-close waves-effect btn-flat", { onclick: ctrl.saveEvent, href: "javascript:void(0)" }, "Save")
    ];
}
