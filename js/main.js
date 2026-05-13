var isSideNavOpened = false;
var isLoading = false;
var loadAttempts = 0;
var maxLoadAttempts = 3;
var isSettingNavOpened = false;  // Track settings sidebar state

// Global settings button toggle function - MUST be at global scope
function toggleSettings(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log('Settings button activated');
    
    // Toggle nav directly
    var sidenav = document.getElementsByClassName("l2dv3-sidenav")[0];
    var canvas = document.getElementById("L2dCanvas");
    if(!sidenav) {
        console.warn('l2dv3-sidenav not found');
        return;
    }
    
    if (!isSettingNavOpened) {
        // Open nav
        sidenav.style.right = "0px";
        sidenav.style.paddingLeft = "10px";
        if(canvas) canvas.style.zIndex = "-1";
        var settingBtn = document.getElementById("settingButton");
        if(settingBtn) {
            settingBtn.style.marginRight = "260px";
        }
        isSettingNavOpened = true;
        console.log('Settings nav opened');
    } else {
        // Close nav
        sidenav.style.right = "-250px";
        sidenav.style.paddingLeft = "0px";
        if(canvas) canvas.style.zIndex = "0";
        var settingBtn = document.getElementById("settingButton");
        if(settingBtn) {
            settingBtn.style.marginRight = "0px";
        }
        isSettingNavOpened = false;
        console.log('Settings nav closed');
    }
}

// Check if jQuery is loaded before proceeding
function loadContent(link) {
    if (isLoading) return; // Prevent multiple simultaneous loads
    
    if (typeof jQuery === 'undefined') {
        // Retry if jQuery not loaded yet
        setTimeout(function() { loadContent(link); }, 100);
        return;
    }
    
    isLoading = true;
    loadAttempts = 0;
    loadContentWithRetry(link);
}

function loadContentWithRetry(link) {
    loadAttempts++;
    
    $('#main-content').fadeOut(200, function() {
        var loadTimeout = setTimeout(function() {
            console.error('Load timeout for:', link);
            if (loadAttempts < maxLoadAttempts) {
                console.log('Retrying... Attempt', loadAttempts + 1);
                $('#main-content').fadeIn(200);
                loadContentWithRetry(link);
            } else {
                isLoading = false;
                $('#main-content').fadeIn(200);
                alert('Failed to load page after ' + maxLoadAttempts + ' attempts. Please refresh.');
            }
        }, 5000); // 5 second timeout
        
        $('#main-content').load(link + ' #main-content', function(response, status, xhr) {
            clearTimeout(loadTimeout);
            
            if (status === 'error') {
                console.error('Failed to load:', link, xhr.status, xhr.statusText);
                if (loadAttempts < maxLoadAttempts) {
                    console.log('Retrying... Attempt', loadAttempts + 1);
                    $('#main-content').fadeIn(200, function() {
                        setTimeout(function() {
                            loadContentWithRetry(link);
                        }, 500);
                    });
                } else {
                    isLoading = false;
                    $('#main-content').fadeIn(200);
                    alert('Failed to load page after ' + maxLoadAttempts + ' attempts.');
                }
                return;
            }
            
            // Hide settings button by default
            $('#settingButton').removeClass('visible');
            
            try {
                history.pushState(null, null, link);
            } catch (e) {
                console.warn('History push failed:', e);
            }
            
            // Close sidebar after successful page load
            if(isSideNavOpened) {
                $('#mySidenav').css('left','-250px');
                $('body').css('marginLeft','0px');
                isSideNavOpened = false;
            }
            
            $('#main-content').fadeIn(200, function() {
                isLoading = false;
                
                // Ensure sidebar is closed after page load
                if(isSideNavOpened) {
                    console.log('Force closing sidebar after load');
                    closeSidebar();
                }
                
            	if(link == "dailydate.html") {
                    console.log('Loading dailydate - hiding settings button');
                    $('#settingButton').removeClass('visible');
                    
                    // Close settings nav if open
                    isSettingNavOpened = false;
                    var sidenav = document.getElementsByClassName("l2dv3-sidenav");
                    if(sidenav.length > 0) {
                        sidenav[0].style.right = "-250px";
                    }
                    
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
                    console.log('Loading live2dv3 - showing settings button');
                    $('#settingButton').addClass('visible');
                    
                    // Attach settings button handler here (after page load)
                    setTimeout(function() {
                        console.log('Attaching settingButton handler from main.js');
                        
                        // Attach both click and touch events for better mobile support
                        $('#settingButton').off('click').on('click', toggleSettings);
                        $('#settingButton').off('touchend').on('touchend', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSettings();
                        });
                        
                        // Also attach touchstart for better mobile experience
                        $('#settingButton').off('touchstart').on('touchstart', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    }, 200);
                    
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
            	
            	// Reinitialize sidebar handlers for new page
            	initSideNav();
            });
        })
    })
}

function closeSidebar() {
    if(isSideNavOpened) {
        console.log('Closing sidebar - setting left: -250px');
        $('#mySidenav').css('left','-250px');
        $('body').css('marginLeft','0px');
        isSideNavOpened = false;
        console.log('Sidebar closed - isSideNavOpened:', isSideNavOpened);
        console.log('Sidebar CSS left:', $('#mySidenav').css('left'));
    }
}

function initSideNav() {
    // Ensure sidebar starts closed
    $('#mySidenav').css('left','-250px');
    $('body').css('marginLeft','0px');
    isSideNavOpened = false;
    console.log('Sidebar reset to closed state');
    
    // Remove old handlers to prevent duplicates
    $('#buttonNav').off('click');
    $(document).off('click.sidebar');
    $('#mySidenav').off('click');
    
    // Hamburger button click
    $('#buttonNav').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('Hamburger clicked');
        if(isSideNavOpened) {
            closeSidebar();
        } else {
            $('#mySidenav').css('left','0px');
            $('body').css('marginLeft','250px');
            isSideNavOpened = true;
            console.log('Sidebar opened');
        }
    })
	
    // Close sidebar when clicking outside
    $(document).on('click.sidebar', function(e) {
        if(isSideNavOpened && !$(e.target).closest('#mySidenav, #buttonNav').length) {
            console.log('Click outside - closing sidebar');
            closeSidebar();
        }
    })
	
    // Close sidebar when clicking anywhere inside sidebar
    $('#mySidenav').on('click', function(e) {
        var target = $(e.target);
        // Check if clicked on a link
        var link = target.closest('a');
        if(link.length) {
            var href = link.attr('href');
            console.log('Sidebar click - link href:', href);
            closeSidebar();
            if(href) {
                // Full page reload instead of AJAX load
                // This ensures all elements reset and no state conflicts
                console.log('Navigating to:', href);
                setTimeout(function() {
                    window.location.href = href;
                }, 300);
            }
        }
    })
	
    console.log('Sidebar handlers initialized - found ' + $('#mySidenav a').length + ' links');
}

