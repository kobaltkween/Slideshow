/* Slideshow is basic JS, not requiring other libraries */

var makeSS = function(el, options) {
    // All the slideshows
    var $slideshows = document.querySelectorAll(el),
    // This slideshow
    $slideshow = {},

        Slideshow = {
            init(el, options) {
                /* Initialize slideshow */
                // Set the type for testing purposes
                this.type = "slideshow";
                // Start the counter at 0, like the arrays to loop through
                this.counter = 0;
                // Set the slideshow container
                this.el = el;
                // Collect all the slides - always in a "figure" tag
                this.$items = this.el.querySelectorAll("figure");
                // Total number of slides
                this.numItems = this.$items.length;
                // If options aren't passed in, then set it to an empty object
                options = options || {};

                // Set up the defaults
                this.opts = {
                        showTime: (typeof options.showTime === "undefined") ? 5000 : options.showTime, // Show images for 5 seconds while playing
                        autoPlay: (typeof options.autoPlay === "undefined") ? true : options.autoPlay, // Whether or not to start in play or pause
                        prevSel: (typeof options.prevSel === "undefined") ? ".ssControls .previous" : options.prevSel, // Selector string for the previous button
                        nextSel: (typeof options.nextSel === "undefined") ? ".ssControls .next" : options.nextSel, // Selector string for the next button
                        ppSel: (typeof options.ppSel === "undefined") ? ".ssControls .pp" : options.ppSel, // Selector string for the play/pause button
                        slideSelHolder: (typeof options.slideSelHolder === "undefined") ? ".ssControls" : options.slideSelHolder, // Selector string for the holder of slide selection buttons
                        activeClass: (typeof options.activeClass === "undefined") ? ".active" : options.activeClass, // Class to toggle for active/inactive items
                        slideSel: (typeof options.slideSel === "undefined") ? ".selector" : options.slideSel, //Selector string for each slide selection buttons
                        modal: (typeof options.modal === "undefined") ? false : options.modal // Whether or not to have the images popup as modals and link to fullsized versions
                    };

                // Set up the control elements
                this.pp = this.el.querySelector(this.opts.ppSel);
                this.prevBtn = this.el.querySelector(this.opts.prevSel);
                this.nextBtn = this.el.querySelector(this.opts.nextSel);
                var ssHolder = this.el.querySelector(this.opts.slideSelHolder);
                var slideSelector = ssHolder.querySelector(this.opts.slideSel);
                // Generate selectors
                for (var s = 1; s < this.numItems; s++) {
                    console.log(s);
                    newSel = slideSelector.cloneNode(false);
                    ssHolder.appendChild(newSel);
                }
                // Make the first one active
                slideSelector.classList.add(this.opts.activeClass); 
                this.selectors = Array.from(this.el.querySelector(this.opts.slideSelHolder).querySelectorAll(this.opts.slideSel));  // Make it an array, not a NodeTree object

                // Start the slideshow if autoPlay is on
                if (this.opts.autoPlay) {
                    // Make sure that the pp button has the active class
                    if (!this.pp.classList.contains(this.opts.activeClass)) {
                        this.pp.classList.add(this.opts.activeClass);
                    }
                    // Set the playing state
                    this.playing = true;
                    // Set the interval
                    this.interval = setInterval(function() {
                            var i = (this.counter + 1 === this.numItems) ? 0 : this.counter + 1;
                            this.selectSlide(i);
                        }.bind(this), this.opts.showTime);
                } else {
                    if (this.pp.classList.contains(this.opts.activeClass)) {
                        this.pp.classList.remove(this.opts.activeClass);
                    }
                    this.playing = false;
                }

                // Make the controls active
                this.activateControls();
            },
            togglePlay() {
                if (!this.playing) {
                    console.log("start playing");
                    // Set the interval
                    this.interval = setInterval(function() {
                            var i = (this.counter + 1 === this.numItems) ? 0 : this.counter + 1;
                            this.selectSlide(i);
                        }.bind(this), this.opts.showTime);
                    // Make playing variable true
                    this.playing = true;
                } else {
                    console.log("stop playing");
                    // Clear the interval
                    clearInterval(this.interval);
                    // Make playing variable false
                    this.playing = false;
                }
                // Either way, toggle the active class on the pp button
                this.pp.classList.toggle(this.opts.activeClass);
            },
            showCurrent() {
                /* Toggle active class
                 * Opacity transition will be handled by the CSS */
                // Remove active class from the first slide you find with it - should only be one
                current = this.el.querySelector("." + this.opts.activeClass);
                current.classList.remove(this.opts.activeClass);
                // Remove zoom eventListener from current slide
                // Add active class to the new slide
                this.$items[this.counter].classList.add(this.opts.activeClass);
                // Add zoom eventListener to new slide
            },
            selectSlide(i) {
                /* Change the slide using the selectors
                 * And their index */
                // Set the counter
                this.counter = i;
                // Show the new slide
                this.showCurrent();
                for (var j = 0; j < this.selectors.length; j++) {
                    if (j === i) {
                        // Add the active class to it
                        this.selectors[j].classList.add(this.opts.activeClass);
                        // Remove the listener from it
                        this.selectors[j].removeEventListener("click", this.selectSlide);
                    } else if (this.selectors[j].classList.contains(this.opts.activeClass)) {
                        // Remove the active class from the old selector
                        this.selectors[j].classList.remove(this.opts.activeClass);
                        // Add listener to the old selector - Need to find indexOf replacement
                        this.selectors[j].addEventListener("click", this.selectSlide.bind(this, j) , false);
                    }
                }
            },
            makeModal(e) {
                /* Popup a draggable modal of the full sized version of the image
                 * that was clicked.
                 * Reusable functions are defined within rather than at the object
                 * level due to limitations on the usage of .bind().
                 */

                 // Make a function to remove all parts of the modal
                 function removeModal(e) {
                    // Remove BG
                    body.removeChild(modalBG);
                    // Remove image and holder
                    body.removeChild(imgHolder);
                    body.removeChild(closeBtn);
                }

                // Make a function to fit the image to the screen in both height and width
                function fitImage(img, margin) {
                    console.log("margin: " + margin);
                    var maxWidth = (img.naturalWidth > (window.innerWidth - margin)) ? window.innerWidth - margin : img.naturalWidth
                    maxHeight = (img.naturalHeight > (window.innerHeight - margin)) ? window.innerHeight - margin : img.naturalHeight
                    scaleW = maxWidth / img.naturalWidth
                    scaleH = maxHeight / img.naturalHeight
                    scale = (scaleW > scaleH) ? scaleH : scaleW;
                    img.width = scale * img.naturalWidth;
                    console.log("image w: " + img.width);
                    img.height = scale * img.naturalHeight;
                    console.log("image h: " + img.height);
                }


                // Set the margin for the modal
                var margin = "35";

                var body = document.querySelector("body");
                // Create the modal background
                var modalBG = document.createElement("div");
                modalBG.id = "modalBG";
                body.appendChild(modalBG);
                modalBG.addEventListener("click", removeModal, false);

                // Create the image holder element
                var imgHolder = document.createElement("div");
                imgHolder.id = "imgHolder";
                // Make a button for closing the modal and add it to the holder
                var closeBtn = document.createElement("p");
                closeBtn.innerHTML = "X";
                closeBtn.id = "close";
                closeBtn.addEventListener("click", removeModal, false);
                body.appendChild(closeBtn);

                // Clone the image
                var image = e.target.cloneNode(true);
                // Resize the cloned image to fit the screen
                fitImage(image, margin);
                // Set the window to resize the image when it resizes
                window.addEventListener("onresize", fitImage.bind(null, image, margin), false);
                /* Make a link to the full sized image that opens in a new window/tab
                 * and also closes the modal
                 */
                var imgLink = document.createElement("a");
                imgLink.href = image.src;
                //imgLink.target = "_blank"; For some reason, this loses the image information
                imgLink.addEventListener("click", removeModal.bind(this), false);
                //  Add the image to the holder
                imgLink.appendChild(image);
                imgHolder.appendChild(imgLink);
                // Add the background and image holder to the document
                body.appendChild(imgHolder);

                // Pause the slideshow if it's playing
                if (this.playing) {
                    this.togglePlay();
                }
            },
            activateControls() {
                /* Add event listeners to prev and next buttons
                 * Add event listeners to the slide selectors */

                // Deal with previous button and left arrow key
                function prev(e, that = this) {
                    var i = (that.counter - 1 < 0) ? that.numItems - 1 : that.counter - 1;
                    that.selectSlide(i);
                }
                this.prevBtn.addEventListener("click", prev.bind(this), false);


                // Deal with next button and right arrow key
                function next(e, that = this) {
                    var i = (that.counter + 1 === that.numItems) ? 0 : that.counter + 1;
                    //console.log(that.type);
                    that.selectSlide(i);
                }
                this.nextBtn.addEventListener("click", next.bind(this), false);

                // Add next and previous functions to the arrow keys
                // NOTE: Had to explicitly pass "this" because binding did not work
                window.onkeydown = function (e) {
                        // Left arrow goes to previous
                        if (e.keyCode === 37) {
                            prev(e, this);
                        // Right arrow goes to next
                        } else if (e.keyCode === 39) {
                            next(e, this);
                        }
                    }.bind(this);

                // Add play/pause button listener
                this.pp.addEventListener("click", this.togglePlay.bind(this), false);

                // Make it stop playing on scroll
                window.onscroll = function(e) {
                        if (this.playing) {
                            this.togglePlay();
                        }
                    }.bind(this);

                // Add listeners to all but the active slide selector
                for (var i = 0; i < this.selectors.length; i++) {
                    if (!this.selectors[i].classList.contains(this.opts.activeClass)) {
                        this.selectors[i].addEventListener("click", this.selectSlide.bind(this, i), false);
                    }
                }
                if (this.opts.modal) {
                    // Add modal class to slideshow holder
                    this.el.classList.add("popup");
                    // Add listeners to all the slides to make modals
                    for (var i = 0; i < this.$items.length; i++) {
                        this.$items[i].querySelector("img").addEventListener("click", this.makeModal.bind(this), false);
                    }
                }
            },
        };

    /* Account for multiple instances of Slideshow */

    [].forEach.call($slideshows, function(el) {
        $slideshow = Object.create(Slideshow);
        $slideshow.init(el, options);
    });
};




