<?php

/*
 * This file is part of Contao News Infinite Scroll Bundle.
 *
 * (c) Marko Cupic 2023 <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

namespace Markocupic;

use Contao\BackendTemplate;
use Contao\CoreBundle\Exception\ResponseException;
use Contao\Environment;
use Contao\Input;
use Contao\ModuleNewsList;
use Contao\System;
use Symfony\Component\HttpFoundation\JsonResponse;

class ModuleNewslistInfiniteScroll extends ModuleNewsList
{
    protected bool $ajaxCall = false;

    /**
     * Display a wildcard in the back end
     */
    public function generate(): string
    {
        $request = System::getContainer()->get('request_stack')->getCurrentRequest();

        if ($request && System::getContainer()->get('contao.routing.scope_matcher')->isBackendRequest($request)) {
            $objTemplate = new BackendTemplate('be_wildcard');
            $objTemplate->wildcard = '### '.$GLOBALS['TL_LANG']['FMD']['contao_news_infinite_scroll'][0].' ###';
            $objTemplate->title = $this->headline;
            $objTemplate->id = $this->id;
            $objTemplate->link = $this->name;
            $objTemplate->href = 'contao/main.php?do=themes&amp;table=tl_module&amp;act=edit&amp;id='.$this->id;

            return $objTemplate->parse();
        }

        // Do not add the page to the search index on ajax calls
        // Send articles without a frame to the browser

        if ($this->isAjaxRequest()) {
            $this->ajaxCall = true;
            global $objPage;
            $objPage->noSearch;

            // Load the template for ajax requests
            $this->strTemplate = '_mod_newslist_infinite_scroll_ajax';
        }

        return parent::generate();
    }

    /**
     * Generate the module
     */
    protected function compile()
    {
        // Add CSS Class
        $cssID = $this->cssID;
        $cssID[1] = trim($cssID[1].' ajaxCall');
        $this->cssID = $cssID;

        parent::compile();

        if ($this->isAjaxRequest()) {
            $this->Template->headline = '';
            $this->Template->pagination = '';
            $this->Template->archives = $this->news_archives;

            $json = [
                'status' => 'success',
                'uri'    => Environment::get('uri'),
                'data'   => $this->Template->getResponse(true, true)->getContent(),
            ];

            throw new ResponseException(new JsonResponse($json));
        }

        parent::compile();
    }

    /**
     * Checks whether the request is an AJAX request for this module
     */
    private function isAjaxRequest(): bool
    {
        return Environment::get('isAjaxRequest') && null !== Input::get('page_n'.$this->id) && null !== Input::get('ajaxCall');
    }
}
