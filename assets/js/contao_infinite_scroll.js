"use strict";

/*
 * This file is part of Contao News Infinite Scroll Bundle.
 *
 * (c) Marko Cupic <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

const ContaoInfiniteScroll = {}

ContaoInfiniteScroll.Modes = {
    LOAD_MORE_BUTTON: 'load_more_button',
    AUTOLOAD_ON_DOMREADY: 'autoload_on_domready',
    INFINITE_SCROLL: 'infinite_scroll',
}

const DEFAULT_CONFIG = {
    loadingMode: ContaoInfiniteScroll.Modes.LOAD_MORE_BUTTON, scrollContainer: null, pagination: {
        selectorNext: 'nav.pagination li.next > a.next[href]', selectorLast: 'nav.pagination li.last > a.last[href]', paramPageRegex: 'page([_a-z]*)(\d*)',
    }, loadMoreButtonMarkup: '<div class="inf-scr-load-more-btn-container" role="button" tabindex="0"><span class="inf-scr-load-more-btn-inner">load more content</span></div>', loadingInProcessIndicatorMarkup: '<div class="inf-scr-loading-in-process-container"><span class="inf-scr-loading-in-process-inner">loading...</span></div>',
}

ContaoInfiniteScroll.Defaults = DEFAULT_CONFIG;

ContaoInfiniteScroll.Utils = {

    LEADING_SLASH_PATTERN: /^\//,

    /**
     * Normalizes a relative href to an absolute URL
     * @param {string|null} href - The href attribute value
     * @returns {string|null} Normalized absolute URL or null
     */
    normalizeUrl: function (href) {
        if (!href) return null;

        const normalized = href.replace(this.LEADING_SLASH_PATTERN, "");
        return window.location.origin + '/' + normalized;
    },

    /**
     * Use this method to get the urls from the pagination items
     *
     * @param elNextLink
     * @param elLastLink
     * @param paginationUrlParamRegexPattern
     * @returns {Array}
     */
    getUrlsFromPagination: function (elNextLink, elLastLink = null, paginationUrlParamRegexPattern) {
        let arrUrls = [];

        const hrefNext = this.normalizeUrl(elNextLink.getAttribute('href'));

        if (null === hrefNext) {
            console.warn('Infinite scroll initialization aborted! Could not find a valid pagination link.');
            return arrUrls;
        }

        const urlNext = new URL(hrefNext);
        const urlParamsNext = urlNext.searchParams;

        let paramPage = null;

        for (const key of urlParamsNext.keys()) {
            let regexpParamPage = new RegExp(paginationUrlParamRegexPattern, "g");
            if (regexpParamPage.exec(key)) {
                paramPage = key;
                break;
            }
        }

        if (null === paramPage) {
            console.error('Infinite scroll initialization aborted! Could not find pagination link with pattern "' + paginationUrlParamRegexPattern + '".');
            return arrUrls;
        }

        const pageIdNext = parseInt(urlParamsNext.get(paramPage));
        let pageIdLast = pageIdNext;

        if (elLastLink) {
            const hrefLast = this.normalizeUrl(elLastLink.getAttribute('href'));

            if (null !== hrefLast) {
                const urlLast = new URL(hrefLast);
                const urlParamsLast = urlLast.searchParams;

                if (urlParamsLast.has(paramPage)) {
                    pageIdLast = parseInt(urlParamsLast.get(paramPage));
                }
            }
        }

        for (let i = pageIdNext; i <= pageIdLast; i++) {
            urlParamsNext.set(paramPage, i.toString());
            arrUrls.push(urlNext.origin + urlNext.pathname + '?' + urlParamsNext.toString());
        }

        return arrUrls;
    }
}

class ContaoInfiniteScrollApp {

    /**
     * @param listItemsContainer
     * @param options
     */
    constructor(listItemsContainer, options) {
        this.#initialize(listItemsContainer, options);
    }

    // Public fields
    arrUrls = [];
    blnHasError = false;
    blnErrorMessage = '';
    urlIndex = 0;

