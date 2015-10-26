var repo = {};

repo.view = function (ctrl) {
    return m(".collection", [
        ctrl.repos.map(function (item) {
            return m("a.collection-item[href='javascript:void(0)']", item);
        }
    ]);
}
