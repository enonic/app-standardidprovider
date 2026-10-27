// The consent page: while none of the optional permissions is kept, the request cannot be
// approved, since XP denies a request that keeps no permission. Served as is, no bundling.
(function () {
    'use strict';
    var form = document.querySelector('form.device-form');
    if (!form) {
        return;
    }
    var boxes = form.querySelectorAll('input[type=checkbox][name=scope]');
    var approve = form.querySelector('button[name=approve][value=true]');
    var hint = document.getElementById('device-keep-one');
    if (boxes.length === 0 || !approve) {
        return;
    }
    function update() {
        var kept = false;
        for (var i = 0; i < boxes.length; i++) {
            kept = kept || boxes[i].checked;
        }
        approve.disabled = !kept;
        if (hint) {
            hint.hidden = kept;
        }
    }
    for (var i = 0; i < boxes.length; i++) {
        boxes[i].addEventListener('change', update);
    }
    update();
})();