    // Private fields
    #loadingMode = null;
    #opts = {};
    #container = null;
    #scrollContainer = null;
    #anchorPoint = null;
    #executionStoppedAfterInitialization = false;
    #blnLoadingInProcess = false;
    #blnAllItemsLoaded = false;
    #xhrInterval = null;
    #listeners = {
        'contao.infinite_scroll.initialize': [],
        'contao.infinite_scroll.xhr_start': [],
        'contao.infinite_scroll.xhr_complete': [],
        'contao.infinite_scroll.xhr_error': [],
        'contao.infinite_scroll.append': [],
        'contao.infinite_scroll.appended': [],
    }

    execute = () => {
        // Dispatch 'contao.infinite_scroll.initialize' event
        if (this.#hasListener('contao.infinite_scroll.initialize')) {
            if (false === this.#dispatchEvent('contao.infinite_scroll.initialize', [this])) {
                this.#executionStoppedAfterInitialization = true;
                return;
            }
        }

        // No urls found, abort!
        if (this.arrUrls.length === 0) {
            return;
        }

        // Handle various loading modes
        if (this.#loadingMode === ContaoInfiniteScroll.Modes.AUTOLOAD_ON_DOMREADY) {
            // Load more items
            this.load();

            this.#xhrInterval = setInterval(() => {
                this.load()
            }, 3000);

        } else if (this.#loadingMode === ContaoInfiniteScroll.Modes.LOAD_MORE_BUTTON) {
            this.#appendLoadMoreButtonAfterContainer();

        } else if (this.#loadingMode === ContaoInfiniteScroll.Modes.INFINITE_SCROLL) {
            const options = {
                // Set root to null to use the whole screen as the scroll area
                root: this.#scrollContainer,

                // Do not grow or shrink the root area
                rootMargin: '0px',

                // Threshold of 1.0 will fire callback when 100% of the element is visible
                threshold: 1.0
            };

            const observer = new IntersectionObserver((entries) => {
                // Callback to be fired
                // Entries is a list of elements out of our targets that reported a change.
                for (const entry of entries) {
                    // Only add to the list if the element is coming into the view, not leaving.
                    if (entry.isIntersecting) {
                        // Load more items
                        this.load();
                    }
                }
            }, options);

            observer.observe(this.#anchorPoint);

        } else {
            throw new Error(`${this.#loadingMode} is not a valid loading mode. Please choose one of these: "${Object.values(ContaoInfiniteScroll.Modes).join('", "')}".`);
        }
    }

    /**
     * Register listeners
     *
     * @param eventName
     * @param callback
     * @returns {ContaoInfiniteScrollApp.on}
     */
    on = (eventName, callback) => {
        if (!this.#listeners.hasOwnProperty(eventName)) {
            const validEventNames = Object.keys(this.#listeners).join('", "');
            const errorMessage = `${eventName} is not a valid event name. Please choose one of these: "${validEventNames}".`;
            throw new Error(errorMessage);
        }
        
        this.#listeners[eventName].push(callback);

        return this;
    };

    /**
     * @param option
     * @returns {*|boolean}
     */
    getOption = (option) => {
        if (typeof this.#opts[option] !== 'undefined') {
            return this.#opts[option];
        }

        return false;
    };

    /**
     * @returns {*}
     */
    getContainer = () => {
        return this.#container;
    }

    /**
     * Fetch more items from the server
     *
     * @returns {Promise<void>}
     */
    load = async () => {
        this.blnHasError = false;
        let responseText = '';

        if (this.#blnLoadingInProcess === true || this.#blnAllItemsLoaded === true) {
            return;
        }

        let currentUrl = this.arrUrls[this.urlIndex];

        if (typeof currentUrl !== 'undefined') {
            currentUrl = currentUrl + '&ajaxCall=true';

            // Set aria-busy property to true
            this.#container.setAttribute('aria-busy', 'true');
            this.#blnLoadingInProcess = true;
            this.#removeLoadMoreButton();
            this.#appendLoadingIndicatorAfterContainer();

            // Dispatch 'contao.infinite_scroll.xhr_start' event
            if (this.#hasListener('contao.infinite_scroll.xhr_start')) {
                this.#dispatchEvent('contao.infinite_scroll.xhr_start', [this, currentUrl]);
            }

            try {
                const response = await fetch(currentUrl, {
                    method: "GET", headers: {
                        'x-requested-with': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    throw `An error has occurred: ${response.status}`;
                }

                const json = await response.json();

                if (typeof json.status !== 'string' || json.status !== 'success') {
                    throw `Something went wrong. Status: ${json.status}.`;
                }

                responseText = json.data;

            } catch (error) {
                // Set aria-busy property to false
                this.#container.setAttribute('aria-busy', 'false');

                // Remove the "loading in progress indicator"
                this.#removeLoadingIndicator();

                // Again append the load more button to the DOM
                if (this.#loadingMode === ContaoInfiniteScroll.Modes.LOAD_MORE_BUTTON) {
                    this.#appendLoadMoreButtonAfterContainer();
                }

                this.#blnLoadingInProcess = false;

                this.#handleAjaxError(error);

                throw new Error(error);
            }

            // Dispatch 'contao.infinite_scroll.xhr_complete' event
            if (this.#hasListener('contao.infinite_scroll.xhr_complete')) {
                responseText = this.#dispatchEvent('contao.infinite_scroll.xhr_complete', [this, responseText]);
            }

            if (this.blnHasError === false) {
                this.urlIndex++;

                await new Promise(resolve => {
                    setTimeout(() => {
                        // Append the loaded content to the DOM and use a little timeout
                        this.#appendItemsToContainer(responseText);

                        resolve();
                    }, 1000);
                });
            }

            // Set the "aria-busy" property to false
            this.#container.setAttribute('aria-busy', 'false');

            // Remove the "loading in progress indicator"
            this.#removeLoadingIndicator();

            // If all items are loaded:
            if (this.arrUrls.length === this.urlIndex) {

                this.#blnAllItemsLoaded = true;

                // Remove the "load more button"
                this.#removeLoadMoreButton();

                // Clear the autoloader interval
                if (typeof this.#xhrInterval !== 'undefined') {
                    clearInterval(this.#xhrInterval);
                }
            } else {
                // Again append the load more button to the DOM
                if (this.#loadingMode === ContaoInfiniteScroll.Modes.LOAD_MORE_BUTTON) {
                    this.#appendLoadMoreButtonAfterContainer();
                }
            }

            this.#blnLoadingInProcess = false;

        }
    };

    /**
     * @param listItemsContainer
     * @param options
     * @returns {ContaoInfiniteScrollApp.initialize}
     */
    #initialize = function (listItemsContainer, options) {
        this.#container = listItemsContainer;

        this.#opts = {
            ...ContaoInfiniteScroll.Defaults, ...options ?? {},
        }

        // Set the loading mode
        this.#loadingMode = this.#opts['loadingMode'];

        if (!Object.values(ContaoInfiniteScroll.Modes).includes(this.#loadingMode)) {
            throw new Error(`${this.#loadingMode} is not a valid loading mode. Please choose one of these: "${Object.values(ContaoInfiniteScroll.Modes).join('", "')}".`);
        }

        if (!this.#container.querySelector(this.#opts['pagination']['selectorNext'])) {
            console.log('Infinite Scroll initialization process stopped because no url could be found in the pagination. The urls are needed to load further news items. Please check your pagination configuration inside your js_news_infinite_scroll.html.twig.');
            return;
        }

        // Retrieve urls from pagination
        this.arrUrls = ContaoInfiniteScroll.Utils.getUrlsFromPagination(this.#container.querySelector(this.#opts['pagination']['selectorNext']), this.#container.querySelector(this.#opts['pagination']['selectorLast']), this.#opts['pagination']['paramPageRegex']);

        // Set the anchor point
        this.#anchorPoint = this.#container.parentElement.querySelector('.infinite_scroll_anchor');

        return this;
    };

    /**
     * @param strEventName
     * @param args
     * @returns {*}
     */
    #dispatchEvent = function (strEventName, args = []) {
        let returnValue;

        for (let index = 0; index < this.#listeners[strEventName].length; index++) {
            returnValue = this.#listeners[strEventName][index](...args)
        }

        return returnValue;
    }

    /**
     * @param strEventName
     * @returns {boolean}
     */
    #hasListener = function (strEventName) {
        return this.#listeners[strEventName].length > 0;
    }

    /**
     * @param errorMsg
     */
    #handleAjaxError = function (errorMsg = '') {
        this.blnHasError = true;
        this.#blnLoadingInProcess = false;

        // Dispatch 'contao.infinite_scroll.xhr_error' event
        if (this.#hasListener('contao.infinite_scroll.xhr_error')) {
            this.#dispatchEvent('contao.infinite_scroll.xhr_error', [this, errorMsg]);
        }
    }

    /**
     * Append the loaded HTML to the container
     */
    #appendItemsToContainer = function (responseText) {
        // Create document fragment from response
        const template = document.createElement("template");
        template.innerHTML = responseText;
        let documentFragment = template.content;

        // Dispatch 'contao.infinite_scroll.append' event
        if (this.#hasListener('contao.infinite_scroll.append')) {
            documentFragment = this.#dispatchEvent('contao.infinite_scroll.append', [this, documentFragment]);
        }

        // Append document fragment to DOM
        this.#container.append(documentFragment);

        // Dispatch 'contao.infinite_scroll.appended' event
        if (this.#hasListener('contao.infinite_scroll.appended')) {
            this.#dispatchEvent('contao.infinite_scroll.appended', [this]);
        }
    }

    #appendLoadMoreButtonAfterContainer = () => {
        let loadMoreBtn = this.#container.querySelector('.inf-scr-load-more-btn-container');

        if (!loadMoreBtn) {
            // Append the load more button
            const loadMoreBtnTemplate = document.createElement("template");
            loadMoreBtnTemplate.innerHTML = this.#opts.loadMoreButtonMarkup;
            loadMoreBtn = loadMoreBtnTemplate.content.firstElementChild;
            this.#container.after(loadMoreBtn);
            loadMoreBtn.classList.add('inf-scr-load-more-btn-container');
            loadMoreBtn.setAttribute('data-display', loadMoreBtn.style.display !== '' ? loadMoreBtn.style.display : 'block');

            // Hide the button during the loading process
            const events = ['click', 'keydown'];

            for (const event of events) {
                loadMoreBtn.addEventListener(event, e => {
                    if (e.type === 'keydown' && e.keyCode !== 13) {
                        // Only react on "ENTER"
                        e.stopPropagation();
                        return;
                    }

                    loadMoreBtn.style.display = 'none';

                    // Load more items
                    this.load();
                }, {
                    'once': true,
                });
            }

        }
    }

    #removeLoadMoreButton = () => {
        const button = this.#container.parentNode.querySelector('.inf-scr-load-more-btn-container');

        if (button) {
            button.remove();
        }
    }

    #appendLoadingIndicatorAfterContainer = () => {
        let elLoadingIndicator = this.#container.querySelector('.inf-scr-loading-in-process-indicator');

        if (!elLoadingIndicator && this.#opts.loadingInProcessIndicatorMarkup !== '') {
            // Append the loading indicator after the container
            const indicatorTemplate = document.createElement("template");
            indicatorTemplate.innerHTML = this.#opts.loadingInProcessIndicatorMarkup;
            elLoadingIndicator = indicatorTemplate.content.firstElementChild;
            this.#container.after(elLoadingIndicator);
            elLoadingIndicator.classList.add('inf-scr-loading-in-process-indicator');
        }
    }

    #removeLoadingIndicator = () => {
        const indicators = this.#container.parentElement.querySelectorAll('.inf-scr-loading-in-process-indicator');

        for (const indicator of indicators) {
            indicator.remove();
        }
    }
}