// Wait for jQuery before running
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof jQuery !== 'undefined') {
            $(document).ready(function() {
                initSideNav();
                
                // Check which page is loaded and show/hide settings button
                if ($('#main-content #models').length > 0) {
                    // Live2D V3 page
                    console.log('Initial load - Live2D page detected, showing settings');
                    $('#settingButton').addClass('visible');
                    if(typeof Live2DViewer === 'undefined') {
                        loadLive2D();
                    }
                } else if ($('#main-content .left').length > 0) {
                    // Daily Date page
                    console.log('Initial load - Daily Date page detected, hiding settings');
                    $('#settingButton').removeClass('visible');
                    if(typeof dailyDate === 'undefined') {
                        loadDailyDate();
                    }
                } else {
                    // Main/other pages
                    console.log('Initial load - Main page detected, hiding settings');
                    $('#settingButton').removeClass('visible');
                }
            });
        }
    });
} else if (typeof jQuery !== 'undefined') {
    $(document).ready(function() {
        initSideNav();
        
        // Add direct touch handler to settings button for mobile support
        var settingBtn = document.getElementById("settingButton");
        if (settingBtn) {
            settingBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });
            
            settingBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Trigger click via jQuery for consistency
                $(this).trigger('click');
            }, { passive: false });
        }
        
        // Check which page is loaded and show/hide settings button
        if ($('#main-content #models').length > 0) {
            // Live2D V3 page
            console.log('Document.ready - Live2D page detected, showing settings');
            $('#settingButton').addClass('visible');
            
            // Attach settings button click handler for Live2D page
            setTimeout(function() {
                $('#settingButton').off('click').on('click', toggleSettings);
                console.log('Click handler attached to settings button');
            }, 200);
            if(typeof Live2DViewer === 'undefined') {
                loadLive2D();
            }
        } else if ($('#main-content .left').length > 0) {
            // Daily Date page
            console.log('Document.ready - Daily Date page detected, hiding settings');
            $('#settingButton').removeClass('visible');
            if(typeof dailyDate === 'undefined') {
                loadDailyDate();
            }
        } else {
            // Main/other pages
            console.log('Document.ready - Main page detected, hiding settings');
            $('#settingButton').removeClass('visible');
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