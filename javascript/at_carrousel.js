/**
 * Carrousel assignment AVROTROS
 * Daan Landwehr Johan
 *
 * dependencies: jquery 2.2.0
 */
$(function() { 

	/**
	 * construct the carrousel, get the variables from the data attributes 
	 * and if possible fallback to default value
	 */
	var AT_Carrousel = new function() {
        var _ = this;
		
		_.slidesUrl      = ($('#at_carrousel').data('slide-url'))?$('#at_carrousel').data('slide-url'):"";  // where to get the slideshowdata
		_.slideTime      = ($('#at_carrousel').data('slide-time'))?$('#at_carrousel').data('slide-time'):3000; // set the timeout for slideshow
		_.slideDirection = ($('#at_carrousel').data('slide-direction'))?$('#at_carrousel').data('slide-direction'):-1; // 1 right, -1 left
		_.slideIndex     = ($('#at_carrousel').data('slide-index'))?$('#at_carrousel').data('slide-index'):0; // start with the n-th item
		_.slideAuto      = ($('#at_carrousel').data('slide-auto'))?$('#at_carrousel').data('slide-auto'):false;	// start the slideshow automaticly	
		_.slideWidth     = $('#at_carrousel').width(); // gets the width from the element
		_.slideMouse     = {}; // used for mouse move coordinates
    }
	
    /**
     * get the slide data from the external json file
     */
    AT_Carrousel.getSlides = function() {
        var _ = this;
		
		$('#at_carrousel').append('<ul></ul>');
	
        $.getJSON(_.slidesUrl, function(data ) {
            _.slideData = data;
            $('#at_carrousel ul').append( _.createSlide());
        }).done(function() {
            _.setControls(); // set the control items
			if(_.slideAuto) _.startSlideshow(); // automaticly start 
        }).fail(function() {
            console.log("error in receiving data");  // could be the data is mallformed or url is incorrect
        }).error(function(XHR, txtStatus, errorThrown) {
			// show the thrown error in the console
            console.log("error " + txtStatus);
            console.log("Data " + XHR.responseText);
			console.log("errorThrown "+errorThrown);
        });

    }
	
	/**
	 * create control elements
	 */
    AT_Carrousel.setControls = function() {
        var _ = this;
		
        $('#at_carrousel ul').after(
			$('<div class="previous" data-direction="1"><<</div>').add('<div class="next" data-direction="-1">>></div>')
			.click(function() {
                _.slide($(this).data('direction'));
            })
        );
    }	
	
	/**
	 * get the slide data and create a new slide element based on the current slide index
	 */
    AT_Carrousel.createSlide = function() {
        var _ = this;
        
        if(_.slideIndex>=_.slideData.length) _.slideIndex = 0; // check if index not above amount of items
        if(_.slideIndex< 0) _.slideIndex = _.slideData.length-1; // check if index is not below 0 
        value = _.slideData[_.slideIndex]; // get data
		
		newSlide = $('<li>').html("<h3>"+value.title+"</h3>"+value.encoded.__cdata)
			.mousedown(function(){_.mouseDown = true;})
			.mousemove(function(event){if(_.mouseDown) _.mouseDirection(event);})
			.mouseup(function(){_.mouseDown = false;})
			.mouseout(function(){_.mouseDown = false;})		
			.click(function() {
				if(!$('#at_carrousel ul li').first().is(':animated')) { // prevents click on slide
					document.location = value.link;
				}
			}); 
		
		return newSlide; // return the new slide element
    }

	/*
	 * slide the carrousel items in the desired direction
	 */
    AT_Carrousel.slide = function(direction) {
        var _ = this;
		
		// clear mousedirection
		_.mouseDown = false;
		_.slideMouse = {};
		
		// check if other slide is running
		if(!$('#at_carrousel ul li').first().is(':animated')) {
			_.slideIndex = _.slideIndex+direction
			if(direction===1) { 
				$('#at_carrousel ul').prepend( _.createSlide()); // add item before current
				$('#at_carrousel ul li').css('left', -_.slideWidth); // position out of view	
				slideRemove = $('#at_carrousel ul li').last(); // set wich item to remove 
			} else {
				$('#at_carrousel ul').append( _.createSlide()); // add item after current
				slideRemove = $('#at_carrousel ul li').first(); // set wich item to remove 
			}
			$('#at_carrousel ul li')
				.animate({ left: "+="+(_.slideWidth*direction)+"px"}, "slow",
					function() { 
						$(this).css('left',0);
						slideRemove.remove(); // remove the old item after animation finished
					});
		}
		if(_.slideAuto) _.startSlideshow(); // restart interval
    }

	/**
	 * set interval to slide the carrousel automaticly
	 */
	AT_Carrousel.startSlideshow = function() {
		var _ = this;
		
		if(_.slideTimeout)  clearTimeout(_.slideTimeout); // clear inteval if exists
		
		_.slideTimeout = setTimeout(function(){ _.slide(_.slideDirection);},_.slideTime); // start slideshow
	}

	/**
	 * slide in mousedirection
	 */
	AT_Carrousel.mouseDirection = function(event) {
		var _ = this;

		if (typeof(_.slideMouse.x) != 'undefined') {
			var diffX = _.slideMouse.x - event.clientX; // determin the changes from the mouse x-coordinates
			if (diffX > 0) {
				_.slide(-1); //left if the difference greater than 0
				return;
			} else if (diffX < 0) {
				_.slide(1); //right if the difference lesser than 0
				return;
			} // else not moving
		} 	
		_.slideMouse = {
			x : event.clientX,
			y : event.clientY
		};			
	}
	
	// check if all is in place then start the carrousel
    if((AT_Carrousel.slidesUrl)&&(document.getElementById('at_carrousel'))) {
		AT_Carrousel.getSlides();
	} else {
		console.log('could not create carrousel');
	}
});