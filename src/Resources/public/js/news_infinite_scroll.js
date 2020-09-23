/**
 * Contao News Infinite Scroll Bundle
 *
 * Copyright (c) 2020 Marko Cupic
 *
 * @author Marko Cupic <https://github.com/markocupic>
 *
 * @license LGPL-3.0+
 */

(function ($) {
        /**
         * @param {Object} options
         */
        ContaoNewsInfiniteScroll = function (options) {
            let _opts = $.extend({
                // Defaults

                // CSS selector: Define the parent news list container css selector
                newsContainer: '.mod_newslist_infinite_scroll',
                // CSS selector: Default to $(window)
                scrollContainer: $(window),
                // CSS selector: Pagination next  (<nav class="pagination block"><ul><li class="next"><a href="newslist.html?page_n343=2" class="next" title="Gehe zu Seite 2">Vorwärts</a></li></ul></nav>)
                paginationNextLink: '.pagination .next > a.next',
                // CSS selector: Pagination last  (<nav class="pagination block"><ul><li class="last"><a href="newslist.html?page_n343=44" class="last" title="Gehe zu Seite 44">Ende</a></li></ul></nav>)
                paginationLastLink: '.pagination .last > a.last',
                // When set to true, this will disable infinite scrolling and start firing ajax requests on domready with an interval of 3s
                loadAllOnDomready: false,
                // Use a "load more button" (Preserve the accessibility of the footer)
                // !!!! Important Set showLoadMoreButton to false, if you want to autoload items
                showLoadMoreButton: true,
                // Load more button markup
                // CSS selector: When you scroll and the window has reached the anchor point, requests will start
                anchorPoint: '.mod_newslist_infinite_scroll',
                // Distance in px from the top of the anchorPoint
                bottomPixels: 100,
                // Integer: Fading time for appending news items
                fadeInTime: 400,

                // Callbacks
                onInitialize: function (instance) {
                },
                onXHRStart: function (instance) {
                },
                onXHRComplete: function (response, instance, xhr) {
                    return response;
                },
                onXHRFail: function (instance, xhr) {
                },
                onBeforeAppendCallback: function (instance, xhr) {
                },
                onAppendCallback: function (instance, xhr) {
                }
            }, options || {});


            // Private properties
            let _self = this;
            let _newsContainer = null;
            let _anchorPoint = null;
            let _scrollContainer = null;
            let _arrUrls = [];
            let _blnLoadedAllItems = false;
            let _xhrInterval = 0;
            let _vueModel = null;

            // Public properties
            _self.blnHasError = false;
            _self.currentUrl = '';
            _self.urlIndex = 0;
            _self.response = '';
            _self.loadMoreBtn = null;
            _self.xhr = null;


            /** Public Methods **/
            /** Public Methods **/
            /** Public Methods **/


            /**
             * Get option
             *
             * @param option
             * @returns {boolean|*}
             * @public
             */
            this.getOption = function (option) {
                if (typeof _opts[option] !== 'undefined') {

                    return _opts[option];
                }
                return false;
            };


            /** Private Methods **/
            /** Private Methods **/
            /** Private Methods **/

            /**
             * Init function
             *
             * @private
             */
            let _initialize = async function () {
                // Trigger onInitialize-callback
                if (_opts.onInitialize(_self) !== true) {
                    return;
                }

                // newsContainer
                _newsContainer = $(_opts.newsContainer)[0];
                if (typeof _newsContainer === 'undefined') {
                    return;
                }


                // If there is no pagination, there are no news items to load
                if ($(_opts.newsContainer + ' ' + _opts.paginationNextLink).length === 0) {
                    // Skip initialization process
                    return;
                }

                // Get request urls from pagination links
                if ($(_opts.newsContainer + ' ' + _opts.paginationNextLink).length) {
                    // get first request url
                    let next = $(_opts.newsContainer + ' ' + _opts.paginationNextLink).first();
                    let hrefNext = $(next).prop('href');
                    // page_n(\\d*)=(\\d*)/g;
                    let paginationUrlRegexPattern = 'page_n(\\d*)=(\\d*)';
                    let regexpNext = new RegExp(paginationUrlRegexPattern, "g");
                    let matchNext = regexpNext.exec(hrefNext);
                    if (!matchNext) {
                        console.error('News infinite scroll initialization aborted! Could not find pagination link with pattern ' +
                            '"' + paginationUrlRegexPattern + '".'
                        );
                        // Skip initialization process
                        return;
                    }
                    let idModule = matchNext[1]
                    let idNext = matchNext[2];
                    let idLast = idNext;

                    // if the next url is same to last url there is no last url
                    if ($(_opts.newsContainer + ' ' + _opts.paginationLastLink).length > 0) {
                        // get last request url
                        let last = $(_opts.newsContainer + ' ' + _opts.paginationLastLink).first();
                        let hrefLast = $(last).prop('href');
                        // page_n(\\d*)=(\\d*)/g;
                        let regexpLast = new RegExp(paginationUrlRegexPattern, "g");
                        let matchLast = regexpLast.exec(hrefLast);
                        if (matchLast) {
                            // Overwrite idLast
                            idLast = matchLast[2];
                        }
                    }

                    // Generate all urls from first to last
                    for (i = idNext; i <= idLast; i++) {
                        let url = hrefNext.replace(regexpNext, 'page_n' + idModule + '=' + i);
                        _arrUrls.push(url);
                    }
                }

                // scrollContainer
                _scrollContainer = $(_opts.scrollContainer)[0];
                if (typeof _scrollContainer === 'undefined') {
                    console.error('ContaoNewsInfiniteScroll aborted! Please select a valid scroll container.');
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


                const vueInit = await _vueInit();
                const fetch = await _fetch(window.location.href);
                const rest = await _rest();


            };

            let _rest = async function () {
                // Load elements on domready or load them when scrolling to the bottom
                if (_opts.loadAllOnDomready === true) {
                    _load();
                    _xhrInterval = setInterval(_load, 3000);
                } else if (_opts.showLoadMoreButton === false) {
                    // load content by event scroll
                    $(_scrollContainer).on('scroll', function () {
                        if ($(_scrollContainer).scrollTop() > ($(_anchorPoint).offset().top + $(_anchorPoint).innerHeight() - $(_scrollContainer).height() - _opts.bottomPixels)) {
                            _load();
                        }
                    });
                }
            };


            /**
             *
             * @returns {{blnLoadingInProcess: boolean, articles: string}}
             * @private
             */
            let _vueInit = async function () {
                let appId = $(_newsContainer).prop('id');

                if (!appId) {
                    console.error(
                        'No css id defined for the news list container. ' +
                        'Please add a css id to the news_infinite_list module in the contao backend.'
                    );
                    return;
                }

                const vueData = {
                    data() {
                        return {
                            articles: '',
                            blnLoadingInProcess: false,
                            showLoadMoreButton: false,
                        };
                    },
                    methods: {
                        load: function (event) {
                            _load();
                        }
                    }
                }

                _vueModel = Vue.createApp(vueData).mount('#' + appId);

            }

            /**
             * Prepare fetch
             *
             * @private
             */
            let _load = function () {

                if (_vueModel.blnLoadingInProcess === true || _blnLoadedAllItems === true) {
                    return;
                }
                _self.blnHasError = false;

                _self.currentUrl = _arrUrls[_self.urlIndex];
                if (typeof _self.currentUrl !== 'undefined') {
                    _fetch(_self.currentUrl);
                } else {
                    _blnLoadedAllItems = true;
                    if (typeof _xhrInterval !== 'undefined') {
                        clearInterval(_xhrInterval);
                    }
                }
            };

            /**
             * Fetch data
             *
             * @param url
             * @returns {Promise<void>}
             * @private
             */
            let _fetch = async function (url) {
                _self.xhr = $.ajax({
                    url: url,
                    beforeSend: function () {
                        // Trigger onXHRStart-Callback
                        _opts.onXHRStart(_self);

                        // Set aria-busy property to true
                        $(_newsContainer).attr('aria-busy', 'true');

                        _vueModel.blnLoadingInProcess = true;
                        _vueModel.showLoadMoreButton = false;

                    }
                }).done(function (data) {
                    _self.blnHasError = false;
                    _self.response = data;

                    // Trigger onXHRComplete
                    _self.response = _opts.onXHRComplete(_self.response, _self, _self.xhr);

                    if (_self.blnHasError === false) {
                        _self.urlIndex++;
                        setTimeout(function () {

                            // If all items are loaded...
                            if (_arrUrls.length == _self.urlIndex) {
                                // Set _blnLoadedAllItems to true
                                _blnLoadedAllItems = true;
                                if (_opts.showLoadMoreButton === true) {
                                    _vueModel.showLoadMoreButton = false;
                                }

                                // Clear the autoloadInterval
                                if (typeof _xhrInterval !== 'undefined') {
                                    clearInterval(_xhrInterval);
                                }
                            } else {
                                if (_opts.showLoadMoreButton === true) {
                                    _vueModel.showLoadMoreButton = true;
                                }
                            }
                            _appendToDom();
                        }, 1000);
                    } else {
                        _fail();
                    }
                }).fail(function () {
                    _fail();
                }).always(function () {


                    setTimeout(function () {

                        // Set aria-busy propery to false
                        $(_newsContainer).attr('aria-busy', 'false');


                        _vueModel.blnLoadingInProcess = false
                    }, 1000);
                });

            };

            /**
             * Fail method
             *
             * @private
             */
            let _fail = function () {

                _vueModel.blnLoadingInProcess = false;
                // Trigger onXHRFail-callback
                _opts.onXHRFail(_self, _self.xhr);
            };

            /**
             * Append loaded articles to DOM
             * @private
             */
            let _appendToDom = function () {

                // Trigger onBeforeAppendCallback
                _opts.onBeforeAppendCallback(_self, _self.xhr);

                if (_self.response != '') {
                    // Append html to dom and fade in
                    let res = JSON.parse(_self.response);
                    _vueModel.articles = _vueModel.articles + res.data;
                }

                // Trigger onAppendCallback
                _opts.onAppendCallback(_self, _self.xhr);
            };

            // Start procedure
            _initialize();
        };
    }
)(jQuery);
