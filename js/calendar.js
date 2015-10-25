var calendar = {};

calendar.config = function (ctrl) {
    return function (element, isInitialized) {
        var el = $(element);

        if (!isInitialized) {
            var cal = $( '#calendar' ).calendario( {
              onDayClick : function( $el, $contentEl, dateProperties ) {
                for( var key in dateProperties ) {
                  console.log( key + ' = ' + dateProperties[ key ] );
                }
              },
              caldata : []
            } ),
            $month = $( '#custom-month' ).html( cal.getMonthName() ),
            $year = $( '#custom-year' ).html( cal.getYear() );
        }
    }
}

calendar.view = function (ctrl) {
    return m("#calendar.fc-calendar-container", { config: calendar.config(ctrl) })
}

m.module(document.body, app);
