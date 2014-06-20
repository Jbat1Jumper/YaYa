$(function() {
    var TiWindow = Ti.UI.getCurrentWindow();
    TiWindow.addEventListener(Ti.RESIZED, function() {
        //$.parser.parse();
    });
});
/*

$(function() {
    var dirty_interval = setInterval(function() {

        var TI_DRAGGING = false;

        var drag_div = document.getElementById("Ti-top-bar");

        document.onmousemove = function() {
            if (!TI_DRAGGING) return;
            Ti.UI.currentWindow.setX(Ti.UI.currentWindow.getX() + event.clientX - xstart);
            Ti.UI.currentWindow.setY(Ti.UI.currentWindow.getY() + event.clientY - ystart);
        }

        drag_div.onmousedown = function() {
            TI_DRAGGING = true;
            xstart = event.clientX;
            ystart = event.clientY;
        }

        document.onmouseup = function() {
            TI_DRAGGING = false;
        }

        window.clearInterval(dirty_interval);

    }, 10);
});

function TiClose() {
    Ti.UI.getCurrentWindow().close();
};

function TiToggleMaximized() {
    if (Ti.UI.getCurrentWindow().isMaximized())
        Ti.UI.getCurrentWindow().unmaximize();
    else
        Ti.UI.getCurrentWindow().maximize();
};

function TiMinimize() {
    Ti.UI.getCurrentWindow().minimize()
};
*/