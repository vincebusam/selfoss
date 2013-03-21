/**
 * toolbar of an single entry
 */
selfoss.events.entriesToolbar = function(parent) {
    if(typeof parent == "undefined")
        parent = $('#content');
    
    // prevent close on links
    parent.find('a').unbind('click').click(function(e) {
        window.open($(this).attr('href'));
        e.preventDefault();
        return false;
    });
    
    // load images
    parent.find('.entry-loadimages').unbind('click').click(function() {
        $(this).parents('.entry').lazyLoadImages();
        $(this).fadeOut();
        return false;
    });
    
    // open in new window
    parent.find('.entry-newwindow').unbind('click').click(function(e) {
        window.open($(this).parents(".entry").children("a").eq(0).attr("href"));
        e.preventDefault();
        return false;
    });
    
    // share with google plus
    parent.find('.entry-sharegoogle').unbind('click').click(function(e) {
        window.open("https://plus.google.com/share?url="+encodeURIComponent($(this).parents(".entry").children("a").eq(0).attr("href")));
        e.preventDefault();
        return false;
    });
    
    // share with twitter
    parent.find('.entry-sharetwitter').unbind('click').click(function(e) {
        window.open("https://twitter.com/intent/tweet?source=webclient&text="+encodeURIComponent($(this).parents(".entry").children(".entry-title").html())+" "+encodeURIComponent($(this).parents(".entry").children("a").eq(0).attr("href")));
        e.preventDefault();
        return false;
    });
    
    // share with facebook
    parent.find('.entry-sharefacebook').unbind('click').click(function(e) {
        window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent($(this).parents(".entry").children("a").eq(0).attr("href"))+"&t="+encodeURIComponent($(this).parents(".entry").children(".entry-title").html()));
        e.preventDefault();
        return false;
    });
    
    
    // only loggedin users
    if($('body').hasClass('loggedin')==true) {
        // starr/unstarr
        parent.find('.entry-starr').unbind('click').click(function() {
            var parent = $(this).parents('.entry');
            var id = parent.attr('id').substr(5);
            var starr = $(this).hasClass('active')==false;
            var button = $("#entry"+id+" .entry-starr, #entrr"+id+" .entry-starr");
            
            // update button
            var setButton = function(starr) {
                if(starr) {
                    button.addClass('active');
                    button.html('unstar');
                } else {
                    button.removeClass('active');
                    button.html('star');
                }
            };
            setButton(starr);
            
            // update statistics in main menue
            var updateStats = function(starr) {
                var starred = parseInt($('.nav-filter-starred span').html());
                if(starr) {
                    starred++;
                } else {
                    starred--;
                }
                $('.nav-filter-starred span').html(starred);
            };
            updateStats(starr);
            
            $.ajax({
                url: $('base').attr('href') + (starr ? 'starr/' : 'unstarr/') + id,
                type: 'POST',
                error: function(jqXHR, textStatus, errorThrown) {
                    // rollback ui changes
                    setButton(!starr);
                    updateStats(!starr);
                    alert('Can not starr/unstarr item: '+errorThrown);
                }
            });
            
            return false;
        });
        
        // read/unread
        parent.find('.entry-unread').unbind('click').click(function() {
            var id = $(this).parents('.entry').attr('id').substr(5);
            var unread = $(this).hasClass('active')==true;
            var button = $("#entry"+id+" .entry-unread, #entrr"+id+" .entry-unread");
            var parent = $("#entry"+id+", #entrr"+id);
            
            // update button
            var setButton = function(unread) {
                if(unread) {
                    button.removeClass('active');
                    button.html('mark as unread');
                    parent.removeClass('unread');
                } else {
                    button.addClass('active');
                    button.html('mark as read');
                    parent.addClass('unread');
                }
            };
            setButton(unread);
            
            // update statistics in main menue and the currently active tag
            var updateStats = function(unread) {
                // update all unread counter
                var unreadstats = parseInt($('.nav-filter-unread span').html());
                if(unread) {
                    unreadstats--;
                } else {
                    unreadstats++;
                }
                $('.nav-filter-unread span').html(unreadstats);
                $('.nav-filter-unread span').removeClass('unread');
                if(unreadstats>0)
                    $('.nav-filter-unread span').addClass('unread');
                    
                // update unread count on sources
                var sourceId = $('#entry'+id+' .entry-source').attr('class').substr(25);
                var sourceNav = $('#source'+sourceId+' .unread');
                var sourceCount = parseInt(sourceNav.html());
                if(typeof sourceCount != "number" || isNaN(sourceCount)==true)
                    sourceCount = 0;
                sourceCount = unread ? sourceCount-1 : sourceCount+1;
                if(sourceCount<=0)
                    sourceCount = "";
                sourceNav.html(sourceCount);
                
                // update unread on tags
                $('#entry'+id+' .entry-tags-tag').each( function(index) {
                    var tag = $(this).html();
                    
                    var tagsCountEl = $('#nav-tags > li > span.tag').filter(function(i){
                        return $(this).html()==tag; }
                    ).next();
                    
                    var unreadstats = 0;
                    if (tagsCountEl.html()!='')
                        unreadstats = parseInt(tagsCountEl.html());
                    
                    if (unread)
                        unreadstats--;
                    else
                        unreadstats++;
                    
                    if (unreadstats>0)
                        tagsCountEl.html(unreadstats);
                    else
                        tagsCountEl.html('');
                    
                } );
            };
            updateStats(unread);
            
            $.ajax({
                url: $('base').attr('href') + (unread ? 'mark/' : 'unmark/') + id,
                type: 'POST',
                error: function(jqXHR, textStatus, errorThrown) {
                    // rollback ui changes
                    updateStats(!unread);
                    setButton(!unread);
                    alert('Can not mark/unmark item: '+errorThrown);
                },
                success: function() {
                    if ($(".nav-filter-unread").hasClass("active") && unread) {
                        if ($('#fullscreen-entry').is(':visible'))
                            $('#fullscreen-entry .entry-close').click();
                        parent.hide();
                    }
                }
            });
            
            return false;
        });
    }
};