var isSideNavOpened = false;

// Check if jQuery is loaded before proceeding
function loadContent(link) {
    if (typeof jQuery === 'undefined') {
        // Retry if jQuery not loaded yet
        setTimeout(function() { loadContent(link); }, 100);
        return;
    }
    
    $('#main-content').fadeOut(200, function() {
        $('#main-content').load(link + ' #main-content', function() {
            history.pushState(null, null, link);
            $('#main-content').fadeIn(200, function() {
            	if(link == "dailydate.html") {
                    if(typeof dailyDate == "undefined") {
                        $.getScript('js/dailydate.js', function() {
                            dailyDate.loadData();
                            dailyDate.init();
                            dailyDate.dismissLoading();
                        });
                    } else {
                       dailyDate.loadData();
                        dailyDate.init();
                        dailyDate.dismissLoading(); 
                        selectedLocation = '';
                    }
            	}
            	if(link == "live2dv3.html") {
                    if(typeof Live2DViewer == "undefined") {
                        $.getScript('js/pixi-spine.js');
                        $.getScript('js/background_effect.js');
                        $.getScript('js/live2dv3.js', function() {
                            $.getScript('js/live2dv3_user.js', function() {
                                Live2DViewer.init();
                                Live2DViewer.initModel();
                            })
                        })
                    } else {
                        Live2DViewer.init();
                        Live2DViewer.initModel();
                    }
            		
            	}
            });
        })
    })
}

function initSideNav() {
    $('#buttonNav').click(function() {
		if(isSideNavOpened) {
			$('#mySidenav').css('left','-250px');
			$('body').css('marginLeft','0px');
		} else {
			$('#mySidenav').css('left','0px');
			$('body').css('marginLeft','250px');
		}
		isSideNavOpened = !isSideNavOpened;
	})
}

// Wait for jQuery before running
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof jQuery !== 'undefined') {
            $(document).ready(initSideNav);
        }
    });
} else if (typeof jQuery !== 'undefined') {
    initSideNav();
}

// Handle history navigation
if (typeof jQuery !== 'undefined') {
    $(function() {
        if (Modernizr && Modernizr.history) {
            // history is supported; do magical things
            $('ul.pagenav>li>a').on('click', function(e) {
                $('.selected').removeClass('selected');
                $(this).parent().addClass('selected');
                e.preventDefault();
                _href = $(this).attr("href");
                loadContent(_href);
                $('#buttonNav').click();
            })
        }
    });
}

$(window).bind("popstate", function() {
    link = location.pathname.replace(/^.*[\\/]/, ""); // get filename only
    loadContent(link);
});