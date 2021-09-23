<?php

/**
 * Contao News Infinite Scroll Bundle
 *
 * Copyright (c) 2021 Marko Cupic
 *
 * @author Marko Cupic <https://github.com/markocupic/contao-news-infinite-scroll-bundle>
 *
 * @license LGPL-3.0+
 */

namespace Markocupic;

use Contao\BackendTemplate;
use Contao\CoreBundle\Exception\ResponseException;
use Contao\Environment;
use Contao\Input;
use Contao\ModuleNewsList;
use Patchwork\Utf8;
use Symfony\Component\HttpFoundation\Response;

/**
 * Display Infinite Scroll Newslist Module
 *
 * Class ModuleNewslistInfiniteScroll
 * @package Markocupic
 */
class ModuleNewslistInfiniteScroll extends ModuleNewsList
{
    /**
     * Display a wildcard in the back end
     *
     * @return string
     */
    public function generate()
    {
        if (TL_MODE === 'BE')
        {
            $objTemplate = new BackendTemplate('be_wildcard');
            $objTemplate->wildcard = '### ' . Utf8::strtoupper($GLOBALS['TL_LANG']['FMD']['contao_news_infinite_scroll'][0]) . ' ###';
            $objTemplate->title = $this->headline;
            $objTemplate->id = $this->id;
            $objTemplate->link = $this->name;
            $objTemplate->href = 'contao/main.php?do=themes&amp;table=tl_module&amp;act=edit&amp;id=' . $this->id;

            return $objTemplate->parse();
        }

        // Do not add the page to the search index on ajax calls
        // Send articles without a frame to the browser
        if (Environment::get('isAjaxRequest'))
        {
            global $objPage;
            $objPage->noSearch;

            $this->strTemplate = 'mod_newslist_infinite_scroll';
        }

        return parent::generate();
    }

    /**
     * Generate the module
     */
    protected function compile()
    {
        // Add Css Class
        $cssID = $this->cssID;
        $cssID[1] = $cssID[1] == '' ? 'ajaxCall' : $cssID[1] . ' ajaxCall';
        $this->cssID = $cssID;

        parent::compile();
        
        if (Environment::get('isAjaxRequest') && null !== Input::get('page_n'.$this->id) && null !== Input::get('ajaxCall'))
        {
            $this->Template->headline = '';
            $this->Template->pagination = '';
            $this->Template->archives = $this->news_archives;

            throw new ResponseException($this->Template->getResponse(true, true));
        }

        parent::compile();
    }
}
