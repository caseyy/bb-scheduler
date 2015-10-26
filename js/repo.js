var repo = {};

repo.view = function (ctrl) {
    return m("#repo-list.collection with-header", [
        m(".collection-header", "Choose calendar"),
        ctrl.repos.map(function (item) {
            if (item.name.substring(item.name.lastIndexOf(".")) == ".cw")
                return m("a.collection-item", { href: "javascript:void(0)" }, item.name);
        })
    ]);
}
