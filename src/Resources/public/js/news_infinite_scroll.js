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
                // CSS selector: Default to window
                scrollContainer: window,
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
             * Initialize application
             * @returns {Promise<void>}
             * @private
             */
            const _initialize = async function () {

                // Trigger onInitialize-callback
                if (_opts.onInitialize(_self) !== true) {
                    return;
                }

                // newsContainer
                _newsContainer = document.querySelector(_opts.newsContainer);
                if (!_newsContainer) {
                    return;
                }

                // If there is no pagination, there are no news items to load
                if (!document.querySelector(_opts.newsContainer + ' ' + _opts.paginationNextLink)) {
                    // Skip initialization process
                    return;
                }

                // Get request urls from pagination links
                if (document.querySelector(_opts.newsContainer + ' ' + _opts.paginationNextLink)) {
                    // get first request url
                    const next = document.querySelector(_opts.newsContainer + ' ' + _opts.paginationNextLink);
                    const hrefNext = next.getAttribute('href');

                    // page_n(\\d*)=(\\d*)/g;
                    const paginationUrlRegexPattern = 'page_n(\\d*)=(\\d*)';
                    const regexpNext = new RegExp(paginationUrlRegexPattern, "g");

                    const matchNext = regexpNext.exec(hrefNext);
                    if (!matchNext) {
                        console.error(`News infinite scroll initialization aborted! Could not find pagination link with pattern ${paginationUrlRegexPattern}.`);
                        // Skip initialization process
                        return;
                    }
                    const idModule = matchNext[1];
                    const idNext = matchNext[2];
                    let idLast = idNext;

                    // if the next url is same to last url there is no last url
                    if (document.querySelector(_opts.newsContainer + ' ' + _opts.paginationLastLink)) {
                        // get last request url
                        const last = document.querySelector(_opts.newsContainer + ' ' + _opts.paginationLastLink);
                        const hrefLast = last.getAttribute('href');
                        // page_n(\\d*)=(\\d*)/g;
                        const regexpLast = new RegExp(paginationUrlRegexPattern, "g");
                        const matchLast = regexpLast.exec(hrefLast);
                        if (matchLast) {
                            // Overwrite idLast
                            idLast = matchLast[2];
                        }
                    }

                    // Generate all urls from first to last
                    for (i = idNext; i <= idLast; i++) {
                        const url = hrefNext.replace(regexpNext, 'page_n' + idModule + '=' + i);
                        _arrUrls.push(url);
                    }
                }

                // scrollContainer
                _scrollContainer = window === _opts.scrollContainer ? window : document.querySelector(_opts.scrollContainer);
                if (!_scrollContainer) {
                    console.error('ContaoNewsInfiniteScroll aborted! Please select a valid scroll container.');
                    return;
                }

                // Bottom Pixels
                if (_opts.bottomPixels === 0) {
                    _opts.bottomPixels = 1;
                }

                // anchor points settings
                _anchorPoint = _newsContainer;
                if (document.querySelector(_opts.anchorPoint)) {
                    _anchorPoint = document.querySelector(_opts.anchorPoint);
                }

                // Instantiate the vue container
                await _vueInit();

                // Call initial request
                await _load(true);

                // Load elements on domready or load them when scrolling to the bottom
                if (_opts.loadAllOnDomready === true) {
                    _opts.showLoadMoreButton = false;
                    _load();
                    _xhrInterval = setInterval(_load, 3000);
                } else if (_opts.showLoadMoreButton === false) {

                    // load content when user scrolls an reaches the anchor point
                    _scrollContainer.addEventListener('scroll', function () {
                        let scrContScrollTop = window === _scrollContainer ? _scrollContainer.scrollY : _scrollContainer.scrollTop;
                        let scrContOffsetHeight = window === _scrollContainer ? _scrollContainer.innerHeight : _scrollContainer.offsetHeight;

                        if (Math.floor(scrContScrollTop) > (_anchorPoint.offsetTop + _anchorPoint.offsetHeight - scrContOffsetHeight - _opts.bottomPixels)) {
                            _load();
                        }
                    });
                }
            };


            /**
             * Initialize vue.js app
             * @returns {Promise<{blnLoadingInProcess: boolean, showLoadMoreButton: boolean, articles: string}>}
             * @private
             */
            const _vueInit = async function () {
                const appId = _newsContainer.getAttribute('id');

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
             * @param initialReq
             * @returns {Promise<void>}
             * @private
             */
            const _load = async function (initialReq = false) {

                if (_vueModel.blnLoadingInProcess === true || _blnLoadedAllItems === true) {
                    return;
                }
                _self.blnHasError = false;

                _self.currentUrl = _arrUrls[_self.urlIndex];
                if (initialReq === true) {
                    _self.currentUrl = window.location.href;
                }

                if (typeof _self.currentUrl === 'undefined') {
                    throw new Error('Invalid url.')
                }

                const response = await _fetch(_self.currentUrl);

                _self.blnHasError = false;

                // Trigger onXHRComplete
                _self.response = _opts.onXHRComplete(response, _self, _self.xhr);

                if(!initialReq)
                {
                    _self.urlIndex++;
                }

                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 1000); // resolve after 1 second
                }).then((result) => {

                    // If all items are loaded...
                    if (_arrUrls.length <= _self.urlIndex) {

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
                    _vueModel.blnLoadingInProcess = false;

                    _appendToDom();

                });

            };


            /**
             * Fetch data from server
             * @param url
             * @returns {Promise<any>}
             * @private
             */
            const _fetch = async function (url) {
                try {
                    // Trigger onXHRStart-Callback
                    const onXhrStart = await _opts.onXHRStart(_self);

                    // Set aria-busy property to true
                    _newsContainer.setAttribute('aria-busy', 'true');

                    _vueModel.blnLoadingInProcess = true;
                    _vueModel.showLoadMoreButton = false;

                    _self.xhr = await fetch(url, {
                        headers: {
                            'x-requested-with': 'XMLHttpRequest'
                        }
                    });

                    // Handle errors
                    if (!_self.xhr.ok) {
                        _fail();
                        throw new Error(`An error has occured: ${_self.xhr.status}`);
                    }

                    const data = await _self.xhr.json();

                    _newsContainer.setAttribute('aria-busy', 'false');

                    return data;

                } catch (error) {
                    throw new Error('An error occured, while using fetch.');
                }

            };

            /**
             * Fail-method
             * @private
             */
            const _fail = function () {

                _vueModel.blnLoadingInProcess = false;

                // Set aria-busy property to false
                _newsContainer.setAttribute('aria-busy', 'false');

                // Trigger onXHRFail-callback
                _opts.onXHRFail(_self, _self.xhr);
            };

            /**
             * Append loaded articles to DOM
             * @private
             */
            const _appendToDom = function () {

                // Trigger onBeforeAppendCallback
                _opts.onBeforeAppendCallback(_self, _self.xhr);

                if (_self.response.data !== '') {
                    // Append html to dom
                    _vueModel.articles = _vueModel.articles + _self.response.data;
                }

                // Trigger onAppendCallback
                _opts.onAppendCallback(_self, _self.xhr);
            };

            // Start procedure
            _initialize();
        };
    }
)(jQuery);
