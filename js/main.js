var isSideNavOpened = false;
var isLoading = false;

// Check if jQuery is loaded before proceeding
function loadContent(link) {
    if (isLoading) return; // Prevent multiple simultaneous loads
    
    if (typeof jQuery === 'undefined') {
        // Retry if jQuery not loaded yet
        setTimeout(function() { loadContent(link); }, 100);
        return;
    }
    
    isLoading = true;
    
    $('#main-content').fadeOut(200, function() {
        $('#main-content').load(link + ' #main-content', function(response, status, xhr) {
            if (status === 'error') {
                console.error('Failed to load:', link, xhr.status, xhr.statusText);
                isLoading = false;
                $('#main-content').fadeIn(200);
                return;
            }
            
            try {
                history.pushState(null, null, link);
            } catch (e) {
                console.warn('History push failed:', e);
            }
            
            $('#main-content').fadeIn(200, function() {
                isLoading = false;
                
            	if(link == "dailydate.html") {
                    if(typeof dailyDate == "undefined") {
                        $.getScript('js/dailydate.js', function() {
                            try {
                                dailyDate.loadData();
                                dailyDate.init();
                                dailyDate.dismissLoading();
                            } catch(e) {
                                console.error('DailyDate init error:', e);
                            }
                        }).fail(function() {
                            console.error('Failed to load dailydate.js');
                        });
                    } else {
                       try {
                           dailyDate.loadData();
                            dailyDate.init();
                            dailyDate.dismissLoading(); 
                            selectedLocation = '';
                       } catch(e) {
                           console.error('DailyDate error:', e);
                       }
                    }
            	}
            	else if(link == "live2dv3.html") {
                    if(typeof Live2DViewer == "undefined") {
                        // Load dependencies in proper sequential order
                        $.getScript('https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.6.1/pixi.min.js', function() {
                            $.getScript('https://s3-ap-northeast-1.amazonaws.com/cubism3.live2d.com/sdk/js_eap/live2dcubismcore.min.js', function() {
                                $.getScript('js/pixi-spine.js', function() {
                                    $.getScript('js/background_effect.js', function() {
                                        $.getScript('js/live2dv3.js', function() {
                                            $.getScript('js/live2dv3_user.js', function() {
                                                try {
                                                    Live2DViewer.init();
                                                    Live2DViewer.initModel();
                                                } catch(e) {
                                                    console.error('Live2DViewer init error:', e);
                                                }
                                            }).fail(function(jqxhr, settings, exception) {
                                                console.error('Failed to load live2dv3_user.js:', exception);
                                            });
                                        }).fail(function(jqxhr, settings, exception) {
                                            console.error('Failed to load live2dv3.js:', exception);
                                        });
                                    }).fail(function(jqxhr, settings, exception) {
                                        console.error('Failed to load background_effect.js:', exception);
                                    });
                                }).fail(function(jqxhr, settings, exception) {
                                    console.error('Failed to load pixi-spine.js:', exception);
                                });
                            }).fail(function(jqxhr, settings, exception) {
                                console.error('Failed to load live2dcubismcore:', exception);
                            });
                        }).fail(function(jqxhr, settings, exception) {
                            console.error('Failed to load pixi.js:', exception);
                        });
                    } else {
                        try {
                            Live2DViewer.init();
                            Live2DViewer.initModel();
                        } catch(e) {
                            console.error('Live2DViewer error:', e);
                        }
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
            $(document).ready(function() {
                initSideNav();
                
                // Auto-init Live2D for live2dv3.html if content exists
                if (typeof Live2DViewer === 'undefined' && $('#main-content #models').length > 0) {
                    loadLive2D();
                }
                
                // Auto-init Daily Date for dailydate.html if content exists
                if (typeof dailyDate === 'undefined' && $('#main-content .left').length > 0) {
                    loadDailyDate();
                }
            });
        }
    });
} else if (typeof jQuery !== 'undefined') {
    $(document).ready(function() {
        initSideNav();
        
        // Auto-init Live2D for live2dv3.html if content exists
        if (typeof Live2DViewer === 'undefined' && $('#main-content #models').length > 0) {
            loadLive2D();
        }
        
        // Auto-init Daily Date for dailydate.html if content exists
        if (typeof dailyDate === 'undefined' && $('#main-content .left').length > 0) {
            loadDailyDate();
        }
    });
}

function loadLive2D() {
    if(typeof Live2DViewer == "undefined") {
        // Load dependencies in proper sequential order
        $.getScript('https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.6.1/pixi.min.js', function() {
            $.getScript('https://s3-ap-northeast-1.amazonaws.com/cubism3.live2d.com/sdk/js_eap/live2dcubismcore.min.js', function() {
                $.getScript('js/pixi-spine.js', function() {
                    $.getScript('js/background_effect.js', function() {
                        $.getScript('js/live2dv3.js', function() {
                            $.getScript('js/live2dv3_user.js', function() {
                                try {
                                    Live2DViewer.init();
                                    Live2DViewer.initModel();
                                } catch(e) {
                                    console.error('Live2DViewer init error:', e);
                                }
                            }).fail(function(jqxhr, settings, exception) {
                                console.error('Failed to load live2dv3_user.js:', exception);
                            });
                        }).fail(function(jqxhr, settings, exception) {
                            console.error('Failed to load live2dv3.js:', exception);
                        });
                    }).fail(function(jqxhr, settings, exception) {
                        console.error('Failed to load background_effect.js:', exception);
                    });
                }).fail(function(jqxhr, settings, exception) {
                    console.error('Failed to load pixi-spine.js:', exception);
                });
            }).fail(function(jqxhr, settings, exception) {
                console.error('Failed to load live2dcubismcore:', exception);
            });
        }).fail(function(jqxhr, settings, exception) {
            console.error('Failed to load pixi.js:', exception);
        });
    }
}

function loadDailyDate() {
    if(typeof dailyDate == "undefined") {
        $.getScript('js/dailydate.js', function() {
            try {
                dailyDate.loadData();
                dailyDate.init();
                dailyDate.dismissLoading();
            } catch(e) {
                console.error('DailyDate init error:', e);
            }
        }).fail(function() {
            console.error('Failed to load dailydate.js');
        });
    }
}

// Handle history navigation
if (typeof jQuery !== 'undefined') {
    $(function() {
        if (window.history && window.history.pushState) {
            // Attach click handler to li element for larger click area
            $('ul.pagenav>li').on('click', function(e) {
                // Only handle clicks on links inside
                var link = $(this).find('a');
                if (link.length === 0) return; // Skip if no link inside
                
                $('.selected').removeClass('selected');
                $(this).addClass('selected');
                e.preventDefault();
                _href = link.attr("href");
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