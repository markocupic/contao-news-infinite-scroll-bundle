/**
 * ContaoNewsInfiniteScroll
 * https://github.com/markocupic/contao-news-infinite-scroll-bundle
 * Marko Cupic, Oberkirch (Switzerland)
 * Copyright 2017
 */

(function ($) {
    /**
     * @param {Object} options
     */
    ContaoNewsInfiniteScroll = function (options) {
        var _opts = $.extend({
            // Defaults

            // CSS selector: Append loaded items to this container
            newsContainer: '.mod_newslist_infinite_scroll',
            // CSS selector: Default to $(window)
            scrollContainer: $(window),
            // CSS selector: Pagination links (<a href="infinite?page_n193=5" class="link page-link" title="Gehe zu Seite 5">5</a>)
            paginationLinks: '.pagination .link',
            // When set to true, this will disable infinite scrolling and start firing ajax requests on domready with an interval of 3s
            loadAllOnDomready: false,
            // Use a "load more button"
            loadMoreButton: true,
            // Load more button
            loadMoreButtonMarkup: '<div><button>Load more</button></div>',
            // CSS selector: When you scroll and the window has reached the anchor point, requests will start
            anchorPoint: '.mod_newslist_infinite_scroll',
            // Distance in px from the top of the anchorPoint
            bottomPixels: 0,
            // Integer: Fading time for loades news items
            fadeInTime: 800,
            // HTML: Show this message during the loading process
            loadingInProcessContainer: '<div class="inf-scr-loading-in-process-container"><em>Loading...</em></div>',


            // Callbacks
            onInitialize: function (instance) {
            },
            onXHRStart: function (instance) {
            },
            onXHRComplete: function (response, instance) {
                return response;
            },
            onXHRFail: function (instance) {
            },
            onAppendCallback: function (instance) {
            }
        }, options || {});


        // Private variables
        var _self = this;
        var _newsContainer = null;
        var _anchorPoint = null;
        var _scrollContainer = null;
        var _blnLoadingInProcess = 0;
        var _arrUrls = [];
        var _blnLoadedAllItems = 0;
        var _xhrInterval = 0;

        // Public variables
        _self.blnHasError = false;
        _self.currentUrl = '';
        _self.urlIndex = 0;
        _self.response = '';
        _self.loadMoreBtn = null;


        /** Public Methods **/

        /**
         * Get option
         * @param option
         * @returns {boolean|string}
         */
        this.getOption = function (option) {
            if (typeof _opts[option] !== 'undefined') {

                return _opts[option];
            }
            return false;
        };

        /** Private Methods **/

        /**
         * Init function
         */
        var _initialize = function () {
            // Call onInitialize-callback
            if (_opts.onInitialize(_self) !== true) {
                return;
            }

            // newsContainer
            _newsContainer = $(_opts.newsContainer)[0];
            if (typeof _newsContainer === 'undefined') {
                return;
            }
            // Get urls from pagination
            $(_opts.newsContainer + ' ' + _opts.paginationLinks).each(function () {
                _arrUrls.push($(this).prop('href'));
            });

            // scrollContainer
            _scrollContainer = $(_opts.scrollContainer)[0];
            if (typeof _scrollContainer === 'undefined') {
                console.log('ContaoNewsInfiniteScroll aborted! Please select a valid scroll container.');
                return;
            }

            // Bottom Pixels
            if (_opts.bottomPixels == 0) {
                _opts.bottomPixels = 1;
            }

            // anchor points settings
            _anchorPoint = $(_newsContainer);
            if (typeof $(_opts.anchorPoint)[0] !== 'undefined') {
                _anchorPoint = $(_opts.anchorPoint)[0];
            }


            // Load elements on domready or load them when scrolling to the bottom
            if (_opts.loadAllOnDomready === true) {
                _load();
                _xhrInterval = setInterval(_load, 3000);
            }else if(_opts.loadMoreButton === true){
                _self.loadMoreBtn =  $(_opts.loadMoreButtonMarkup);
                _self.loadMoreBtn.insertAfter(_newsContainer)
                _self.loadMoreBtn.addClass('inf-scr-load-more-btn-container');
                _self.loadMoreBtn.click(function(event){
                    $(this).hide();
                    _load();
                });

            } else {
                // load content by event scroll
                $(_scrollContainer).on('scroll', function () {
                    if ($(_scrollContainer).scrollTop() > ($(_anchorPoint).offset().top + $(_anchorPoint).innerHeight() - $(_scrollContainer).height() - _opts.bottomPixels)) {
                        _load();
                    }
                });
            }
        };


        /**
         * Load html with xhr
         */
        var _load = function () {

            if (_blnLoadingInProcess == 1 || _blnLoadedAllItems == 1) return;
            _self.blnHasError = false;



            _self.currentUrl = _arrUrls[_self.urlIndex];
            if (typeof _self.currentUrl !== 'undefined') {
                $.ajax({
                    url: _self.currentUrl,
                    beforeSend: function () {
                        // Call onXHRStart-Callback
                        _opts.onXHRStart(_self);

                        // Set aria-busy propery to true
                        $(_newsContainer).attr('aria-busy', 'true');

                        _blnLoadingInProcess = 1;
                        if (_opts.loadingInProcessContainer != '') {
                            // Append Load Icon
                            $(_opts.loadingInProcessContainer).addClass('inf-scr-loading-in-process-container').insertAfter(_newsContainer).fadeIn(100);
                        }
                    }
                }).done(function (data) {
                    _self.blnHasError = false;
                    _self.response = data;
                    var html = _opts.onXHRComplete(_self.response, _self);
                    if (_self.blnHasError === false) {
                        _self.urlIndex++;
                        setTimeout(function () {
                            _appendToDom(html);
                        }, 1000);
                    } else {
                        _fail();
                    }
                }).fail(function () {
                    _fail();
                }).always(function () {
                    setTimeout(function () {
                        // Remove Load Icon
                        $('.inf-scr-loading-in-process-container').remove();

                        // Set aria-busy propery to false
                        $(_newsContainer).attr('aria-busy', 'false');

                        // If all items are loaded...
                        if (_arrUrls.length == _self.urlIndex) {
                            // Set _blnLoadedAllItems to true
                            _blnLoadedAllItems = 1;

                            // Remove the loadMoreButton
                            _self.loadMoreBtn.remove();
                            _self.loadMoreBtn = null;

                            // Clear the autoloadInterval
                            if (typeof _xhrInterval !== 'undefined') {
                                clearInterval(_xhrInterval);
                            }
                        }

                        if( _self.loadMoreBtn !== null)
                        {
                            _self.loadMoreBtn.show();
                        }

                        _blnLoadingInProcess = 0;
                    }, 1000);
                })
            } else {
                _blnLoadedAllItems = 1;
                if (typeof _xhrInterval !== 'undefined') {
                    clearInterval(_xhrInterval);
                }
            }
        };

        /**
         * Fail Method
         */
        var _fail = function () {

            _blnLoadingInProcess = 0;
            // Call onXHRFail-callback
            _opts.onXHRFail(_self);
        };

        /**
         * Append items to DOM
         * @param html
         */
        var _appendToDom = function (html) {
            // Append html to dom and fade in
            $(html).hide().appendTo(_newsContainer).fadeIn(_opts.fadeInTime);

            // Call onAppendCallback-callback
            _opts.onAppendCallback(_self);
        }
        // Start procedure
        _initialize();
    };
})(jQuery);
